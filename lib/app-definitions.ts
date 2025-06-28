export type AppId = 
  | "supabase-login"
  | "csv-parser"
  | "category-line-chart"
  | "payment-source-balances"
  | "ai-chat-console"
  | "credits-manager"
  | "service-app"
  | "debug-console"
  | "about-this-desktop"

export interface AppDefinition {
  id: AppId
  title: string
  defaultWidth: number
  defaultHeight: number
  requiresAuth?: boolean
  category?: 'financial' | 'ai' | 'tools' | 'system'
  description?: string
}

export const appDefinitions: AppDefinition[] = [
  // AI & Communication
  {
    id: "ai-chat-console",
    title: "AI Assistant",
    defaultWidth: 600,
    defaultHeight: 700,
    requiresAuth: true,
    category: 'ai',
    description: "Chat with AI via your local ElectronConsole with Ollama"
  },
  {
    id: "credits-manager",
    title: "Credits & Billing",
    defaultWidth: 800,
    defaultHeight: 600,
    requiresAuth: true,
    category: 'ai',
    description: "Manage AI credits and purchase additional credits"
  },
  
  // Financial Management
  {
    id: "category-line-chart",
    title: "Category Trends",
    defaultWidth: 800,
    defaultHeight: 500,
    requiresAuth: true,
    category: 'financial',
    description: "Spending trends by category over time"
  },
  {
    id: "payment-source-balances",
    title: "Account Balances",
    defaultWidth: 700,
    defaultHeight: 500,
    requiresAuth: true,
    category: 'financial',
    description: "Payment source balances with threshold filtering"
  },
  
  // Tools
  {
    id: "csv-parser",
    title: "CSV Parser",
    defaultWidth: 600,
    defaultHeight: 400,
    requiresAuth: true,
    category: 'tools',
    description: "Parse and analyze CSV files"
  },
  
  // System
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
    defaultWidth: 500,
    defaultHeight: 400,
    category: 'system',
    description: "System services and configuration"
  },
  {
    id: "debug-console",
    title: "Debug Console",
    defaultWidth: 700,
    defaultHeight: 500,
    category: 'system',
    description: "Development and debugging tools"
  },
  {
    id: "about-this-desktop",
    title: "About",
    defaultWidth: 500,
    defaultHeight: 400,
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
  return getAppsByCategory('system')
}

export function getToolApps(): AppDefinition[] {
  return getAppsByCategory('tools')
}

