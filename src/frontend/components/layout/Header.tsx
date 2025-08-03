import { Menu, Moon, Sun, Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useApp, useAppActions } from '../../contexts/AppContext'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { state } = useApp()
  const { setTheme } = useAppActions()

  const toggleTheme = () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="h-16 border-b border-border bg-background sticky top-0 z-30">
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

          {/* Breadcrumb or Page Title */}
          <div className="flex items-center gap-2 text-sm">
            {state.selectedFile ? (
              <>
                <span className="text-muted-foreground">{state.currentDirectory}</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium text-foreground">{state.selectedFile.name}</span>
              </>
            ) : state.currentDirectory ? (
              <span className="font-medium text-foreground">{state.currentDirectory}</span>
            ) : (
              <span className="font-medium text-foreground">ダッシュボード</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer">
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