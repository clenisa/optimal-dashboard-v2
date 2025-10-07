"use client"

import React, { useEffect, useRef } from 'react'
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
  Sparkles,
} from 'lucide-react'
import { AIProviderSelector } from './ai-provider-selector'
import { AIChatHistorySidebar } from './ai-chat-history-sidebar'
import { useAiChatConsole } from '@/hooks/use-ai-chat-console'
import { AIChatWelcome } from '@/components/ai-chat/ai-chat-welcome'
import { AIChatMessageList } from '@/components/ai-chat/ai-chat-message-list'

export function AIChatConsole() {
  const {
    user,
    credits,
    providers,
    providerStatus,
    activeProvider,
    activeModel,
    messages,
    history,
    selectedConversationId,
    inputValue,
    isGenerating,
    isListening,
    error,
    providerConnected,
    setInputValue,
    handleKeyPress,
    toggleVoiceRecognition,
    handleProviderChange,
    handleModelChange,
    handleConversationSelect,
    handleConversationDelete,
    sendMessage,
    formatTime,
  } = useAiChatConsole()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Authentication Required</p>
          <p className="text-sm text-muted-foreground">Please log in to use the AI assistant.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-full min-h-[600px] border rounded-lg overflow-hidden bg-background">
      <AIChatHistorySidebar
        conversations={history}
        selectedConversationId={selectedConversationId}
        onSelect={(conversationId) => void handleConversationSelect(conversationId)}
        onDelete={(conversationId) => void handleConversationDelete(conversationId)}
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
                {messages.length === 0 && !selectedConversationId ? (
                  <AIChatWelcome />
                ) : (
                  <AIChatMessageList
                    ref={messagesEndRef}
                    messages={messages}
                    isGenerating={isGenerating}
                    activeProvider={activeProvider}
                    formatTime={formatTime}
                  />
                )}
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
                  onClick={() => void sendMessage()}
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
