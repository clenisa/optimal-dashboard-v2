// Environment-based configuration
export const CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },
  
  electronConsole: {
    url: process.env.NEXT_PUBLIC_ELECTRON_CONSOLE_URL || 'http://localhost:3000',
  },
  
  logging: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
  },
} as const

