'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { ConversationSummary } from '@/lib/ai/types'

interface ChatHistorySidebarProps {
  conversations: ConversationSummary[]
  selectedConversationId?: string
  onSelect: (conversationId: string) => void
  onDelete: (conversationId: string) => void
  onNewChat: () => void
}

export function AIChatHistorySidebar({
  conversations,
  selectedConversationId,
  onSelect,
  onDelete,
  onNewChat,
}: ChatHistorySidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r bg-muted/30">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">Chat History</h3>
            <p className="text-xs text-muted-foreground">Your previous AI conversations</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewChat}
            className="h-8 w-8 p-0"
            aria-label="Start a new chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No conversations yet.</p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                conversation.id === selectedConversationId
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:border-muted'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium line-clamp-1">{conversation.title || 'Conversation'}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {conversation.provider}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {new Date(conversation.updatedAt).toLocaleString()}
              </p>
              <div className="mt-2 flex justify-end">
                <span
                  role="button"
                  tabIndex={0}
                  className="h-6 w-6 inline-flex items-center justify-center text-muted-foreground rounded hover:bg-muted"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(conversation.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onDelete(conversation.id)
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
