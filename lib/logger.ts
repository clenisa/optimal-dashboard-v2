import { CONFIG } from './config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!CONFIG.logging.enableDebugLogs && level === 'debug') {
      return false
    }
    return true
  }

  private formatMessage(level: LogLevel, component: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`
    }
    
    return baseMessage
  }

  debug(component: string, message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', component, message, data))
    }
  }

  info(component: string, message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', component, message, data))
    }
  }

  warn(component: string, message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', component, message, data))
    }
  }

  error(component: string, message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', component, message, data))
    }
  }
}

export const logger = new Logger()

