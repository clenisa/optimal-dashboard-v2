import { APP_DIMENSIONS } from './constants'

export type AppId =
  | "supabase-login"
  | "csv-parser"
  | "category-line-chart"
  | "payment-source-balances"
  | "transaction-manager"
  | "mortgage-calculator"
  | "ai-chat-console"
  | "credits-manager"
  | "service-app"
  | "debug-console"
  | "about-this-desktop"
  | "desktop-settings"

export interface AppDefinition {
  id: AppId
  title: string
  defaultWidth: number
  defaultHeight: number
  requiresAuth?: boolean
  category?: 'financial' | 'ai' | 'tools' | 'system'
  description?: string
  developmentOnly?: boolean
  canBeDesktop?: boolean
}

export const appDefinitions: AppDefinition[] = [
  // AI & Communication
  {
    id: "ai-chat-console",
    title: "AI Assistant",
    defaultWidth: APP_DIMENSIONS.MEDIUM.width,
    defaultHeight: APP_DIMENSIONS.LARGE.height,
    requiresAuth: true,
    category: 'ai',
    description: "Chat with AI via your local ElectronConsole with Ollama",
    canBeDesktop: true,
  },
  {
    id: "credits-manager",
    title: "Credits & Billing",
    defaultWidth: APP_DIMENSIONS.LARGE.width,
    defaultHeight: APP_DIMENSIONS.LARGE.height,
    requiresAuth: true,
    category: 'ai',
    description: "Manage AI credits and purchase additional credits",
    canBeDesktop: true,
  },
  
  // Financial Management
  {
    id: "category-line-chart",
    title: "Category Trends",
    defaultWidth: APP_DIMENSIONS.LARGE.width,
    defaultHeight: APP_DIMENSIONS.MEDIUM.height,
    requiresAuth: true,
    category: 'financial',
    description: "Spending trends by category over time",
    canBeDesktop: true,
  },
  {
    id: "payment-source-balances",
    title: "Account Balances",
    defaultWidth: APP_DIMENSIONS.LARGE.width,
    defaultHeight: APP_DIMENSIONS.LARGE.height,
    requiresAuth: true,
    category: 'financial',
    description: "Payment source balances with threshold filtering",
    canBeDesktop: true,
  },
  { 
    id: "transaction-manager",
    title: "Transaction Manager",
    defaultWidth: APP_DIMENSIONS.XLARGE.width,
    defaultHeight: APP_DIMENSIONS.LARGE.height,
    requiresAuth: true,
    category: 'financial',
    description: "Manage and view financial transactions",
    canBeDesktop: true,
  },
  {
    id: "mortgage-calculator",
    title: "Mortgage Calculator",
    defaultWidth: APP_DIMENSIONS.LARGE.width,
    defaultHeight: APP_DIMENSIONS.LARGE.height,
    category: 'financial',
    description: "Estimate mortgage payments with escrow details",
    canBeDesktop: true,
  },
  
  // Tools
  {
    id: "csv-parser",
    title: "CSV Parser",
    defaultWidth: APP_DIMENSIONS.LARGE.width,
    defaultHeight: APP_DIMENSIONS.LARGE.height,
    requiresAuth: true,
    category: 'tools',
    description: "Parse and analyze CSV files",
    canBeDesktop: true,
  },
  
  // System
  {
    id: "desktop-settings",
    title: "Desktop Settings",
    defaultWidth: 500,
    defaultHeight: 400,
    category: 'system',
    description: "Configure desktop service and appearance",
  },
  {
    id: "supabase-login",
    title: "Authentication",
    defaultWidth: 400,
    defaultHeight: 500,
    category: 'system',
    description: "Login and user authentication"
  },
  {
    id: "service-app",
    title: "Services",
    defaultWidth: APP_DIMENSIONS.MEDIUM.width,
    defaultHeight: APP_DIMENSIONS.MEDIUM.height,
    category: 'system',
    description: "System services and configuration"
  },
  {
    id: "debug-console",
    title: "Debug Console",
    defaultWidth: APP_DIMENSIONS.LARGE.width,
    defaultHeight: APP_DIMENSIONS.MEDIUM.height,
    category: 'system',
    description: "Development and debugging tools",
    developmentOnly: true
  },
  {
    id: "about-this-desktop",
    title: "About",
    defaultWidth: APP_DIMENSIONS.MEDIUM.width,
    defaultHeight: APP_DIMENSIONS.SMALL.height,
    category: 'system',
    description: "About this desktop application"
  }
]

export function getAppDefinition(id: AppId): AppDefinition | undefined {
  return appDefinitions.find(app => app.id === id)
}

export function getAppsByCategory(category: AppDefinition['category']): AppDefinition[] {
  return appDefinitions.filter(app => app.category === category)
}

export function getFinancialApps(): AppDefinition[] {
  return getAppsByCategory('financial')
}

export function getAIApps(): AppDefinition[] {
  return getAppsByCategory('ai')
}

export function getSystemApps(): AppDefinition[] {
  const systemApps = getAppsByCategory('system')
  // Filter out development-only apps in production
  if (process.env.NODE_ENV === 'production') {
    return systemApps.filter(app => !app.developmentOnly)
  }
  return systemApps
}

export function getToolApps(): AppDefinition[] {
  return getAppsByCategory('tools')
}

export function getDesktopCapableApps(): AppDefinition[] {
  return appDefinitions.filter(app => app.canBeDesktop && !app.developmentOnly)
}

