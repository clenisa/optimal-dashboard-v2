"use client"

interface AuthErrorProps {
  error: string
  onDismiss?: () => void
}

export function AuthError({ error, onDismiss }: AuthErrorProps) {
  return (
    <div className="w-full max-w-sm mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <div className="flex justify-between items-start">
        <p className="text-sm flex-1">{error}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-red-500 hover:text-red-700 text-lg leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
