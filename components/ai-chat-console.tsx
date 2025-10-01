"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Mic,
  Send,
  Square,
  CreditCard,
  DollarSign,
  AlertCircle,
  Wifi,
  WifiOff,
  Bot,
  Lightbulb,
  MessageSquare,
  Loader2,
  Sparkles
} from 'lucide-react'
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"
import { aiService } from '@/lib/ai/service'
import type { AIModel, AIProviderId, ProviderStatus, ConversationSummary } from '@/lib/ai/types'
import { AIProviderSelector } from './ai-provider-selector'
import { AIChatHistorySidebar } from './ai-chat-history-sidebar'

const AI_CHAT_WELCOME = {
  title: "AI Financial Assistant",
  description: "Switch between local Ollama and OpenAI to get insights about your finances.",
  capabilities: [
    "Analyze spending patterns and trends",
    "Provide budget recommendations",
    "Answer questions about your transactions",
    "Generate financial reports and summaries",
    "Suggest ways to optimize your finances"
  ],
  exampleQueries: [
    "What did I spend the most on last month?",
    "Show me my dining out trends",
    "How can I reduce my monthly expenses?",
    "What's my average monthly income?"
  ]
}

const CREDIT_USD_VALUE = 0.01
const DEFAULT_PROVIDER = (process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER as AIProviderId | undefined) ?? 'ollama'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  provider: AIProviderId
  model: string
  metadata?: Record<string, unknown>
  costUSD?: number
  usageSummary?: string
  error?: boolean
}

interface UserCredits {
  total_credits: number
  total_earned: number
  total_spent: number
  last_daily_credit: string
}

interface ProviderOption {
  id: AIProviderId
  name: string
  defaultModel?: string
  models: AIModel[]
}

