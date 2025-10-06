"use client"

import { SupabaseLoginApp } from '@/components/supabase-login-app'
import { CsvParserApp } from '@/components/csv-parser-app'
import { CsvCombinerApp } from '@/components/csv-combiner-app'
import { CategoryLineChart } from '@/components/category-line-chart'
import { PaymentSourceBalances } from '@/components/payment-source-balances'
import { TransactionManager } from '@/components/transaction-manager'
import { MortgageCalculatorApp } from '@/components/mortgage-calculator-app'
import { AIChatConsole } from '@/components/ai-chat-console'
import { CreditsManager } from '@/components/credits-manager'
import { ServiceApp } from '@/components/service-app'
import { DebugConsole } from '@/components/debug-console'
import { AboutThisDesktopApp } from '@/components/about-this-desktop-app'
import { DesktopServiceSettings } from '@/components/desktop-service-settings'
import type { AppId } from '@/lib/app-definitions'

const APP_COMPONENTS: Record<AppId, () => JSX.Element> = {
  'supabase-login': () => <SupabaseLoginApp />,
  'csv-parser': () => <CsvParserApp />,
  'csv-combiner': () => <CsvCombinerApp />,
  'category-line-chart': () => <CategoryLineChart />,
  'payment-source-balances': () => <PaymentSourceBalances />,
  'transaction-manager': () => <TransactionManager />,
  'mortgage-calculator': () => <MortgageCalculatorApp />,
  'ai-chat-console': () => <AIChatConsole />,
  'credits-manager': () => <CreditsManager />,
  'service-app': () => <ServiceApp serviceName="Default Service" />,
  'debug-console': () => <DebugConsole />,
  'about-this-desktop': () => <AboutThisDesktopApp />,
  'desktop-settings': () => <DesktopServiceSettings />,
}

export function AppRenderer({ appId }: { appId: AppId }) {
  const Component = APP_COMPONENTS[appId]
  if (!Component) {
    return <div>App not found</div>
  }
  return <Component />
}
