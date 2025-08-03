import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { DirectoryInfo, FileInfo, SearchResult, SearchQuery } from '../types/api'

export interface AppState {
  // Navigation
  currentDirectory: string | null
  selectedFile: FileInfo | null
  
  // Data
  directories: DirectoryInfo[]
  files: FileInfo[]
  searchResults: SearchResult[]
  availableTags: string[]
  
  // UI State
  isLoading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  searchQuery: SearchQuery
  
  // User preferences
  favorites: string[]
  theme: 'light' | 'dark'
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DIRECTORIES'; payload: DirectoryInfo[] }
  | { type: 'SET_FILES'; payload: FileInfo[] }
  | { type: 'SET_CURRENT_DIRECTORY'; payload: string | null }
  | { type: 'SET_SELECTED_FILE'; payload: FileInfo | null }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_AVAILABLE_TAGS'; payload: string[] }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SEARCH_QUERY'; payload: SearchQuery }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'CLEAR_SEARCH' }

const initialState: AppState = {
  currentDirectory: null,
  selectedFile: null,
  directories: [],
  files: [],
  searchResults: [],
  availableTags: [],
  isLoading: false,
  error: null,
  viewMode: 'grid',
  searchQuery: {
    tags: [],
    operator: 'OR',
    includeContent: false
  },
  favorites: JSON.parse(localStorage.getItem('claude-outputs-favorites') || '[]'),
  theme: (localStorage.getItem('claude-outputs-theme') as 'light' | 'dark') || 'light'
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'SET_DIRECTORIES':
      return { ...state, directories: action.payload, isLoading: false }
    
    case 'SET_FILES':
      return { ...state, files: action.payload, isLoading: false }
    
    case 'SET_CURRENT_DIRECTORY':
      return { 
        ...state, 
        currentDirectory: action.payload,
        selectedFile: null,
        searchResults: []
      }
    
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload }
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isLoading: false }
    
    case 'SET_AVAILABLE_TAGS':
      return { ...state, availableTags: action.payload }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'TOGGLE_FAVORITE': {
      const favorites = state.favorites.includes(action.payload)
        ? state.favorites.filter(f => f !== action.payload)
        : [...state.favorites, action.payload]
      
      localStorage.setItem('claude-outputs-favorites', JSON.stringify(favorites))
      return { ...state, favorites }
    }
    
    case 'SET_THEME':
      localStorage.setItem('claude-outputs-theme', action.payload)
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { ...state, theme: action.payload }
    
    case 'CLEAR_SEARCH':
      return { 
        ...state, 
        searchResults: [],
        searchQuery: {
          tags: [],
          operator: 'OR',
          includeContent: false
        }
      }
    
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize theme on mount
  React.useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Custom hooks for common operations
export function useAppActions() {
  const { dispatch } = useApp()

  return {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setDirectories: (directories: DirectoryInfo[]) => dispatch({ type: 'SET_DIRECTORIES', payload: directories }),
    setFiles: (files: FileInfo[]) => dispatch({ type: 'SET_FILES', payload: files }),
    setCurrentDirectory: (dir: string | null) => dispatch({ type: 'SET_CURRENT_DIRECTORY', payload: dir }),
    setSelectedFile: (file: FileInfo | null) => dispatch({ type: 'SET_SELECTED_FILE', payload: file }),
    setSearchResults: (results: SearchResult[]) => dispatch({ type: 'SET_SEARCH_RESULTS', payload: results }),
    setAvailableTags: (tags: string[]) => dispatch({ type: 'SET_AVAILABLE_TAGS', payload: tags }),
    setViewMode: (mode: 'grid' | 'list') => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    setSearchQuery: (query: SearchQuery) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    toggleFavorite: (filePath: string) => dispatch({ type: 'TOGGLE_FAVORITE', payload: filePath }),
    setTheme: (theme: 'light' | 'dark') => dispatch({ type: 'SET_THEME', payload: theme }),
    clearSearch: () => dispatch({ type: 'CLEAR_SEARCH' })
  }
}