import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'
import { startOfDay, isSameDay } from 'date-fns'

const EST_TIMEZONE = 'America/New_York'

/**
 * Get current date in EST timezone as YYYY-MM-DD string
 */
export function getCurrentESTDate(): string {
  const now = new Date()
  const estDate = utcToZonedTime(now, EST_TIMEZONE)
  return format(estDate, 'yyyy-MM-dd', { timeZone: EST_TIMEZONE })
}

/**
 * Get start of day in EST timezone as UTC timestamp
 */
export function getESTStartOfDay(date?: Date): Date {
  const targetDate = date || new Date()
  const estDate = utcToZonedTime(targetDate, EST_TIMEZONE)
  const startOfDayEST = startOfDay(estDate)
  return zonedTimeToUtc(startOfDayEST, EST_TIMEZONE)
}

/**
 * Get next midnight in EST timezone as UTC timestamp
 */
export function getNextESTMidnight(): Date {
  const now = new Date()
  const estNow = utcToZonedTime(now, EST_TIMEZONE)
  const tomorrow = new Date(estNow)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const startOfTomorrowEST = startOfDay(tomorrow)
  return zonedTimeToUtc(startOfTomorrowEST, EST_TIMEZONE)
}

/**
 * Check if two dates are the same day in EST timezone
 */
export function isSameDayEST(date1: Date, date2: Date): boolean {
  const est1 = utcToZonedTime(date1, EST_TIMEZONE)
  const est2 = utcToZonedTime(date2, EST_TIMEZONE)
  return isSameDay(est1, est2)
}

/**
 * Convert date string to EST date for comparison
 */
export function parseESTDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  const estDate = new Date(year, month - 1, day)
  return zonedTimeToUtc(estDate, EST_TIMEZONE)
}

/**
 * Get time remaining until next EST midnight in milliseconds
 */
export function getTimeToNextESTMidnight(): number {
  const now = new Date()
  const nextMidnight = getNextESTMidnight()
  return nextMidnight.getTime() - now.getTime()
}

/**
 * Format time difference as "Xh Ym Zs"
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '0h 0m 0s'
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  return `${hours}h ${minutes}m ${seconds}s`
}
