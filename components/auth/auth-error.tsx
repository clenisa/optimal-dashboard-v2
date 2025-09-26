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
            onClick={(e) => {
              e.preventDefault()
              onDismiss?.()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              onDismiss?.()
            }}
            className="ml-2 text-red-500 hover:text-red-700 active:text-red-800 transition-colors duration-150 flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Dismiss error"
            style={{
              minWidth: "var(--touch-target-min, 48px)",
              minHeight: "var(--touch-target-min, 48px)",
              touchAction: "manipulation",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: "1",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
            }}
            data-testid="error-dismiss-button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
