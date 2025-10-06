"use client"

import { Bot, Lightbulb, MessageSquare } from 'lucide-react'
import { AI_CHAT_WELCOME } from '@/lib/ai/chat/constants'

export function AIChatWelcome() {
  return (
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
  )
}
