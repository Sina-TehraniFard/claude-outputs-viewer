export interface DirectoryInfo {
  name: string
  path: string
  date: string
  fileCount: number
  lastModified: Date
  isDateBased: boolean
}

export interface FileInfo {
  name: string
  path: string
  relativePath: string
  size: number
  lastModified: Date
  type: 'markdown' | 'text' | 'other'
  tags: string[]
  preview?: string
  isFavorite: boolean
}

export interface SearchQuery {
  tags: string[]
  operator: 'AND' | 'OR'
  includeContent: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface SearchResult {
  file: FileInfo
  matchedTags: string[]
  contentMatches?: {
    line: number
    text: string
    highlighted: string
  }[]
  score: number
}

export interface AppState {
  currentDirectory: string | null
  directories: DirectoryInfo[]
  files: FileInfo[]
  searchResults: SearchResult[]
  favorites: string[]
  isLoading: boolean
  error: ErrorState | null
  searchQuery: SearchQuery
  viewMode: 'grid' | 'list'
  selectedFile: FileInfo | null
  availableTags: string[]
}

export interface ErrorState {
  code: string
  message: string
  details?: unknown
  timestamp: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ErrorState
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export interface FileOperationResult {
  success: boolean
  filePath: string
  operation: 'read' | 'write' | 'delete' | 'copy'
  error?: ErrorState
}

export interface TagExtractionResult {
  tags: string[]
  content: string
  metadata: {
    wordCount: number
    lineCount: number
    hasCodeBlocks: boolean
  }
}

export * from './api'