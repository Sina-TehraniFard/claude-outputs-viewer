import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { DirectoryInfo, FileInfo, SearchResult, SearchQuery } from '../types/api'
import { NotificationService, NotificationPayload } from '../services/NotificationService'

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
  
  // Notifications
  notifications: NotificationPayload[]
  notificationService: NotificationService | null
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
  | { type: 'ADD_NOTIFICATION'; payload: NotificationPayload }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_NOTIFICATION_SERVICE'; payload: NotificationService }
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
  theme: (localStorage.getItem('claude-outputs-theme') as 'light' | 'dark') || 'light',
  notifications: [],
  notificationService: null
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
    
    case 'ADD_NOTIFICATION': {
      const newNotificationId = `${action.payload.data.timestamp}_${action.payload.type}`
      const exists = state.notifications.some(n => 
        `${n.data.timestamp}_${n.type}` === newNotificationId
      )
      
      if (exists) {
        return state // Skip duplicate notification
      }
      
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => 
          `${n.data.timestamp}_${n.type}` !== action.payload
        )
      }
    
    case 'SET_NOTIFICATION_SERVICE':
      return {
        ...state,
        notificationService: action.payload
      }
    
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
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Initialize notification service
  useEffect(() => {
    const notificationService = new NotificationService()
    
    // Initialize the service
    notificationService.initialize().then(() => {
      dispatch({ type: 'SET_NOTIFICATION_SERVICE', payload: notificationService })
    })

    // Listen for file change notifications
    const handleFileChangeNotification = (event: CustomEvent<NotificationPayload>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: event.detail })
      
      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        const notificationId = `${event.detail.data.timestamp}_${event.detail.type}`
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId })
      }, 10000)
    }

    window.addEventListener('file_change_notification', handleFileChangeNotification as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('file_change_notification', handleFileChangeNotification as EventListener)
      notificationService.disconnect()
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
    addNotification: (notification: NotificationPayload) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    clearSearch: () => dispatch({ type: 'CLEAR_SEARCH' })
  }
}