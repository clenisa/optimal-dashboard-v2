"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Send, Square, CreditCard, DollarSign, AlertCircle, Wifi, WifiOff, Bot, Lightbulb, MessageSquare } from 'lucide-react'
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

// AI Chat Welcome Message and Capabilities
const AI_CHAT_WELCOME = {
  title: "AI Financial Assistant",
  description: "Ask questions about your financial data, get insights, and receive personalized recommendations.",
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

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  thinking?: string[]
  gesture?: string
  metadata?: {
    modelDisplayName?: string
    isFinancialQuery?: boolean
    error?: boolean
    conversationId?: string
  }
}

interface UserCredits {
  current_credits: number
  total_earned: number
  total_spent: number
  last_daily_credit: string
}

export function AIChatConsole() {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [consoleConnected, setConsoleConnected] = useState(false)
  const [consoleUrl, setConsoleUrl] = useState('http://localhost:3000') // Default ElectronConsole port
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize user and credits
  useEffect(() => {
    const supabase = createClient()
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
        setUser(user)
        if (user) {
          loadUserCredits(user.id)
          checkDailyCredits(user.id)
        }
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        if (newUser) {
          loadUserCredits(newUser.id)
          checkDailyCredits(newUser.id)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  // Check ElectronConsole connection
  useEffect(() => {
    checkConsoleConnection()
    const interval = setInterval(checkConsoleConnection, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [consoleUrl])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkConsoleConnection = async () => {
    try {
      const response = await fetch(`${consoleUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })
      setConsoleConnected(response.ok)
      setError(null)
    } catch (err) {
      setConsoleConnected(false)
      setError('ElectronConsole not reachable. Make sure it\'s running on your PC.')
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

      if (error && error.code !== 'PGRST116') { // Not found error
        logger.error('AIChatConsole', 'Error loading credits', error)
        return
      }

      if (data) {
        setCredits(data)
      } else {
        // Create initial credits for new user
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            current_credits: 10,
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
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('last_daily_credit')
        .eq('user_id', userId)
        .single()

      if (data && data.last_daily_credit !== today) {
        // Award daily credits
        const { data: updated, error: updateError } = await supabase
          .from('user_credits')
          .update({
            current_credits: (credits?.current_credits || 0) + 5,
            total_earned: (credits?.total_earned || 0) + 5,
            last_daily_credit: today
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (!updateError && updated) {
          setCredits(updated)
          
          // Log the credit transaction
          await supabase
            .from('credit_transactions')
            .insert({
              user_id: userId,
              type: 'daily_bonus',
              amount: 5,
              description: 'Daily login bonus'
            })
        }
      }
    } catch (err) {
      logger.error('AIChatConsole', 'Error checking daily credits', err)
    }
  }

  const deductCredit = async (userId: string, conversationId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return false

      const { data, error } = await supabase
        .from('user_credits')
        .update({
          current_credits: Math.max(0, (credits?.current_credits || 0) - 1),
          total_spent: (credits?.total_spent || 0) + 1
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (!error && data) {
        setCredits(data)
        
        // Log the credit transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: userId,
            type: 'spent',
            amount: -1,
            description: 'AI chat message',
            conversation_id: conversationId
          })
        
        return true
      }
      
      return false
    } catch (err) {
      logger.error('AIChatConsole', 'Error deducting credit', err)
      return false
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isGenerating || !user || !consoleConnected) return
    
    if (!credits || credits.current_credits <= 0) {
      setError('No credits remaining. Purchase more credits to continue chatting.')
      return
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Deduct credit first
    const creditDeducted = await deductCredit(user.id, conversationId)
    if (!creditDeducted) {
      setError('Failed to deduct credit. Please try again.')
      return
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsGenerating(true)
    setError(null)

    try {
      // Send to ElectronConsole with user identification
      const response = await fetch(`${consoleUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          userId: user.id,
          userEmail: user.email,
          conversationId: conversationId,
          source: 'optimal-desktop',
          timestamp: new Date().toISOString(),
          // Include financial context flag
          includeFinancialContext: /budget|spending|expense|income|credit|transaction|financial|money|dollar|\$/.test(userMessage.content.toLowerCase())
        })
      })

      if (!response.ok) {
        throw new Error(`ElectronConsole error: ${response.status}`)
      }

      const result = await response.json()

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: result.response || 'I received your message but had trouble generating a response.',
        timestamp: new Date(),
        thinking: result.thinking,
        gesture: result.gesture,
        metadata: {
          ...result.metadata,
          conversationId: conversationId
        }
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      logger.error('AIChatConsole', 'Error communicating with ElectronConsole', err)
      
      // Refund the credit on error
      if (credits) {
        const supabase = createClient()
        if (supabase) {
          await supabase
            .from('user_credits')
            .update({
              current_credits: credits.current_credits + 1,
              total_spent: Math.max(0, credits.total_spent - 1)
            })
            .eq('user_id', user.id)
          
          // Reload credits
          loadUserCredits(user.id)
        }
      }

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `I couldn't connect to the AI console — error: ${err instanceof Error ? err.message : 'Unknown error'}. Make sure ElectronConsole is running on your PC.`,
        timestamp: new Date(),
        metadata: { error: true }
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening)
    // Mock voice recognition for now
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        setInputValue("What's my spending this month?")
      }, 2000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>AI Assistant</span>
            {consoleConnected ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Disconnected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {credits?.current_credits || 0} credits
            </Badge>
            {(credits?.current_credits || 0) <= 2 && (
              <Button size="sm" variant="outline">
                Buy Credits
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Connection Status */}
        {!consoleConnected && (
          <Alert className="m-4 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ElectronConsole not connected. Make sure it's running on your PC at {consoleUrl}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="m-4 mb-0" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">{AI_CHAT_WELCOME.title}</p>
                <p className="text-sm mb-4">{AI_CHAT_WELCOME.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Capabilities */}
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
                  
                  {/* Example Queries */}
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
                  Connected to your local ElectronConsole with Ollama
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.metadata?.error
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </div>
                    {message.metadata?.conversationId && (
                      <Badge variant="secondary" className="text-xs">
                        Via ElectronConsole
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Generating indicator */}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">🤖</div>
                    <div className="text-sm text-gray-600">
                      AI is thinking via ElectronConsole...
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoiceRecognition}
              className={isListening ? 'bg-red-100 border-red-300' : ''}
              disabled={isGenerating || !credits || credits.current_credits <= 0 || !consoleConnected}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'text-red-600' : ''}`} />
            </Button>

            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !consoleConnected
                  ? "ElectronConsole not connected"
                  : !credits || credits.current_credits <= 0 
                  ? "No credits remaining - purchase more to continue"
                  : isGenerating 
                  ? "AI is thinking..." 
                  : "Ask your AI assistant..."
              }
              disabled={isGenerating || !credits || credits.current_credits <= 0 || !consoleConnected}
              className="flex-1"
            />

            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isGenerating || !credits || credits.current_credits <= 0 || !consoleConnected}
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

          {(!credits || credits.current_credits <= 0) && (
            <div className="mt-2 text-center text-sm text-orange-600">
              ⚠️ No credits remaining. Purchase more to continue chatting.
            </div>
          )}

          {!consoleConnected && (
            <div className="mt-2 text-center text-sm text-red-600">
              🔌 ElectronConsole disconnected. Check that it's running on your PC.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

