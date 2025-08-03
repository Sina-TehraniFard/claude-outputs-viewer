import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { DirectorySidebar } from './DirectorySidebar'
import { useApp } from '../../contexts/AppContext'
import { cn } from '../../lib/utils'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { state } = useApp()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [directorySidebarOpen, setDirectorySidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
        setDirectorySidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ディレクトリ関連のパスかチェック
  useEffect(() => {
    const isDirectoryPath = location.pathname === '/directories' || 
                           location.pathname.startsWith('/directory/') ||
                           location.pathname.startsWith('/file/')
    setDirectorySidebarOpen(isDirectoryPath && !isMobile)
  }, [location, isMobile])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <DirectorySidebar 
        isOpen={directorySidebarOpen} 
        onClose={() => setDirectorySidebarOpen(false)}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
      />
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        !isMobile && sidebarOpen && directorySidebarOpen ? "ml-[32rem]" : // 256px + 256px
        !isMobile && !sidebarOpen && directorySidebarOpen ? "ml-80" : // 64px + 256px
        !isMobile && sidebarOpen && !directorySidebarOpen ? "ml-64" : // 256px only
        !isMobile && !sidebarOpen && !directorySidebarOpen ? "ml-16" : // 64px only
        "ml-0" // mobile
      )}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="container mx-auto p-6">
        {state.error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm font-medium">{state.error}</p>
          </div>
        )}
        
          {children}
        </main>
      </div>
      
      {state.isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-foreground">読み込み中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}