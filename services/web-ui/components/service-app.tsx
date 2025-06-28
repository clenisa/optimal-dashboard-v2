"use client"

// Remove these imports as they are no longer needed for the placeholder
// import { useEffect, useState } from "react"
// import { authLogger } from "@/lib/auth-logger"

interface ServiceAppProps {
  serviceName: string
}

export function ServiceApp({ serviceName }: ServiceAppProps) {
  const isVoiceService = serviceName === "Voice Assistant"

  if (isVoiceService) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold mb-4">🎤 Voice Assistant</h2>
        <div className="bg-gray-50 p-6 rounded-lg mb-4 border max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm md:text-base mb-4">
              Voice Assistant is ready to help you navigate and control your desktop environment.
            </p>
            <div className="space-y-2 text-xs md:text-sm text-gray-600">
              <p>• "Open login window"</p>
              <p>• "Show banking service"</p>
              <p>• "Close all windows"</p>
              <p>• "What can you do?"</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm md:text-base"
            style={{ touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer" }}
          >
            🎙️ Start Listening
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition-colors text-sm md:text-base"
            style={{ touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer" }}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h2 className="text-lg md:text-2xl font-bold mb-4 capitalize">{serviceName} Service</h2>
      <div className="bg-gray-50 p-6 rounded-lg mb-4 border">
        <p className="mb-4 text-sm md:text-base">Welcome to the {serviceName} service!</p>
        <p className="text-xs md:text-sm text-gray-600 mb-4">
          This is a placeholder for the {serviceName} application. Future versions will include full {serviceName}{" "}
          functionality.
        </p>
        <div className="text-xs md:text-sm text-gray-500">
          Service Status: <span className="text-green-600 font-semibold">Active</span>
        </div>
      </div>
      <button
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm md:text-base"
        style={{ touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer" }}
      >
        Get Started
      </button>
    </div>
  )
}
