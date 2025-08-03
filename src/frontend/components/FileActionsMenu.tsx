import { Copy, Trash2, FileText, MoreVertical, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export interface FileAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'destructive'
  separator?: boolean
  isLoading?: boolean
}

interface FileActionsMenuProps {
  actions: FileAction[]
  disabled?: boolean
  className?: string
  isLoadingContent?: boolean
}

export function FileActionsMenu({ actions, disabled = false, className, isLoadingContent = false }: FileActionsMenuProps) {
  const handleAction = (action: FileAction, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    action.onClick()
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 hover:bg-accent/50 ${className}`}
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>その他のオプション</p>
        </TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action, index) => (
          <div key={action.id}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={(event) => handleAction(action, event)}
              className={action.variant === 'destructive' ? 'text-destructive focus:text-destructive hover:text-destructive data-[highlighted]:text-destructive' : undefined}
              disabled={action.id === 'copy-content' && isLoadingContent}
            >
              {action.id === 'copy-content' && isLoadingContent ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <action.icon 
                  className={`mr-2 h-4 w-4 ${
                    action.variant === 'destructive' ? 'text-destructive !text-red-500' : ''
                  }`} 
                />
              )}
              <span className={action.variant === 'destructive' ? 'text-destructive !text-red-500' : ''}>
                {action.label}
              </span>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Predefined common actions
export const createFileActions = (
  _filePath: string,
  onCopyPath: () => void,
  onCopyContent: () => void,
  onDelete: () => void
): FileAction[] => [
  {
    id: 'copy-path',
    label: 'パスをコピー',
    icon: Copy,
    onClick: onCopyPath,
  },
  {
    id: 'copy-content',
    label: '内容をコピー',
    icon: FileText,
    onClick: onCopyContent,
  },
  {
    id: 'delete',
    label: '削除',
    icon: Trash2,
    onClick: onDelete,
    variant: 'destructive',
    separator: true,
  },
]