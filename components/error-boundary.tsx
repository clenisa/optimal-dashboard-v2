'use client'

import React from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Something went wrong. Please try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.retry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Specific error fallback for credits
export function CreditsErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p>Failed to load credits information.</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Unknown error occurred'}
          </p>
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