export function AIChatConsole() {
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [providerStatus, setProviderStatus] = useState<Record<string, ProviderStatus>>({})
  const [activeProvider, setActiveProvider] = useState<AIProviderId>('ollama')
  const [modelSelections, setModelSelections] = useState<Record<string, string>>({})
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ConversationSummary[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined)
  const [, setIsLoadingHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        initializeForUser(user.id)
      }
    })

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        initializeForUser(nextUser.id)
      } else {
        setHistory([])
        setMessages([])
      }
    })

    return () => {
      authSubscription?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchProviders() {
      try {
        const providerList = await aiService.listProviders()
        if (!mounted) return
        setProviders(providerList)

        const initialSelections: Record<string, string> = {}
        providerList.forEach((provider) => {
          const defaultModel = provider.defaultModel || provider.models?.[0]?.id
          if (defaultModel) {
            initialSelections[provider.id] = defaultModel
          }
        })
        setModelSelections((prev) => ({ ...initialSelections, ...prev }))

        const preferred =
          providerList.find((provider) => provider.id === DEFAULT_PROVIDER) ?? providerList[0]
        if (preferred) {
          setActiveProvider(preferred.id)
        }
      } catch (err) {
        logger.error('AIChatConsole', 'Failed to load providers', err)
        setError('Failed to load AI providers. Check your configuration.')
      }
    }

    fetchProviders()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (providers.length === 0) return
    let cancelled = false

    async function refreshStatuses() {
      try {
        const statuses = await Promise.all(
          providers.map(async (provider) => {
            try {
              const status = await aiService.getProviderStatus(provider.id)
              return [provider.id, status] as const
            } catch (err) {
              logger.warn('AIChatConsole', 'Provider status fetch failed', { provider: provider.id, err })
              return [provider.id, { ok: false, error: 'Status unavailable' }] as const
            }
          })
        )

        if (!cancelled) {
          setProviderStatus(Object.fromEntries(statuses))
        }
      } catch (err) {
        logger.warn('AIChatConsole', 'Failed to refresh provider statuses', err)
      }
    }

    refreshStatuses()
    const interval = setInterval(refreshStatuses, 15000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [providers])

  const activeModel = useMemo(() => {
    return modelSelections[activeProvider]
  }, [modelSelections, activeProvider])

  async function initializeForUser(userId: string) {
    await Promise.all([loadUserCredits(userId), checkDailyCredits(userId), loadHistory(userId)])
  }

  const loadHistory = async (userId: string) => {
    try {
      setIsLoadingHistory(true)
      const conversations = await aiService.loadHistory(userId)
      setHistory(conversations)
    } catch (err) {
      logger.error('AIChatConsole', 'Failed to load chat history', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadUserCredits = async (userId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        logger.error('AIChatConsole', 'Error loading credits', error)
        return
      }

      if (data) {
        setCredits(data)
      } else {
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            total_credits: 10,
            total_earned: 10,
            last_daily_credit: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (!insertError && newCredits) {
          setCredits(newCredits)
        }
      }
    } catch (err) {
      logger.error('AIChatConsole', 'Error loading user credits', err)
    }
  }

  const checkDailyCredits = async (userId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('user_credits')
        .select('last_daily_credit, daily_credit_amount, total_credits, total_earned')
        .eq('user_id', userId)
        .single()

      if (data && data.last_daily_credit !== today) {
        const newTotalCredits = (data.total_credits || 0) + (data.daily_credit_amount || 0)
        const newTotalEarned = (data.total_earned || 0) + (data.daily_credit_amount || 0)

        const { data: updated, error: updateError } = await supabase
          .from('user_credits')
          .update({
            total_credits: newTotalCredits,
            total_earned: newTotalEarned,
            last_daily_credit: today
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (!updateError && updated) {
          setCredits(updated)

          await supabase.from('credit_transactions').insert({
            user_id: userId,
            type: 'earned',
            amount: data.daily_credit_amount || 0,
            description: 'Daily login bonus'
          })
        }
      }
    } catch (err) {
      logger.error('AIChatConsole', 'Error checking daily credits', err)
    }
  }

  const spendCredits = async (
    userId: string,
    amount: number,
    conversationId: string,
    provider: AIProviderId,
    metadata?: Record<string, unknown>
  ) => {
    if (amount <= 0) return true

    try {
      const supabase = createClient()
      if (!supabase) return false

      const { data, error } = await supabase
        .from('user_credits')
        .update({
          total_credits: Math.max(0, (credits?.total_credits || 0) - amount),
          total_spent: (credits?.total_spent || 0) + amount
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        logger.error('AIChatConsole', 'Error spending credits', error)
        return false
      }

      setCredits(data)

      await supabase.from('credit_transactions').insert({
        user_id: userId,
        type: 'spent',
        amount: -amount,
        description: `AI chat (${provider})`,
        conversation_id: conversationId,
        metadata
      })

      return true
    } catch (err) {
      logger.error('AIChatConsole', 'Unexpected error spending credits', err)
      return false
    }
  }

  const refundCredits = async (userId: string, amount: number, reason: string) => {
    if (amount <= 0) return
    try {
      const supabase = createClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('user_credits')
        .update({
          total_credits: (credits?.total_credits || 0) + amount,
          total_spent: Math.max(0, (credits?.total_spent || 0) - amount)
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (!error && data) {
        setCredits(data)
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          type: 'earned',
          amount,
          description: reason
        })
      }
    } catch (err) {
      logger.error('AIChatConsole', 'Error refunding credits', err)
    }
  }

  const handleProviderChange = (provider: AIProviderId) => {
    setActiveProvider(provider)
    setMessages([])
    setSelectedConversationId(undefined)
  }

  const handleModelChange = (modelId: string) => {
    setModelSelections((prev) => ({ ...prev, [activeProvider]: modelId }))
  }

  const handleConversationSelect = async (conversationId: string) => {
    if (!user) return
    try {
      setSelectedConversationId(conversationId)
      const conversationMessages = await aiService.loadConversationMessages(conversationId)

      const formattedMessages: ChatMessage[] = conversationMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date(message.createdAt),
        provider: (message.provider || activeProvider) as AIProviderId,
        model: message.model || activeModel || '',
        metadata: message.metadata || {}
      }))

      setMessages(formattedMessages)

      const conversation = history.find((item) => item.id === conversationId)
      if (conversation) {
        setActiveProvider(conversation.provider)
        if (conversation.model) {
          setModelSelections((prev) => ({ ...prev, [conversation.provider]: conversation.model }))
        }
      }
    } catch (err) {
      logger.error('AIChatConsole', 'Failed to load conversation messages', err)
      setError('Failed to load conversation. Try again later.')
    }
  }

  const handleConversationDelete = async (conversationId: string) => {
    try {
      await aiService.deleteConversation(conversationId)
      setHistory((prev) => prev.filter((conversation) => conversation.id !== conversationId))
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(undefined)
        setMessages([])
      }
    } catch (err) {
      logger.error('AIChatConsole', 'Failed to delete conversation', err)
      setError('Unable to delete conversation at this time.')
    }
  }

  const calculateCreditsFromUsd = (usd?: number) => {
    if (!usd || usd <= 0) return 1
    return Math.max(1, Math.ceil(usd / CREDIT_USD_VALUE))
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isGenerating || !user) return
    if (!activeModel) {
      setError('Select a model before sending a message.')
      return
    }

    if (!credits || credits.total_credits <= 0) {
      setError('No credits remaining. Purchase more credits to continue chatting.')
      return
    }

    const conversationId = selectedConversationId ?? `conv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    const deposit = 1

    const canSpend = await spendCredits(user.id, deposit, conversationId, activeProvider, {
      model: activeModel,
      type: 'initial_deposit'
    })

    if (!canSpend) {
      setError('Failed to deduct credits. Please try again.')
      return
    }

    const timestamp = new Date()
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp,
      provider: activeProvider,
      model: activeModel
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInputValue('')
    setIsGenerating(true)
    setError(null)

    try {
      const chatHistory = nextMessages.map((message) => ({
        role: message.role,
        content: message.content
      }))

      const { result, conversation } = await aiService.sendMessage({
        provider: activeProvider,
        model: activeModel,
        userId: user.id,
        userEmail: user.email,
        conversationId,
        messages: chatHistory
      })

      const costCredits = activeProvider === 'openai'
        ? calculateCreditsFromUsd(result.message.costUSD)
        : 1

      const additionalCredits = costCredits - deposit
      if (additionalCredits > 0) {
        await spendCredits(user.id, additionalCredits, conversationId, activeProvider, {
          model: activeModel,
          type: 'usage_adjustment',
          costUSD: result.message.costUSD,
          usage: result.message.usage
        })
      } else if (additionalCredits < 0) {
        await refundCredits(user.id, Math.abs(additionalCredits), 'AI chat credit adjustment')
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
          : undefined
      }

      setMessages((prev) => [...prev, assistantMessage])
      setSelectedConversationId(conversation.id)

      setHistory((prev) => {
        const others = prev.filter((item) => item.id !== conversation.id)
        const updated: ConversationSummary = {
          ...conversation,
          updatedAt: new Date().toISOString()
        }
        return [updated, ...others]
      })
    } catch (err) {
      logger.error('AIChatConsole', 'Error generating AI response', err)
      setError(
        err instanceof Error
          ? err.message
          : 'We encountered an issue communicating with the AI provider.'
      )
      await refundCredits(user.id, deposit, 'AI chat refund (failed request)')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        setInputValue("What's my spending this month?")
      }, 2000)
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Authentication Required</p>
          <p className="text-sm text-gray-600">Please log in to use the AI assistant.</p>
        </CardContent>
      </Card>
    )
  }

  const activeStatus = providerStatus[activeProvider]
  const providerConnected = activeStatus?.ok ?? false

  return (
    <div className="flex h-full min-h-[600px] border rounded-lg overflow-hidden bg-background">
      <AIChatHistorySidebar
        conversations={history}
        selectedConversationId={selectedConversationId}
        onSelect={handleConversationSelect}
        onDelete={handleConversationDelete}
      />

      <div className="flex-1 flex flex-col">
        <Card className="border-none shadow-none h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base sm:text-lg">AI Assistant</span>
                  {providerConnected ? (
                    <Badge variant="default" className="flex items-center gap-1 text-xs">
                      <Wifi className="w-3 h-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </Badge>
                  )}
                  <AIProviderSelector
                    providers={providers}
                    value={activeProvider}
                    onChange={handleProviderChange}
                    status={providerStatus}
                  />
                  {providers.find((provider) => provider.id === activeProvider)?.models?.length ? (
                    <Select
                      value={activeModel ?? ''}
                      onValueChange={handleModelChange}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers
                          .find((provider) => provider.id === activeProvider)
                          ?.models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex flex-col">
                                <span>{model.name}</span>
                                {model.pricing && (
                                  <span className="text-xs text-muted-foreground">
                                    ${model.pricing.prompt.toFixed(4)}/{model.pricing.unit}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <CreditCard className="w-3 h-3" />
                    {credits?.total_credits || 0} credits
                  </Badge>
                  {(credits?.total_credits || 0) <= 2 && (
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Buy Credits</span>
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>
                  {providers.length > 0
                    ? `Using ${providers.find((provider) => provider.id === activeProvider)?.name || activeProvider} • ${activeModel}`
                    : 'Loading providers...'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {error && (
              <Alert className="mx-4 mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!providerConnected && (
              <Alert className="mx-4 mt-4" variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {activeProvider === 'ollama'
                    ? 'ElectronConsole not connected. Make sure it is running on your local machine.'
                    : 'OpenAI provider unreachable. Check your API key and network connectivity.'}
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && !selectedConversationId && (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium mb-2">{AI_CHAT_WELCOME.title}</p>
                    <p className="text-sm mb-4">{AI_CHAT_WELCOME.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      <div className="text-left">
                        <h4 className="font-medium flex items-center gap-2 mb-3 text-gray-700">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          What I can help with:
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {AI_CHAT_WELCOME.capabilities.map((capability, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium flex items-center gap-2 mb-3 text-gray-700">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          Try asking:
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {AI_CHAT_WELCOME.exampleQueries.map((query, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span className="italic">"{query}"</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 text-xs text-gray-400">
                      Seamlessly switch between local Ollama and cloud AI providers.
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.error
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="flex items-center justify-between mt-2 text-[11px] opacity-70">
                        <span>{formatTime(message.timestamp)}</span>
                        <span className="uppercase">{message.provider}</span>
                      </div>
                      {message.costUSD !== undefined && (
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          Cost: ${message.costUSD.toFixed(4)} {message.usageSummary ? `• ${message.usageSummary}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[70%] text-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {activeProvider === 'ollama'
                          ? 'AI is thinking via ElectronConsole...'
                          : 'AI is generating a response...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t px-4 py-4 flex-shrink-0 bg-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceRecognition}
                  className={isListening ? 'bg-red-100 border-red-300' : ''}
                  disabled={isGenerating || !credits || credits.total_credits <= 0}
                >
                  {isListening ? <Square className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
                </Button>

                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    !providerConnected
                      ? 'Provider not reachable'
                      : !credits || credits.total_credits <= 0
                      ? 'No credits remaining - purchase more to continue'
                      : isGenerating
                      ? 'AI is thinking...'
                      : 'Ask your AI assistant...'
                  }
                  disabled={isGenerating || !credits || credits.total_credits <= 0 || !providerConnected}
                  className="flex-1"
                />

                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isGenerating || !credits || credits.total_credits <= 0 || !providerConnected}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {isListening && (
                <div className="mt-2 text-center text-sm text-red-600 animate-pulse">
                  🎤 Listening... (Mock - speak now)
                </div>
              )}

              {(!credits || credits.total_credits <= 0) && (
                <div className="mt-2 text-center text-sm text-orange-600">
                  ⚠️ No credits remaining. Purchase more to continue chatting.
                </div>
              )}

              {!providerConnected && (
                <div className="mt-2 text-center text-sm text-red-600">
                  🔌 Provider disconnected. Check that it is configured correctly.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
