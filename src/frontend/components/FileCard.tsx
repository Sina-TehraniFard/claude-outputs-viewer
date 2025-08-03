import { FileText, File, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { FileActionsMenu, createFileActions } from './FileActionsMenu'
import { cn } from '../lib/utils'

interface FileCardProps {
  file: {
    path: string
    name: string
    size: number
    lastModified: string
    type: string
    tags: string[]
    preview?: string
  }
  onClick: () => void
  onToggleFavorite?: (e: React.MouseEvent) => void
  onCopyPath?: () => void
  onCopyContent?: () => void
  onDelete?: () => void
  isFavorite?: boolean
  isLoadingContent?: boolean
  viewMode?: 'grid' | 'list'
  className?: string
  // For search results
  score?: number
  matchedTags?: string[]
  contentMatches?: Array<{ line: number; highlighted: string }>
}

export function FileCard({
  file,
  onClick,
  onToggleFavorite,
  onCopyPath,
  onCopyContent,
  onDelete,
  isFavorite = false,
  isLoadingContent = false,
  viewMode = 'grid',
  className,
  score,
  matchedTags,
  contentMatches
}: FileCardProps) {
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'markdown':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const isSearchResult = score !== undefined && matchedTags !== undefined

  return (
    <Card 
      className={cn(
        "file-card cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all duration-200",
        viewMode === 'list' ? 'flex-row' : '',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={viewMode === 'list' ? 'pb-3' : 'pb-2'}>
        <div className="flex items-start justify-between">
          <div className={cn(
            "flex gap-2 flex-1 min-w-0",
            isSearchResult ? "flex-col" : "flex-row items-center"
          )}>
            {!isSearchResult && getFileIcon(file.type)}
            <CardTitle className={cn(
              "truncate",
              isSearchResult ? "text-lg" : "text-base"
            )} title={file.name}>
              {file.name}
            </CardTitle>
            {isSearchResult && (
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>スコア: {Math.round(score)}</span>
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isSearchResult && (
              <Badge variant="secondary" className="mr-2">
                {matchedTags.length}件一致
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-accent/50"
                  onClick={onToggleFavorite || ((e) => e.stopPropagation())}
                >
                  <Heart 
                    className={cn(
                      "h-3 w-3 transition-colors",
                      isFavorite 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground hover:text-red-500'
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}</p>
              </TooltipContent>
            </Tooltip>
            
            <FileActionsMenu
              actions={createFileActions(
                file.path,
                onCopyPath || (() => {}),
                onCopyContent || (() => {}),
                onDelete || (() => {})
              )}
              disabled={isLoadingContent}
              isLoadingContent={isLoadingContent}
            />
          </div>
        </div>
        
        {!isSearchResult && (
          <CardDescription className="text-xs">
            {formatFileSize(file.size)} • {formatDate(file.lastModified)}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {file.preview && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {file.preview}
          </p>
        )}
        
        {isSearchResult ? (
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">一致したタグ:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {matchedTags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {file.tags.length > matchedTags.length && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">その他のタグ:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {file.tags
                    .filter(tag => !matchedTags.includes(tag))
                    .map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
            
            {contentMatches && contentMatches.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-medium text-muted-foreground">コンテンツの一致:</span>
                <div className="mt-1 space-y-1">
                  {contentMatches.slice(0, 3).map((match, index) => (
                    <div key={index} className="text-xs bg-muted p-2 rounded">
                      <span className="text-muted-foreground">{match.line}行目:</span>
                      <div 
                        className="mt-1"
                        dangerouslySetInnerHTML={{ __html: match.highlighted }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {file.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs hover:bg-accent transition-colors cursor-default">
                  #{tag}
                </Badge>
              ))}
              {file.tags.length > 3 && (
                <Badge variant="outline" className="text-xs hover:bg-accent transition-colors cursor-default">
                  +{file.tags.length - 3} 件
                </Badge>
              )}
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}