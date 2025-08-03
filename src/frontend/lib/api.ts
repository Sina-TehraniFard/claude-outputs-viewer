import { 
  ApiResponse, 
  GetDirectoriesResponse, 
  GetFilesResponse, 
  SearchQuery, 
  SearchResponse, 
  GetTagsResponse 
} from '../types/api'

const API_BASE_URL = 'http://localhost:3001/api'

class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      throw new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unknown error occurred'
      )
    }

    return data.data!
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('NETWORK_ERROR', 'Unable to connect to the server')
    }
    
    throw new ApiError('UNKNOWN_ERROR', 'An unexpected error occurred')
  }
}

export const api = {
  // Health check
  async health(): Promise<{ status: string; timestamp: string; version: string }> {
    return apiRequest('/health')
  },

  // Directory operations
  async getDirectories(): Promise<GetDirectoriesResponse> {
    return apiRequest('/directories')
  },

  // File operations
  async getFiles(directoryPath: string): Promise<GetFilesResponse> {
    return apiRequest(`/files?directory=${encodeURIComponent(directoryPath)}`)
  },

  async getFileContent(filePath: string): Promise<{ content: string; file: any }> {
    return apiRequest(`/file/content?path=${encodeURIComponent(filePath)}`)
  },

  async updateFileContent(filePath: string, content: string): Promise<{ success: boolean; file: any }> {
    return apiRequest(`/file/content?path=${encodeURIComponent(filePath)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  },

  async deleteFile(filePath: string, confirm: boolean = false): Promise<{ success: boolean; deletedPath: string }> {
    return apiRequest(`/file?path=${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirm }),
    })
  },

  async copyFilePath(filePath: string): Promise<{ success: boolean; copiedPath: string }> {
    return apiRequest(`/file/copy-path?path=${encodeURIComponent(filePath)}`, {
      method: 'POST',
    })
  },

  // Search operations
  async searchFiles(query: SearchQuery): Promise<SearchResponse> {
    return apiRequest('/search', {
      method: 'POST',
      body: JSON.stringify(query),
    })
  },

  async getAllTags(): Promise<GetTagsResponse> {
    return apiRequest('/search/tags')
  },
}

export { ApiError }