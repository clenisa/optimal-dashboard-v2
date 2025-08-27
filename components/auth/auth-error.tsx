"use client"

interface AuthErrorProps {
  error: string
  onDismiss?: () => void
}

export function AuthError({ error, onDismiss }: AuthErrorProps) {
  return (
    <div className="w-full max-w-sm mb-4 p-3 optimal-card border border-red-500/40 text-red-300 rounded">
      <div className="flex justify-between items-start">
        <p className="text-sm flex-1">{error}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-red-300 hover:text-red-400 text-lg leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
