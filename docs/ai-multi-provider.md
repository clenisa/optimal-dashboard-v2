# AI Provider Architecture

This document describes the multi-provider AI system that powers the Optimal Dashboard chat experience.

## Overview

The chat console now supports multiple AI backends and can dynamically switch between local Ollama models (served from ElectronConsole) and OpenAI ChatGPT. The integration keeps the previous ElectronConsole workflow intact while adding cloud-based capabilities.

### Key Components

| Layer | Description |
| --- | --- |
| `lib/ai/providers/*` | Provider abstractions that encapsulate provider specific logic. |
| `lib/ai/provider-registry.ts` | Server-side registry that instantiates and manages providers for API routes. |
| `lib/ai/service.ts` | Client-side orchestrator that coordinates provider requests, storage, and fallbacks. |
| `lib/ai/chat-history.ts` | Supabase/localStorage storage providers for conversation history. |
| `app/api/ai/*` | API routes exposing providers, statuses, and OpenAI chat execution. |
| `components/ai-chat-console.tsx` | Updated console UI with provider/model switching, history, and credit tracking. |

## Provider Configuration

Environment variables drive which providers are enabled. Update `.env.local` accordingly:

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ENABLE_OLLAMA=true
NEXT_PUBLIC_ENABLE_OPENAI=true
NEXT_PUBLIC_DEFAULT_AI_PROVIDER=ollama
NEXT_PUBLIC_OPENAI_DEFAULT_MODEL=gpt-4o-mini
NEXT_PUBLIC_ELECTRON_CONSOLE_URL=http://localhost:3000
```

When `NEXT_PUBLIC_ENABLE_OLLAMA` is `true`, the chat console continues to communicate directly with the local ElectronConsole instance for the Ollama provider. This preserves offline support and avoids routing traffic through the Next.js API.

## Database Schema

The schema now stores conversations and messages separately to support Supabase persistence and local storage fallback.

- `ai_conversations`: metadata about each chat (provider, model, title, timestamps).
- `ai_messages`: ordered messages tied to a conversation.
- RLS policies ensure users only access their own data.

See [`database/credits-schema.sql`](../database/credits-schema.sql) for DDL, policies, and triggers.

## Credit Tracking

The credit system now understands provider-specific costs.

- A provisional credit is deducted when the user sends a message.
- For OpenAI, the actual USD cost is converted to credits (1 credit = $0.01) using API usage data.
- Any difference between the provisional credit and real cost is automatically adjusted (additional charge or refund).
- All transactions are logged in `credit_transactions` with provider metadata for reporting.

## Chat History

- Conversations are persisted to Supabase when available. If Supabase is offline, local storage keeps a fallback copy.
- The new history sidebar (`AIChatHistorySidebar`) allows users to browse, resume, and delete conversations.
- Conversation data is synced on login and when the provider/model changes.

## API Routes

- `GET /api/ai/providers`: lists enabled providers and the models they expose.
- `GET /api/ai/status`: returns connection status for one or all providers.
- `POST /api/ai/chat`: sends chat requests to server-side providers (used for OpenAI). Ollama requests remain client-side to maintain backwards compatibility.

## Error Handling

- Connection status badges are shown in the UI with latency information when available.
- All provider requests use structured logging and bubble user-friendly messages.
- Supabase operations fail gracefully by falling back to local storage.

## Adding a Provider

1. Implement a provider class that extends `AIProvider` in `lib/ai/providers`.
2. Register the provider in `lib/ai/provider-registry.ts`.
3. Expose required environment variables and update documentation.
4. Optionally extend the UI to surface provider-specific metadata (pricing, capabilities, etc.).

## Sequence Diagram

```
User -> AIChatConsole: type message
AIChatConsole -> AIService: sendMessage(...)
AIService -> ElectronConsole (if Ollama): POST /prompt
AIService -> /api/ai/chat (if OpenAI): POST request
/api/ai/chat -> OpenAI: chat.completions
AIService -> Supabase/localStorage: persist conversation & messages
AIService -> AIChatConsole: return response
AIChatConsole -> Supabase: adjust credits
AIChatConsole -> UI: render assistant message and update history
```

## Troubleshooting Tips

- Verify provider statuses via `GET /api/ai/status`.
- Ensure Supabase credentials are configured. Without Supabase the chat still works but only stores history locally.
- For Ollama, confirm ElectronConsole is reachable at `NEXT_PUBLIC_ELECTRON_CONSOLE_URL`.
- For OpenAI, confirm your API key and optional default model environment variables.

