"use client"

import { useCallback, useMemo, useState } from 'react'
import type { ConversationSummary, AIProviderId } from '@/lib/ai/types'
import { aiService } from '@/lib/ai/service'
import { logger } from '@/lib/logger'
import type { ChatMessage } from '@/lib/ai/chat/types'
import { mapConversationMessages } from '@/lib/ai/chat/mappers'

interface SelectConversationOptions {
  conversationId: string
  fallbackProvider: AIProviderId
  fallbackModel?: string
}

interface SelectConversationResult {
  messages: ChatMessage[]
  conversation?: ConversationSummary
}

interface UseAiChatHistoryResult {
  history: ConversationSummary[]
  selectedConversationId?: string
  isLoadingHistory: boolean
  loadHistory: (userId: string) => Promise<void>
  selectConversation: (options: SelectConversationOptions) => Promise<SelectConversationResult>
  deleteConversation: (conversationId: string) => Promise<void>
  upsertConversation: (conversation: ConversationSummary) => void
  setSelectedConversation: (conversationId?: string) => void
  reset: () => void
}

export function useAiChatHistory(): UseAiChatHistoryResult {
  const [history, setHistory] = useState<ConversationSummary[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const loadHistory = useCallback(async (userId: string) => {
    setIsLoadingHistory(true)
    try {
      const conversations = await aiService.loadHistory(userId)
      setHistory(conversations)
    } catch (error) {
      logger.error('AiChatHistory', 'Failed to load chat history', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  const selectConversation = useCallback(
    async ({ conversationId, fallbackProvider, fallbackModel }: SelectConversationOptions) => {
      setSelectedConversationId(conversationId)
      try {
        const conversationMessages = await aiService.loadConversationMessages(conversationId)
        const messages = mapConversationMessages(conversationMessages, {
          provider: fallbackProvider,
          model: fallbackModel,
        })

        const conversation = history.find((item) => item.id === conversationId)

        return { messages, conversation }
      } catch (error) {
        logger.error('AiChatHistory', 'Failed to load conversation messages', error)
        throw error
      }
    },
    [history],
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await aiService.deleteConversation(conversationId)
        setHistory((prev) => prev.filter((conversation) => conversation.id !== conversationId))
        setSelectedConversationId((prev) => (prev === conversationId ? undefined : prev))
      } catch (error) {
        logger.error('AiChatHistory', 'Failed to delete conversation', error)
        throw error
      }
    },
    [],
  )

  const upsertConversation = useCallback((conversation: ConversationSummary) => {
    setHistory((prev) => {
      const others = prev.filter((item) => item.id !== conversation.id)
      return [conversation, ...others]
    })
  }, [])

  const setSelectedConversation = useCallback((conversationId?: string) => {
    setSelectedConversationId(conversationId)
  }, [])

  const reset = useCallback(() => {
    setHistory([])
    setSelectedConversationId(undefined)
    setIsLoadingHistory(false)
  }, [])

  return useMemo(
    () => ({
      history,
      selectedConversationId,
      isLoadingHistory,
      loadHistory,
      selectConversation,
      deleteConversation,
      upsertConversation,
      setSelectedConversation,
      reset,
    }),
    [
      history,
      selectedConversationId,
      isLoadingHistory,
      loadHistory,
      selectConversation,
      deleteConversation,
      upsertConversation,
      setSelectedConversation,
      reset,
    ],
  )
}
