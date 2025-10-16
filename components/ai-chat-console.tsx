"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
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
  Plus,
  History,
} from 'lucide-react'
import { AIProviderSelector } from './ai-provider-selector'
import { AIChatHistorySidebar } from './ai-chat-history-sidebar'
import { useAiChatConsole } from '@/hooks/use-ai-chat-console'
import { AIChatWelcome } from '@/components/ai-chat/ai-chat-welcome'
import { AIChatMessageList } from '@/components/ai-chat/ai-chat-message-list'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AIChatPricingTable } from '@/components/ai-chat/pricing-table'

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
  } = useAiChatConsole()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isPricingOpen, setIsPricingOpen] = useState(false)

  const activeProviderConfig = useMemo(
    () => providers.find((provider) => provider.id === activeProvider),
    [providers, activeProvider],
  )

  const remainingCredits = credits?.total_credits ?? 0
  const handleNewChat = () => {
    startNewConversation()
    setIsHistoryOpen(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleConversationSelectWithClose = (conversationId: string) =>
    handleConversationSelect(conversationId).finally(() => {
      setIsHistoryOpen(false)
    })

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
    <div className={cn('flex h-full overflow-hidden rounded-xl border', SURFACE_TOKENS.primary)}>
      <AIChatHistorySidebar
        conversations={history}
        selectedConversationId={selectedConversationId}
        onSelect={(conversationId) => void handleConversationSelectWithClose(conversationId)}
        onDelete={(conversationId) => void handleConversationDelete(conversationId)}
        isLoading={isLoadingHistory}
      />

      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="left" className="w-full max-w-xs border-none p-0 sm:max-w-sm">
          <AIChatHistorySidebar
            hideOnMobile={false}
            className="w-full border-r-0"
            conversations={history}
            selectedConversationId={selectedConversationId}
            onSelect={(conversationId) => void handleConversationSelectWithClose(conversationId)}
            onDelete={(conversationId) => void handleConversationDelete(conversationId)}
            isLoading={isLoadingHistory}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-card px-4 py-4">
            <CardTitle className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn(TYPOGRAPHY_TOKENS.heading, "text-base sm:text-lg")}>AI Assistant</span>
                  {providerConnected ? (
                    <Badge variant="default" className="flex items-center gap-1 text-xs">
                      <Wifi className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <CreditCard className="h-3 w-3" />
                    {remainingCredits} credits
                  </Badge>
                  {remainingCredits <= 2 && (
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 sm:hidden" />
                      <span className="hidden sm:inline">Buy Credits</span>
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setIsHistoryOpen(true)}
                    aria-label="Open chat history"
                  >
                    <History className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">History</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPricingOpen(true)}
                    aria-label="View AI pricing"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Pricing</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChat}
                    aria-label="Start new conversation"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">New Chat</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <AIProviderSelector
                  providers={providers}
                  value={activeProvider}
                  onChange={handleProviderChange}
                  status={providerStatus}
                />
                {activeProviderConfig?.models?.length ? (
                  <Select value={activeModel ?? ''} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProviderConfig.models.map((model) => (
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
              <Separator />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>
                  {providers.length > 0
                    ? `Using ${activeProviderConfig?.name ?? activeProvider} • ${activeModel ?? 'Select a model'}`
                    : 'Loading providers...'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-0">
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
                  {`Unable to reach ${activeProviderConfig?.name ?? activeProvider}. Check your API key and network connectivity.`}
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className={cn("flex-1", SPACING_TOKENS.card)}>
              <div className={cn(SPACING_TOKENS.section)}>
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

            <div className={cn("flex-shrink-0 border-t border-border/60 bg-card", SPACING_TOKENS.card)}>
              <div className="flex items-center gap-2">
                <AccessibleButton
                  variant="outline"
                  size="icon"
                  onClick={toggleVoiceRecognition}
                  ariaLabel={isListening ? "Stop voice input" : "Start voice input"}
                  className={cn(isListening ? "border-red-300 bg-red-50 text-red-600" : undefined)}
                  disabled={isGenerating || remainingCredits <= 0}
                >
                  {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </AccessibleButton>

                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    !providerConnected
                      ? 'Provider not reachable'
                      : remainingCredits <= 0
                      ? 'No credits remaining - purchase more to continue'
                      : isGenerating
                      ? 'AI is thinking...'
                      : 'Ask your AI assistant...'
                  }
                  disabled={isGenerating || remainingCredits <= 0 || !providerConnected}
                  className="flex-1"
                  aria-label="Message input"
                />

                <AccessibleButton
                  size="icon"
                  ariaLabel="Send message"
                  onClick={() => void sendMessage()}
                  disabled={!inputValue.trim() || isGenerating || remainingCredits <= 0 || !providerConnected}
                >
                  <Send className="h-4 w-4" />
                </AccessibleButton>
              </div>

              {isListening && (
                <div className="mt-2 text-center text-sm text-red-600">
                  Listening... release to stop capturing audio.
                </div>
              )}

              {remainingCredits <= 0 && (
                <div className="mt-2 text-center text-sm text-orange-600">
                  No credits remaining. Purchase more to continue chatting.
                </div>
              )}

              {!providerConnected && (
                <div className="mt-2 text-center text-sm text-red-600">
                  Provider disconnected. Check that it is configured correctly.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="max-w-4xl space-y-4">
          <DialogHeader>
            <DialogTitle>AI model pricing</DialogTitle>
            <DialogDescription>
              Review per-model pricing to understand credit consumption for each provider.
            </DialogDescription>
          </DialogHeader>
          <AIChatPricingTable providers={providers} activeProvider={activeProvider} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
