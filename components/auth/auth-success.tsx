"use client"

import type { Session } from "@supabase/supabase-js"

interface AuthSuccessProps {
  session: Session
  onSignOut: () => Promise<void>
}

export function AuthSuccess({ session, onSignOut }: AuthSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h2 className="text-xl font-bold mb-4 text-green-600">✓ Successfully Logged In!</h2>
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
        <p className="mb-2 text-sm">
          <strong>Email:</strong> {session.user.email}
        </p>
        <p className="text-xs text-gray-600">
          <strong>Last Sign In:</strong> {new Date(session.user.last_sign_in_at || "").toLocaleString()}
        </p>
      </div>
      <button
        onClick={onSignOut}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors min-h-[44px] text-sm"
        style={{ touchAction: "manipulation", cursor: "pointer" }}
      >
        Sign Out
      </button>
    </div>
  )
}
