# Multi-Provider AI Setup Guide

Follow these steps to configure the AI chat system locally.

## 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and populate the AI-related values:

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ENABLE_OLLAMA=true
NEXT_PUBLIC_ENABLE_OPENAI=true
NEXT_PUBLIC_DEFAULT_AI_PROVIDER=ollama
NEXT_PUBLIC_OPENAI_DEFAULT_MODEL=gpt-4o-mini
NEXT_PUBLIC_ELECTRON_CONSOLE_URL=http://localhost:3000
```

You may disable a provider by setting its `NEXT_PUBLIC_ENABLE_*` flag to `false`.

## 2. Run Database Migrations

Apply the schema updates in `database/credits-schema.sql` to your Supabase project. The new tables and policies are compatible with existing data but migrate chat storage to a normalized structure.

## 3. Start Dependencies

- **ElectronConsole (Ollama)**: Ensure it is running and accessible at the configured URL for local/offline chat.
- **Next.js App**: `pnpm install && pnpm dev`
- **Supabase**: Verify your project credentials allow client access.

## 4. Validate Providers

Use the helper script:

```
./scripts/test-ai-chat.sh
```

The script checks required environment variables and hits the provider/status API routes.

## 5. Manual Verification

1. Sign in to the dashboard.
2. Open the AI Assistant widget.
3. Switch between providers using the selector.
4. Send a prompt and observe credits deducting.
5. Reload the page to ensure chat history persists.

## 6. Cost Monitoring

Credit transactions now log provider metadata. Query `credit_transactions` in Supabase to audit usage:

```sql
select created_at, amount, metadata from credit_transactions
where user_id = 'your-user-id'
order by created_at desc;
```

## 7. Troubleshooting

- Use `GET /api/ai/status` to check connectivity.
- Inspect browser dev tools for client-side errors.
- Review Supabase logs if chat history fails to persist. The UI falls back to local storage automatically.
- For OpenAI errors, confirm the API key and network firewall rules.

