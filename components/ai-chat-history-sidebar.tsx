"use client"

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import type { ConversationSummary } from '@/lib/ai/types'
import { cn } from '@/lib/utils'
import { SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

interface ChatHistorySidebarProps {
  conversations: ConversationSummary[]
  selectedConversationId?: string
  onSelect: (conversationId: string) => void
  onDelete: (conversationId: string) => void
  hideOnMobile?: boolean
  className?: string
  isLoading?: boolean
}

export function AIChatHistorySidebar({
  conversations,
  selectedConversationId,
  onSelect,
  onDelete,
  hideOnMobile = true,
  className,
  isLoading = false,
}: ChatHistorySidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r bg-muted/30 xl:w-72",
        hideOnMobile ? "hidden lg:flex" : "flex",
        className,
      )}
    >
      <div className={cn("border-b px-4 py-3", SURFACE_TOKENS.primary)}>
        <h3 className={cn(TYPOGRAPHY_TOKENS.body, "font-semibold")}>Chat History</h3>
        <p className={TYPOGRAPHY_TOKENS.caption}>Your previous AI conversations</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {isLoading ? (
            <LoadingSkeleton lines={6} />
          ) : conversations.length === 0 ? (
            <p className={cn(TYPOGRAPHY_TOKENS.caption, "py-8 text-center")}>No conversations yet.</p>
          ) : (
            conversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary bg-hover-primary text-primary"
                      : "border-transparent hover:border-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1 font-medium">{conversation.title || "Conversation"}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {conversation.provider}
                    </Badge>
                  </div>
                  <p className={cn(TYPOGRAPHY_TOKENS.caption, "mt-1 line-clamp-2")}>
                    {new Date(conversation.updatedAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <span
                      role="button"
                      tabIndex={0}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(conversation.id)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          onDelete(conversation.id)
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
