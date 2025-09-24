"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [initializing, setInitializing] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [redirectPath, setRedirectPath] = useState("/")
  const [canUpdatePassword, setCanUpdatePassword] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const currentUrl = new URL(window.location.href)
    const next = currentUrl.searchParams.get("next")
    if (next) {
      setRedirectPath(next)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setError("Supabase client is not available. Please try again later.")
      setInitializing(false)
      return
    }

    if (typeof window === "undefined") {
      return
    }

    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) {
      setError("Invalid or expired password reset link.")
      setInitializing(false)
      return
    }

    const hashParams = new URLSearchParams(hash)
    const accessToken = hashParams.get("access_token")
    const refreshToken = hashParams.get("refresh_token")
    const eventType = hashParams.get("type")

    if (!accessToken || !refreshToken) {
      setError("Invalid or expired password reset link.")
      setInitializing(false)
      return
    }

    let isActive = true
    const authenticate = async () => {
      setInitializing(true)
      setError(null)
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (!isActive) return

      if (sessionError) {
        setError(sessionError.message || "Unable to validate password reset link. Please request a new one.")
        setInitializing(false)
        return
      }

      if (eventType && eventType !== "recovery") {
        const redirectUrl = redirectPath || "/"
        router.replace(redirectUrl)
        return
      }

      setCanUpdatePassword(true)
      setInitializing(false)
    }

    authenticate()

    return () => {
      isActive = false
    }
  }, [supabase, router, redirectPath])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!supabase) {
      setError("Supabase client is not available. Please try again later.")
      return
    }

    if (!canUpdatePassword) {
      setError("Password reset session is not ready. Please refresh the page and try again.")
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message || "Failed to update password. Please try again.")
      setSubmitting(false)
      return
    }

    setSuccessMessage("Password updated successfully. Redirecting to login...")
    setSubmitting(false)
    setTimeout(() => {
      router.push(redirectPath || "/")
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-xl backdrop-blur border border-gray-100 dark:border-gray-800 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter a new password for your account. Make sure it is unique and secure.
          </p>
        </div>

        {initializing && (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900 dark:border-gray-800 dark:border-t-white" />
            <p>Validating your reset link...</p>
          </div>
        )}

        {!initializing && !successMessage && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  disabled={!canUpdatePassword || submitting}
                  className="w-full rounded-lg border border-gray-200 bg-white/90 px-4 py-3 pr-12 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950/80 dark:text-white dark:focus:border-white"
                  placeholder="Enter a new password"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Must be at least {MIN_PASSWORD_LENGTH} characters long.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  disabled={!canUpdatePassword || submitting}
                  className="w-full rounded-lg border border-gray-200 bg-white/90 px-4 py-3 pr-12 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950/80 dark:text-white dark:focus:border-white"
                  placeholder="Re-enter your new password"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-white"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !canUpdatePassword}
              className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}

        {successMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200">
            <p className="font-medium">{successMessage}</p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">You will be redirected shortly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
