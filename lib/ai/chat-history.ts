'use client'

import { createClient } from '@/lib/supabase-client'
import { logger } from '@/lib/logger'
import type {
  ChatHistoryProvider,
  ConversationMessage,
  ConversationSummary
} from './types'

const LOCAL_STORAGE_KEY = 'optimal-ai-chat-history'

export class LocalStorageChatHistory implements ChatHistoryProvider {
  async saveConversation(conversation: ConversationSummary, messages: ConversationMessage[]) {
    if (typeof window === 'undefined') return

    const data = this.read()
    data.conversations[conversation.id] = {
      conversation,
      messages
    }
    this.write(data)
  }

  async loadConversations(_userId?: string): Promise<ConversationSummary[]> {
    if (typeof window === 'undefined') return []
    const data = this.read()
    return Object.values(data.conversations).map((entry) => entry.conversation)
  }

  async loadMessages(conversationId: string): Promise<ConversationMessage[]> {
    if (typeof window === 'undefined') return []
    const data = this.read()
    return data.conversations[conversationId]?.messages ?? []
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (typeof window === 'undefined') return
    const data = this.read()
    delete data.conversations[conversationId]
    this.write(data)
  }

  private read() {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!raw) return { conversations: {} as Record<string, { conversation: ConversationSummary; messages: ConversationMessage[] }> }
      return JSON.parse(raw)
    } catch (error) {
      logger.error('LocalStorageChatHistory', 'Failed to read chat history from local storage', error)
      return { conversations: {} as Record<string, { conversation: ConversationSummary; messages: ConversationMessage[] }> }
    }
  }

  private write(data: any) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      logger.error('LocalStorageChatHistory', 'Failed to write chat history to local storage', error)
    }
  }
}

export class SupabaseChatHistory implements ChatHistoryProvider {
  private readonly localFallback = new LocalStorageChatHistory()

  private async client() {
    return createClient()
  }

  async saveConversation(conversation: ConversationSummary, messages: ConversationMessage[]) {
    const supabase = await this.client()
    if (!supabase) {
      await this.localFallback.saveConversation(conversation, messages)
      return
    }

    try {
      const userId = conversation.metadata?.userId
      if (!userId) {
        logger.warn('SupabaseChatHistory', 'Missing userId metadata, storing conversation locally only', {
          conversationId: conversation.id
        })
        await this.localFallback.saveConversation(conversation, messages)
        return
      }

      await supabase.from('ai_conversations').upsert(
        {
          id: conversation.id,
          user_id: userId,
          provider: conversation.provider,
          model: conversation.model,
          title: conversation.title,
          metadata: conversation.metadata,
          updated_at: conversation.updatedAt
        },
        { onConflict: 'id' }
      )

      for (const message of messages) {
        await supabase.from('ai_messages').upsert(
          {
            id: message.id,
            conversation_id: conversation.id,
            role: message.role,
            content: message.content,
            metadata: message.metadata,
            provider: message.provider ?? conversation.provider,
            model: message.model ?? conversation.model,
            created_at: message.createdAt
          },
          { onConflict: 'id' }
        )
      }
    } catch (error) {
      logger.error('SupabaseChatHistory', 'Failed to save chat history, falling back to local storage', error)
      await this.localFallback.saveConversation(conversation, messages)
    }
  }

  async loadConversations(userId: string): Promise<ConversationSummary[]> {
    const supabase = await this.client()
    if (!supabase) {
      return this.localFallback.loadConversations(userId)
    }

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return (
        data?.map((row: any) => ({
          id: row.id,
          title: row.title,
          provider: row.provider,
          model: row.model,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          metadata: row.metadata
        })) ?? []
      )
    } catch (error) {
      logger.error('SupabaseChatHistory', 'Failed to load conversations, using local storage', error)
      return this.localFallback.loadConversations(userId)
    }
  }

  async loadMessages(conversationId: string): Promise<ConversationMessage[]> {
    const supabase = await this.client()
    if (!supabase) {
      return this.localFallback.loadMessages(conversationId)
    }

    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return (
        data?.map((row: any) => ({
          id: row.id,
          conversationId: row.conversation_id,
          role: row.role,
          content: row.content,
          createdAt: row.created_at,
          metadata: row.metadata,
          provider: row.provider,
          model: row.model
        })) ?? []
      )
    } catch (error) {
      logger.error('SupabaseChatHistory', 'Failed to load messages, using local storage', error)
      return this.localFallback.loadMessages(conversationId)
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const supabase = await this.client()
    if (!supabase) {
      await this.localFallback.deleteConversation(conversationId)
      return
    }

    try {
      await supabase.from('ai_messages').delete().eq('conversation_id', conversationId)
      await supabase.from('ai_conversations').delete().eq('id', conversationId)
      await this.localFallback.deleteConversation(conversationId)
    } catch (error) {
      logger.error('SupabaseChatHistory', 'Failed to delete conversation in Supabase', error)
      await this.localFallback.deleteConversation(conversationId)
    }
  }
}
