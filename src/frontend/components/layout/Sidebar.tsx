import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FolderOpen, 
  Search, 
  Star, 
  Menu, 
  X,
  Home,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { state } = useApp();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const favoriteCount = state.favorites.length;

  const navItems = [
    {
      icon: Home,
      label: 'ダッシュボード',
      path: '/',
      description: '概要と最近のファイル'
    },
    {
      icon: FolderOpen,
      label: 'ディレクトリ',
      path: '/directories',
      description: 'すべての出力ディレクトリを参照'
    },
    {
      icon: Search,
      label: '検索',
      path: '/search',
      description: 'コンテンツやタグでファイルを検索'
    },
    {
      icon: Star,
      label: 'お気に入り',
      path: '/favorites',
      description: 'ブックマークしたファイル',
      badge: favoriteCount > 0 ? favoriteCount : null
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-background border-r border-border transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center border-b border-border",
          isOpen ? "justify-between p-4" : "justify-center p-2"
        )}>
          {isOpen && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">CO</span>
              </div>
              <h1 className="font-semibold text-foreground whitespace-nowrap overflow-hidden">Claude Outputs</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-accent rounded-md transition-colors cursor-pointer"
            aria-label={isOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          >
            {isOpen ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                  active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  !isOpen && "justify-center"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  active && "text-primary"
                )} />
                
                {isOpen && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 whitespace-nowrap overflow-hidden">
                        {item.description}
                      </p>
                    </div>
                    {active && (
                      <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </>
                )}

                {/* Tooltip for collapsed sidebar */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({item.badge})
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="whitespace-nowrap">現在のディレクトリ:</p>
              <p className="font-mono truncate text-foreground/70 whitespace-nowrap overflow-hidden">
                {state.currentDirectory || '/'}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}