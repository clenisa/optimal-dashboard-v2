// UI Constants
export const UI_CONSTANTS = {
  DEFAULT_THRESHOLD_PERCENTAGE: 30,
  MAX_FILE_SIZE_MB: 10,
  CHART_ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
} as const

// Chart Constants
export const CHART_CONSTANTS = {
  DEFAULT_CHART_HEIGHT: 400,
  MAX_DATA_POINTS: 100,
  LEGEND_POSITION: 'top',
} as const

// App Dimension Constants
export const APP_DIMENSIONS = {
  SMALL: { width: 400, height: 300 },
  MEDIUM: { width: 600, height: 500 },
  LARGE: { width: 800, height: 600 },
  XLARGE: { width: 1000, height: 700 },
} as const

// CSV Upload Constants
export const CSV_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_EXTENSIONS: ['.csv'],
  REQUIRED_COLUMNS: ['Date', 'Amount', 'Description', 'Category'],
  DATE_FORMATS: ['YYYY-MM-DD', 'MM/DD/YYYY'],
} as const

