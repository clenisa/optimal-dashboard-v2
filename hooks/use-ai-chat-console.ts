"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AIProviderId } from '@/lib/ai/types'
import { logger } from '@/lib/logger'
import type { ChatMessage } from '@/lib/ai/chat/types'
import { useAiChatCredits } from './use-ai-chat-credits'
import { useAiChatProviders } from './use-ai-chat-providers'
import { useAiChatHistory } from './use-ai-chat-history'
import { useSupabaseUser } from './use-supabase-user'
import { useAiChatSendMessage } from './use-ai-chat-send-message'

interface UseAiChatConsoleResult {
  user: ReturnType<typeof useSupabaseUser>
  credits: ReturnType<typeof useAiChatCredits>['credits']
  providers: ReturnType<typeof useAiChatProviders>['providers']
  providerStatus: ReturnType<typeof useAiChatProviders>['providerStatus']
  activeProvider: ReturnType<typeof useAiChatProviders>['activeProvider']
  activeModel: ReturnType<typeof useAiChatProviders>['activeModel']
  messages: ChatMessage[]
  history: ReturnType<typeof useAiChatHistory>['history']
  selectedConversationId: ReturnType<typeof useAiChatHistory>['selectedConversationId']
  inputValue: string
  isGenerating: boolean
  isListening: boolean
  error: string | null
  providerConnected: boolean
  setInputValue: (value: string) => void
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  toggleVoiceRecognition: () => void
  handleProviderChange: (provider: AIProviderId) => void
  handleModelChange: (modelId: string) => void
  handleConversationSelect: (conversationId: string) => Promise<void>
  handleConversationDelete: (conversationId: string) => Promise<void>
  sendMessage: () => Promise<void>
  formatTime: (date: Date) => string
}

export function useAiChatConsole(): UseAiChatConsoleResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = useSupabaseUser()

  const {
    credits,
    loadCredits,
    spend,
    refund,
    reset: resetCredits,
  } = useAiChatCredits(user)

  const {
    providers,
    providerStatus,
    activeProvider,
    activeModel,
    setActiveProvider,
    selectModel,
  } = useAiChatProviders()

  const {
    history,
    selectedConversationId,
    isLoadingHistory,
    loadHistory,
    selectConversation,
    deleteConversation,
    upsertConversation,
    setSelectedConversation,
    reset: resetHistory,
  } = useAiChatHistory()

  const providerConnected = useMemo(
    () => providerStatus[activeProvider]?.ok ?? false,
    [providerStatus, activeProvider],
  )

  const initializeForUser = useCallback(
    async (userId: string) => {
      await loadCredits(userId)
      await loadHistory(userId)
    },
    [loadCredits, loadHistory],
  )

  useEffect(() => {
    if (user) {
      void initializeForUser(user.id)
    } else {
      resetHistory()
      resetCredits()
      setMessages([])
    }
  }, [user, initializeForUser, resetCredits, resetHistory])

  const handleProviderChange = useCallback(
    (provider: AIProviderId) => {
      setActiveProvider(provider)
      setSelectedConversation(undefined)
      setMessages([])
    },
    [setActiveProvider, setSelectedConversation],
  )

  const handleModelChange = useCallback(
    (modelId: string) => {
      selectModel(activeProvider, modelId)
    },
    [selectModel, activeProvider],
  )

  const handleConversationSelect = useCallback(
    async (conversationId: string) => {
      if (!user) return

      try {
        const { messages: conversationMessages, conversation } = await selectConversation({
          conversationId,
          fallbackProvider: activeProvider,
          fallbackModel: activeModel,
        })

        setMessages(conversationMessages)

        if (conversation) {
          setActiveProvider(conversation.provider)
          if (conversation.model) {
            selectModel(conversation.provider, conversation.model)
          }
        }
      } catch (selectionError) {
        logger.error('AiChatConsoleHook', 'Failed to load conversation messages', selectionError)
        setError('Failed to load conversation. Try again later.')
      }
    },
    [user, activeProvider, activeModel, selectConversation, setActiveProvider, selectModel],
  )

  const handleConversationDelete = useCallback(
    async (conversationId: string) => {
      try {
        await deleteConversation(conversationId)
        if (selectedConversationId === conversationId) {
          setMessages([])
        }
      } catch (deleteError) {
        logger.error('AiChatConsoleHook', 'Failed to delete conversation', deleteError)
        setError('Unable to delete conversation at this time.')
      }
    },
    [deleteConversation, selectedConversationId],
  )

  const toggleVoiceRecognition = useCallback(() => {
    setIsListening((prev) => !prev)
    if (!isListening) {
      window.setTimeout(() => {
        setIsListening(false)
        setInputValue("What's my spending this month?")
      }, 2000)
    }
  }, [isListening])

  const formatTime = useCallback(
    (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [],
  )
  const { sendMessage, handleKeyDown } = useAiChatSendMessage({
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
    setSelectedConversation: (conversationId: string) => setSelectedConversation(conversationId),
  })

  const startNewConversation = useCallback(() => {
    setMessages([])
    setInputValue('')
    setError(null)
    setSelectedConversation(undefined)
  }, [setInputValue, setSelectedConversation])

  return {
    user,
    credits,
    providers,
    providerStatus,
    activeProvider,
    activeModel,
    messages,
    history,
    selectedConversationId,
    isLoadingHistory,
    inputValue,
    isGenerating,
    isListening,
    error,
    providerConnected,
    setInputValue,
    handleKeyDown,
    toggleVoiceRecognition,
    handleProviderChange,
    handleModelChange,
    handleConversationSelect,
    handleConversationDelete,
    sendMessage,
    formatTime,
    startNewConversation,
  }
}
