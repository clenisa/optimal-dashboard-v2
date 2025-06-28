import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { authLogger } from "@/lib/auth-logger"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  authLogger.log("Auth callback received", { url: request.url, codeExists: !!code })

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      authLogger.log("Successfully exchanged code for session, redirecting.", { redirectTo: `${origin}${next}` })
      return NextResponse.redirect(`${origin}${next}`)
    }

    authLogger.error("Failed to exchange code for session", { error: error.message, name: error.name })
  } else {
    authLogger.warn("Auth callback called without a code.")
  }

  // On error or if no code is present, redirect to home page.
  // The UI will handle showing the login window again.
  const errorRedirectUrl = `${origin}/?error=auth_failed`
  authLogger.error("Redirecting to home with error.", { url: errorRedirectUrl })
  return NextResponse.redirect(errorRedirectUrl)
}
