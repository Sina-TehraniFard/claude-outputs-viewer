import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Grid3X3, 
  List,
  FileText
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip'
import { FileCard } from '../components/FileCard'
import { useApp, useAppActions } from '../contexts/AppContext'
import { api } from '../lib/api'
import { convertToHomePath } from '../lib/path-utils'
import { copyToClipboard } from '../lib/clipboard-utils'

export function DirectoryView() {
  const { directoryPath } = useParams<{ directoryPath: string }>()
  const { state } = useApp()
  const { 
    setLoading, 
    setError, 
    setFiles, 
    setCurrentDirectory, 
    setViewMode,
    toggleFavorite 
  } = useAppActions()
  const navigate = useNavigate()

  useEffect(() => {
    if (directoryPath) {
      const decodedPath = decodeURIComponent(directoryPath)
      setCurrentDirectory(decodedPath)
      loadFiles(decodedPath)
    }
  }, [directoryPath])

  const loadFiles = async (path: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getFiles(path)
      setFiles(response.files)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = (file: any) => {
    navigate(`/file/${encodeURIComponent(file.path)}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent, filePath: string) => {
    e.stopPropagation()
    toggleFavorite(filePath)
  }

  const handleCopyPath = async (filePath: string) => {
    try {
      const homePath = convertToHomePath(filePath)
      await copyToClipboard(homePath)
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy path:', error)
      setError('パスのコピーに失敗しました')
    }
  }

  const [copyingPath, setCopyingPath] = useState<string | null>(null)

  const handleCopyContent = async (filePath: string) => {
    try {
      setCopyingPath(filePath)
      const response = await api.getFileContent(filePath)
      await copyToClipboard(response.content)
      // TODO: Show toast notification
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイル内容のコピーに失敗しました')
    } finally {
      setCopyingPath(null)
    }
  }

  const handleDelete = async (filePath: string) => {
    const confirmed = window.confirm('このファイルを削除してもよろしいですか？')
    if (!confirmed) return

    try {
      setLoading(true)
      await api.deleteFile(filePath, true)
      // Reload files to reflect the deletion
      if (directoryPath) {
        const decodedPath = decodeURIComponent(directoryPath)
        loadFiles(decodedPath)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            ディレクトリ一覧に戻る
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{state.currentDirectory}</h1>
            <p className="text-muted-foreground">
              {state.files.length} ファイル
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="transition-all"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>グリッド表示</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="transition-all"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>リスト表示</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {state.files.length === 0 && !state.isLoading ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">ファイルが見つかりません</h3>
          <p className="text-muted-foreground mt-2">
            このディレクトリにはサポートされているファイル(.md, .txt, .log, .json)がありません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.files.map((file) => (
            <FileCard
              key={file.path}
              file={file}
              onClick={() => handleFileClick(file)}
              onToggleFavorite={(e) => handleToggleFavorite(e, file.path)}
              onCopyPath={() => handleCopyPath(file.path)}
              onCopyContent={() => handleCopyContent(file.path)}
              onDelete={() => handleDelete(file.path)}
              isFavorite={state.favorites.includes(file.path)}
              isLoadingContent={copyingPath === file.path}
            />
          ))}
        </div>
      )}
    </div>
  )
}