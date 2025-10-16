"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from "@/lib/design-tokens"
import CategoryLineChart from "./category-line-chart"
import { PaymentSourceBalances } from "./payment-source-balances"
import { CsvParserApp } from "./csv-parser-app"

interface ServiceAppProps {
  serviceName: string
}

export function ServiceApp({ serviceName }: ServiceAppProps) {
  const [currentView, setCurrentView] = useState<string>("menu")

  const renderContent = () => {
    // Direct service mappings for Investment and Credit (standalone)
    if (serviceName === "Investment") {
      return <CategoryLineChart />
    }

    if (serviceName === "Credit") {
      return <PaymentSourceBalances />
    }

    if (serviceName === "Voice Assistant") {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <Card className={cn("w-full max-w-md border", SURFACE_TOKENS.primary)}>
            <CardHeader>
              <CardTitle className={TYPOGRAPHY_TOKENS.heading}>Voice Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Voice assistant functionality is coming soon. Stay tuned for hands-free financial insights.
              </p>
              <Button className="w-full" disabled>
                🎤 Start Voice Command
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Banking service with menu (includes Credit and Investment shortcuts)
    if (serviceName === "Banking") {
      if (currentView === "credit-analytics") {
        return <PaymentSourceBalances />
      }

      if (currentView === "investment-analytics") {
        return <CategoryLineChart />
      }

      if (currentView === "analytics") {
        return <CategoryLineChart />
      }

      if (currentView === "import-data") {
        return <CsvParserApp />
      }

      // Banking menu with Credit and Investment shortcuts
      return (
        <div className={cn('flex h-full flex-col items-center justify-center space-y-6', SPACING_TOKENS.container)}>
          <h2 className="text-2xl font-semibold tracking-tight">Banking Services</h2>

          <div className="grid w-full max-w-xl grid-cols-1 gap-4">
            <Button
              onClick={() => setCurrentView("credit-analytics")}
              variant="outline"
              className={cn(
                "group flex items-center justify-between rounded-lg border px-6 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10",
                SURFACE_TOKENS.primary,
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">💳</span>
                Credit Analytics
              </span>
              <span className="text-xs text-muted-foreground">Track utilization & limits</span>
            </Button>

            <Button
              onClick={() => setCurrentView("investment-analytics")}
              variant="outline"
              className={cn(
                "group flex items-center justify-between rounded-lg border px-6 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10",
                SURFACE_TOKENS.primary,
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">📈</span>
                Investment Analytics
              </span>
              <span className="text-xs text-muted-foreground">Visualize growth trends</span>
            </Button>

            <Button
              onClick={() => setCurrentView("analytics")}
              variant="outline"
              className={cn(
                "flex items-center justify-between rounded-lg border px-6 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10",
                SURFACE_TOKENS.primary,
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">📊</span>
                Banking Analytics
              </span>
              <span className="text-xs text-muted-foreground">Comprehensive dashboards</span>
            </Button>

            <Button
              onClick={() => setCurrentView("import-data")}
              variant="outline"
              className={cn(
                "flex items-center justify-between rounded-lg border px-6 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10",
                SURFACE_TOKENS.primary,
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">📁</span>
                Import Data
              </span>
              <span className="text-xs text-muted-foreground">Clean & merge statements</span>
            </Button>
          </div>
        </div>
      )
    }

    // Fallback
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className={cn('border', SURFACE_TOKENS.primary)}>
          <CardContent className={cn('text-center text-sm text-muted-foreground', SPACING_TOKENS.card)}>
            {serviceName} service is not available at this time.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {serviceName === "Banking" && currentView !== "menu" && (
        <div className="absolute left-3 top-3 z-10">
          <Button onClick={() => setCurrentView("menu")} variant="ghost" size="sm" className="gap-1">
            ← Back to Banking
          </Button>
        </div>
      )}
      {renderContent()}
    </div>
  )
}
