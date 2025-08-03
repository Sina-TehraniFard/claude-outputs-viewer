import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Folder, 
  Calendar, 
  FileText, 
  ChevronLeft,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, useAppActions } from '../../contexts/AppContext';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

interface DirectorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  sidebarOpen: boolean;
}

export function DirectorySidebar({ isOpen, onClose, isMobile, sidebarOpen }: DirectorySidebarProps) {
  const { state } = useApp();
  const { setLoading, setError, setDirectories } = useAppActions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract directoryPath from current location
  const getDirectoryPath = () => {
    if (location.pathname.startsWith('/directory/')) {
      return location.pathname.slice('/directory/'.length);
    }
    if (location.pathname.startsWith('/file/')) {
      const filePath = location.pathname.slice('/file/'.length);
      const decodedFilePath = decodeURIComponent(filePath);
      // Extract directory from file path (remove filename)
      const lastSlashIndex = decodedFilePath.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        return decodedFilePath.substring(0, lastSlashIndex);
      }
    }
    return null;
  };
  
  const directoryPath = getDirectoryPath();

  useEffect(() => {
    if (isOpen) {
      loadDirectories();
    }
  }, [isOpen]);

  const loadDirectories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDirectories();
      setDirectories(response.directories);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ディレクトリの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectoryClick = (directory: any) => {
    navigate(`/directory/${encodeURIComponent(directory.path)}`);
    if (isMobile) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Compare calendar days, not just 24-hour periods
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = nowDay.getTime() - dateDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    return formatDate(dateString);
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-35"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Directory Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            className={cn(
              "fixed top-0 z-30 h-full bg-background border-r border-border shadow-lg w-64",
              isMobile ? "left-0" : sidebarOpen ? "left-64" : "left-16"
            )}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">ディレクトリ</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
                aria-label="ディレクトリサイドバーを閉じる"
              >
                {isMobile ? (
                  <X className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Directory List */}
            <div className="overflow-y-auto h-[calc(100%-64px)] p-2">
              {state.directories.length === 0 && !state.isLoading ? (
                <div className="text-center py-8">
                  <Folder className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    ディレクトリが見つかりません
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {state.directories.map((directory) => {
                    const currentPath = directoryPath ? decodeURIComponent(directoryPath) : '';
                    const isActive = currentPath === directory.path;
                    const isParentOfActive = currentPath.startsWith(directory.path + '/');
                    
                    return (
                      <motion.div
                        key={directory.path}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => handleDirectoryClick(directory)}
                          className={cn(
                            "w-full p-3 rounded-lg transition-all duration-200 text-left group relative overflow-hidden",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : isParentOfActive
                              ? "bg-primary/5 text-primary/80"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {/* Active indicator */}
                          <motion.div
                            className={cn(
                              "absolute left-0 top-0 h-full bg-gradient-to-b",
                              isActive 
                                ? "w-0.5 from-blue-400 to-blue-600" 
                                : "w-0.5 from-blue-300 to-blue-500"
                            )}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: isActive || isParentOfActive ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium truncate">{directory.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <FileText className="h-3 w-3 mr-1" />
                              {directory.fileCount}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(directory.lastModified)}</span>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}