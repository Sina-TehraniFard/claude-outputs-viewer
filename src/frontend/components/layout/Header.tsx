import { Menu, Moon, Sun, Search, Bell } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useApp, useAppActions } from '../../contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { state } = useApp()
  const { setTheme } = useAppActions()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light')
  }

  const openSearch = () => {
    navigate('/search')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-125 sticky top-0 z-30">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-accent hover:scale-110 rounded-md transition-all duration-200 md:hidden cursor-pointer"
                aria-label="サイドバーを切り替え"
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>メニューを開く</p>
            </TooltipContent>
          </Tooltip>

        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={openSearch}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">クイック検索...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>クリックまたは ⌘K で検索を開始</p>
            </TooltipContent>
          </Tooltip>

          {/* Notification Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="p-2 hover:bg-accent hover:scale-110 rounded-md transition-all duration-200 cursor-pointer relative"
                onClick={() => navigate('/notifications')}
                aria-label="通知設定"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {state.notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {state.notifications.length > 9 ? '9+' : state.notifications.length}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>通知設定</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="p-2 hover:bg-accent hover:scale-110 rounded-md transition-all duration-200 cursor-pointer"
                onClick={toggleTheme}
                aria-label="テーマを切り替え"
              >
                {state.theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{state.theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}