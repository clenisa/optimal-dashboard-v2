"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Voice Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-4">Voice assistant functionality coming soon...</p>
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
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
          <h2 className="text-2xl font-bold mb-6">Banking Services</h2>

          <div className="grid grid-cols-1 gap-4 w-full max-w-md">
            {/* Credit and Investment shortcuts */}
            <Button
              onClick={() => setCurrentView("credit-analytics")}
              className="px-8 py-4 font-mono text-sm border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors bg-transparent text-red-500"
            >
              💳 Credit Analytics
            </Button>

            <Button
              onClick={() => setCurrentView("investment-analytics")}
              className="px-8 py-4 font-mono text-sm border-2 border-green-500 hover:bg-green-500 hover:text-white transition-colors bg-transparent text-green-500"
            >
              📈 Investment Analytics
            </Button>

            {/* Original Banking options */}
            <Button
              onClick={() => setCurrentView("analytics")}
              className="px-8 py-4 font-mono text-sm border-2 border-black hover:bg-black hover:text-white transition-colors bg-transparent text-black"
            >
              📊 Analytics
            </Button>

            <Button
              onClick={() => setCurrentView("import-data")}
              className="px-8 py-4 font-mono text-sm border-2 border-black hover:bg-black hover:text-white transition-colors bg-transparent text-black"
            >
              📁 Import Data
            </Button>
          </div>
        </div>
      )
    }

    // Fallback
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">{serviceName} service is not available at this time.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {serviceName === "Banking" && currentView !== "menu" && (
        <div className="absolute top-2 left-2 z-10">
          <Button onClick={() => setCurrentView("menu")} variant="outline" size="sm">
            ← Back to Banking
          </Button>
        </div>
      )}
      {renderContent()}
    </div>
  )
}
