import { 
  DirectoryInfo, 
  FileInfo, 
  SearchQuery, 
  SearchResult, 
  ErrorState,
  ValidationError 
} from '../types'

export function isDirectoryInfo(obj: unknown): obj is DirectoryInfo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as DirectoryInfo).name === 'string' &&
    typeof (obj as DirectoryInfo).path === 'string' &&
    typeof (obj as DirectoryInfo).date === 'string' &&
    typeof (obj as DirectoryInfo).fileCount === 'number' &&
    (obj as DirectoryInfo).lastModified instanceof Date &&
    typeof (obj as DirectoryInfo).isDateBased === 'boolean'
  )
}

export function isFileInfo(obj: unknown): obj is FileInfo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as FileInfo).name === 'string' &&
    typeof (obj as FileInfo).path === 'string' &&
    typeof (obj as FileInfo).relativePath === 'string' &&
    typeof (obj as FileInfo).size === 'number' &&
    (obj as FileInfo).lastModified instanceof Date &&
    ['markdown', 'text', 'other'].includes((obj as FileInfo).type) &&
    Array.isArray((obj as FileInfo).tags) &&
    typeof (obj as FileInfo).isFavorite === 'boolean'
  )
}

export function isSearchQuery(obj: unknown): obj is SearchQuery {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray((obj as SearchQuery).tags) &&
    ['AND', 'OR'].includes((obj as SearchQuery).operator) &&
    typeof (obj as SearchQuery).includeContent === 'boolean'
  )
}

export function isSearchResult(obj: unknown): obj is SearchResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isFileInfo((obj as SearchResult).file) &&
    Array.isArray((obj as SearchResult).matchedTags) &&
    typeof (obj as SearchResult).score === 'number'
  )
}

export function validatePath(path: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!path || typeof path !== 'string') {
    errors.push({ field: 'path', message: 'Path is required and must be a string' })
    return errors
  }
  
  if (path.includes('..')) {
    errors.push({ field: 'path', message: 'Path traversal is not allowed', value: path })
  }
  
  if (path.length > 1000) {
    errors.push({ field: 'path', message: 'Path is too long (max 1000 characters)', value: path })
  }
  
  return errors
}

export function validateSearchQuery(query: SearchQuery): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!Array.isArray(query.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' })
  } else if (query.tags.length === 0) {
    errors.push({ field: 'tags', message: 'At least one tag is required for search' })
  }
  
  if (!['AND', 'OR'].includes(query.operator)) {
    errors.push({ field: 'operator', message: 'Operator must be either AND or OR' })
  }
  
  if (typeof query.includeContent !== 'boolean') {
    errors.push({ field: 'includeContent', message: 'includeContent must be a boolean' })
  }
  
  if (query.dateRange) {
    if (!(query.dateRange.start instanceof Date) || !(query.dateRange.end instanceof Date)) {
      errors.push({ field: 'dateRange', message: 'Date range start and end must be Date objects' })
    } else if (query.dateRange.start > query.dateRange.end) {
      errors.push({ field: 'dateRange', message: 'Start date must be before end date' })
    }
  }
  
  return errors
}

export function createErrorState(
  code: string, 
  message: string, 
  details?: unknown
): ErrorState {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  }
}

export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '')
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .trim()
}

export function isValidFileType(filename: string): boolean {
  const allowedExtensions = ['.md', '.txt', '.json', '.log']
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedExtensions.includes(extension)
}

export function extractFileType(filename: string): FileInfo['type'] {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  switch (extension) {
    case '.md':
      return 'markdown'
    case '.txt':
    case '.log':
      return 'text'
    default:
      return 'other'
  }
}