// Frontend API types
export interface DirectoryInfo {
  name: string
  path: string
  date: string
  fileCount: number
  lastModified: string
  isDateBased: boolean
}

export interface FileInfo {
  name: string
  path: string
  relativePath: string
  size: number
  lastModified: string
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
    start: string
    end: string
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

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    timestamp: string
  }
}

export interface GetDirectoriesResponse {
  directories: DirectoryInfo[]
}

export interface GetFilesResponse {
  files: FileInfo[]
  directory: DirectoryInfo
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  searchTime: number
}

export interface GetTagsResponse {
  tags: string[]
  count: number
}