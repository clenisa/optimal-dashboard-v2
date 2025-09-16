"use client"

import React from "react"

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={
        "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-skip-link bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      }
    >
      Skip to main content
    </a>
  )
}

