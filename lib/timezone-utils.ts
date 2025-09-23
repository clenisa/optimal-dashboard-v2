import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz'
import { startOfDay, isSameDay } from 'date-fns'

const EST_TIMEZONE = 'America/New_York'

/**
 * Get current date in EST timezone as YYYY-MM-DD string
 */
export function getCurrentESTDate(): string {
  const now = new Date()
  return formatInTimeZone(now, EST_TIMEZONE, 'yyyy-MM-dd')
}

/**
 * Get start of day in EST timezone as UTC timestamp
 */
export function getESTStartOfDay(date?: Date): Date {
  const targetDate = date || new Date()
  const estDate = toZonedTime(targetDate, EST_TIMEZONE)
  const startOfDayEST = startOfDay(estDate)
  return fromZonedTime(startOfDayEST, EST_TIMEZONE)
}

/**
 * Get next midnight in EST timezone as UTC timestamp
 */
export function getNextESTMidnight(): Date {
  const now = new Date()
  const estNow = toZonedTime(now, EST_TIMEZONE)
  const tomorrow = new Date(estNow)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const startOfTomorrowEST = startOfDay(tomorrow)
  return fromZonedTime(startOfTomorrowEST, EST_TIMEZONE)
}

/**
 * Check if two dates are the same day in EST timezone
 */
export function isSameDayEST(date1: Date, date2: Date): boolean {
  const est1 = toZonedTime(date1, EST_TIMEZONE)
  const est2 = toZonedTime(date2, EST_TIMEZONE)
  return isSameDay(est1, est2)
}

/**
 * Convert date string to EST date for comparison
 */
export function parseESTDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return fromZonedTime(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`, EST_TIMEZONE)
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
