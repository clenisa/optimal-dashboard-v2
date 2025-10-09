"use client"

import { useCallback } from 'react'
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'
import type { ConversationSummary } from '@/lib/ai/types'
import { aiService } from '@/lib/ai/service'
import { logger } from '@/lib/logger'
import type { ChatMessage, UserCredits } from '@/lib/ai/chat/types'
import type { AIProviderId } from '@/lib/ai/types'
import { calculateCreditsFromUsd, createConversationId, generateMessageId } from '@/lib/ai/chat/utils'
import type { User } from '@supabase/supabase-js'

const INITIAL_CREDIT_DEPOSIT = 1

interface UseAiChatSendMessageArgs {
  inputValue: string
  setInputValue: (value: string) => void
  messages: ChatMessage[]
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  user: User | null
  activeModel?: string
  activeProvider: AIProviderId
  credits: UserCredits | null
  selectedConversationId?: string
  spend: (args: {
    userId: string
    amount: number
    conversationId: string
    provider: AIProviderId
    metadata?: Record<string, unknown>
  }) => Promise<UserCredits | null>
  refund: (args: { userId: string; amount: number; reason: string }) => Promise<UserCredits | null>
  setError: (message: string | null) => void
  upsertConversation: (conversation: ConversationSummary) => void
  setSelectedConversation: (conversationId: string) => void
}

export function useAiChatSendMessage({
  inputValue,
  setInputValue,
  messages,
  setMessages,
  isGenerating,
  setIsGenerating,
  user,
  activeModel,
  activeProvider,
  credits,
  selectedConversationId,
  spend,
  refund,
  setError,
  upsertConversation,
  setSelectedConversation,
}: UseAiChatSendMessageArgs) {
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isGenerating || !user) return
    if (!activeModel) {
      setError('Select a model before sending a message.')
      return
    }

    if (!credits || credits.total_credits <= 0) {
      setError('No credits remaining. Purchase more credits to continue chatting.')
      return
    }

    const conversationId = createConversationId(selectedConversationId)

    const postDeposit = await spend({
      userId: user.id,
      amount: INITIAL_CREDIT_DEPOSIT,
      conversationId,
      provider: activeProvider,
      metadata: {
        model: activeModel,
        type: 'initial_deposit',
      },
    })

    if (!postDeposit) {
      setError('Failed to deduct credits. Please try again.')
      return
    }

    const timestamp = new Date()
    const userMessage: ChatMessage = {
      id: generateMessageId('user'),
      role: 'user',
      content: inputValue.trim(),
      timestamp,
      provider: activeProvider,
      model: activeModel,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInputValue('')
    setIsGenerating(true)
    setError(null)

    try {
      const chatHistory = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }))

      const { result, conversation } = await aiService.sendMessage({
        provider: activeProvider,
        model: activeModel,
        userId: user.id,
        userEmail: user.email,
        conversationId,
        messages: chatHistory,
      })

      const costCredits = activeProvider === 'openai'
        ? calculateCreditsFromUsd(result.message.costUSD)
        : INITIAL_CREDIT_DEPOSIT

      const additionalCredits = costCredits - INITIAL_CREDIT_DEPOSIT
      if (additionalCredits > 0) {
        await spend({
          userId: user.id,
          amount: additionalCredits,
          conversationId,
          provider: activeProvider,
          metadata: {
            model: activeModel,
            type: 'usage_adjustment',
            costUSD: result.message.costUSD,
            usage: result.message.usage,
          },
        })
      } else if (additionalCredits < 0) {
        await refund({
          userId: user.id,
          amount: Math.abs(additionalCredits),
          reason: 'AI chat credit adjustment',
        })
      }

      const assistantMessage: ChatMessage = {
        id: result.message.id,
        role: 'assistant',
        content: result.message.content,
        timestamp: new Date(),
        provider: result.provider,
        model: result.model,
        metadata: result.message.metadata,
        costUSD: result.message.costUSD,
        usageSummary: result.message.usage
          ? `${result.message.usage.totalTokens} tokens`
          : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setSelectedConversation(conversation.id)

      upsertConversation({
        ...conversation,
        updatedAt: new Date().toISOString(),
      })
    } catch (sendError) {
      logger.error('AiChatSendMessage', 'Error generating AI response', sendError)
      setError(
        sendError instanceof Error
          ? sendError.message
          : 'We encountered an issue communicating with the AI provider.',
      )
      await refund({
        userId: user.id,
        amount: INITIAL_CREDIT_DEPOSIT,
        reason: 'AI chat refund (failed request)',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    inputValue,
    isGenerating,
    user,
    activeModel,
    credits,
    selectedConversationId,
    spend,
    messages,
    activeProvider,
    refund,
    setError,
    setInputValue,
    setIsGenerating,
    setMessages,
    upsertConversation,
    setSelectedConversation,
  ])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void sendMessage()
      }
    },
    [sendMessage],
  )

  return { sendMessage, handleKeyDown }
}
