"use client"

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { ChatMessage } from '@/lib/ai/chat/types'
import type { AIProviderId } from '@/lib/ai/types'

interface AIChatMessageListProps {
  messages: ChatMessage[]
  isGenerating: boolean
  activeProvider: AIProviderId
  formatTime: (date: Date) => string
}

export const AIChatMessageList = forwardRef<HTMLDivElement, AIChatMessageListProps>(
  ({ messages, isGenerating, activeProvider, formatTime }, endRef) => {
    return (
      <div className="space-y-4">
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

        <div ref={endRef} />
      </div>
    )
  },
)

AIChatMessageList.displayName = 'AIChatMessageList'
