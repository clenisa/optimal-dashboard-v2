import { CONFIG } from './config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private readonly nativeLog = console.log.bind(console)
  private readonly nativeInfo = console.info.bind(console)
  private readonly nativeWarn = console.warn.bind(console)
  private readonly nativeError = console.error.bind(console)
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
      this.nativeLog(this.formatMessage('debug', component, message, data))
    }
  }

  info(component: string, message: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.nativeInfo(this.formatMessage('info', component, message, data))
    }
  }

  warn(component: string, message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      this.nativeWarn(this.formatMessage('warn', component, message, data))
    }
  }

  error(component: string, message: string, data?: any): void {
    if (this.shouldLog('error')) {
      this.nativeError(this.formatMessage('error', component, message, data))
    }
  }
}

export const logger = new Logger()

