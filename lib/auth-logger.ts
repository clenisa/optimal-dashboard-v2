// Simple, centralized logger for authentication and UI events
import { logger } from '@/lib/logger'

export class AuthLogger {
  private static instance: AuthLogger
  private logQueue: string[] = []
  private isEnabled = true

  static getInstance(): AuthLogger {
    if (!AuthLogger.instance) {
      AuthLogger.instance = new AuthLogger()
    }
    return AuthLogger.instance
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ""
    return `[${timestamp}] [AUTH-${level}] ${message}${dataStr}`
  }

  log(message: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("LOG", message, data)
    logger.info('Auth', formatted)
  }

  warn(message: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("WARN", message, data)
    logger.warn('Auth', formatted)
  }

  error(message: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("ERROR", message, data)
    logger.error('Auth', formatted)
  }

  interaction(element: string, event: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("INTERACTION", `${element} ${event}`, data)
    logger.debug('Auth', formatted)
  }

  disable() {
    this.isEnabled = false
  }

  enable() {
    this.isEnabled = true
  }
}

export const authLogger = AuthLogger.getInstance()
