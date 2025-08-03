import { DirectoryInfo, FileInfo, SearchQuery, SearchResult, ErrorState } from './index'

export interface GetDirectoriesResponse {
  directories: DirectoryInfo[]
}

export interface GetFilesResponse {
  files: FileInfo[]
  directory: DirectoryInfo
}

export interface GetFileContentResponse {
  content: string
  file: FileInfo
}

export interface UpdateFileContentRequest {
  content: string
}

export interface UpdateFileContentResponse {
  success: boolean
  file: FileInfo
}

export interface SearchRequest {
  query: SearchQuery
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

export interface CopyPathRequest {
  path: string
}

export interface CopyPathResponse {
  success: boolean
  copiedPath: string
}

export interface DeleteFileRequest {
  path: string
  confirm: boolean
}

export interface DeleteFileResponse {
  success: boolean
  deletedPath: string
}

export interface ApiErrorResponse {
  success: false
  error: ErrorState
}

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiResult<T> = ApiSuccess<T> | ApiErrorResponse