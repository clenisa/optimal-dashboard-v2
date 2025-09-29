#!/usr/bin/env bash
set -euo pipefail

# Simple validation script for the AI chat system.
# Usage: ./scripts/test-ai-chat.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_URL=${APP_URL:-"http://localhost:3000"}

function require_env() {
  local var_name="$1"
  if [[ -z "${!var_name:-}" ]]; then
    echo "[WARN] Environment variable $var_name is not set." >&2
  else
    echo "[ OK ] $var_name detected"
  fi
}

function curl_json() {
  local url="$1"
  echo "[curl] $url"
  curl --fail --silent --show-error "$url" | jq .
}

echo "== AI Chat System Smoke Test =="
require_env "NEXT_PUBLIC_ELECTRON_CONSOLE_URL"
require_env "OPENAI_API_KEY"

if ! command -v jq >/dev/null 2>&1; then
  echo "[WARN] jq is required for pretty-printing JSON responses." >&2
fi

if command -v curl >/dev/null 2>&1; then
  echo "\n-- Provider List --"
  curl_json "$APP_URL/api/ai/providers" || echo "[ERROR] Unable to fetch providers"

  echo "\n-- Provider Status (all) --"
  curl_json "$APP_URL/api/ai/status" || echo "[ERROR] Unable to fetch provider statuses"
else
  echo "[ERROR] curl is required to run this script." >&2
  exit 1
fi

cat <<EOM

Manual Validation Steps:
1. Start the Next.js dev server: pnpm dev
2. Ensure ElectronConsole is running locally if you plan to test the Ollama provider.
3. Log in to the dashboard and open the AI assistant.
4. Switch between providers using the selector and send sample prompts.
5. Verify credits deduct appropriately and chat history entries appear in Supabase.
EOM
