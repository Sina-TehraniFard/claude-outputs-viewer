export const API_ENDPOINTS = {
  DIRECTORIES: '/api/directories',
  FILES: '/api/files',
  SEARCH: '/api/search',
  SEARCH_TAGS: '/api/search/tags'
} as const

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  INVALID_PATH: 'INVALID_PATH',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const

export const FILE_TYPES = {
  MARKDOWN: 'markdown',
  TEXT: 'text',
  OTHER: 'other'
} as const

export const SEARCH_OPERATORS = {
  AND: 'AND',
  OR: 'OR'
} as const

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_SEARCH_RESULTS = 100
export const DEBOUNCE_DELAY = 300
export const PREVIEW_LENGTH = 200

export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY HH:mm'
} as const

export const SUPPORTED_FILE_EXTENSIONS = [
  '.md',
  '.txt',
  '.log',
  '.json'
] as const