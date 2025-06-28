// Simple, centralized logger for authentication and UI events
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
    setTimeout(() => console.log(formatted), 0)
  }

  warn(message: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("WARN", message, data)
    setTimeout(() => console.warn(formatted), 0)
  }

  error(message: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("ERROR", message, data)
    setTimeout(() => console.error(formatted), 0)
  }

  interaction(element: string, event: string, data?: any) {
    if (!this.isEnabled) return
    const formatted = this.formatMessage("INTERACTION", `${element} ${event}`, data)
    setTimeout(() => console.log(formatted), 0)
  }

  disable() {
    this.isEnabled = false
  }

  enable() {
    this.isEnabled = true
  }
}

export const authLogger = AuthLogger.getInstance()
