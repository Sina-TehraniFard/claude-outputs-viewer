import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Trash2, Search } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { FileCard } from '../components/FileCard'
import { useApp, useAppActions } from '../contexts/AppContext'
import { api } from '../lib/api'
import { convertToHomePath } from '../lib/path-utils'
import { copyToClipboard } from '../lib/clipboard-utils'

export function FavoritesPage() {
  const { state } = useApp()
  const { setLoading, setError, toggleFavorite } = useAppActions()
  const navigate = useNavigate()
  
  const [favoriteFiles, setFavoriteFiles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFiles, setFilteredFiles] = useState<any[]>([])
  const [copyingPath, setCopyingPath] = useState<string | null>(null)

  useEffect(() => {
    loadFavoriteFiles()
  }, [state.favorites])

  useEffect(() => {
    if (searchTerm) {
      const filtered = favoriteFiles.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.preview && file.preview.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredFiles(filtered)
    } else {
      setFilteredFiles(favoriteFiles)
    }
  }, [searchTerm, favoriteFiles])

  const loadFavoriteFiles = async () => {
    if (state.favorites.length === 0) {
      setFavoriteFiles([])
      setFilteredFiles([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Since we don't have a batch API, we'll load files one by one
      // In a real app, you'd want a dedicated favorites API endpoint
      const files = []
      
      for (const favoritePath of state.favorites) {
        try {
          const response = await api.getFileContent(favoritePath)
          files.push(response.file)
        } catch (error) {
          // File might be deleted, ignore this error
          console.warn(`Could not load favorite file: ${favoritePath}`)
        }
      }
      
      setFavoriteFiles(files)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'お気に入りファイルの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = (file: any) => {
    navigate(`/file/${encodeURIComponent(file.path)}`)
  }

  const handleRemoveFavorite = (e: React.MouseEvent, filePath: string) => {
    e.stopPropagation()
    toggleFavorite(filePath)
  }

  const handleCopyPath = async (filePath: string) => {
    try {
      const homePath = convertToHomePath(filePath)
      await copyToClipboard(homePath)
    } catch (error) {
      console.error('Failed to copy path:', error)
      setError('パスのコピーに失敗しました')
    }
  }

  const handleCopyContent = async (filePath: string) => {
    try {
      setCopyingPath(filePath)
      const response = await api.getFileContent(filePath)
      await copyToClipboard(response.content)
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
      // Reload favorites to reflect the deletion
      loadFavoriteFiles()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const clearAllFavorites = () => {
    const confirmed = window.confirm(
      `すべてのお気に入り（${state.favorites.length}件）を削除してもよろしいですか？`
    )
    if (confirmed) {
      state.favorites.forEach(path => toggleFavorite(path))
    }
  }


  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              お気に入りファイル
            </h1>
            <p className="text-muted-foreground mt-2">
              {state.favorites.length}個のファイルがお気に入りに登録されています
            </p>
          </div>
          
          {state.favorites.length > 0 && (
            <Button variant="outline" onClick={clearAllFavorites}>
              <Trash2 className="h-4 w-4 mr-2" />
              すべてクリア
            </Button>
          )}
        </div>
      </div>

      {state.favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">お気に入りファイルがまだありません</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            お気に入りに追加したファイルはここに表示され、簡単にアクセスできます。
          </p>
          <Button onClick={() => navigate('/')}>
            ファイルを参照
          </Button>
        </div>
      ) : (
        <>
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Input
                  placeholder="お気に入りファイルを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {filteredFiles.length === 0 && searchTerm ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">一致する項目が見つかりません</h3>
              <p className="text-muted-foreground text-sm">
                "{searchTerm}"に一致するお気に入りファイルはありません
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.path}
                  file={file}
                  onClick={() => handleFileClick(file)}
                  onToggleFavorite={(e) => handleRemoveFavorite(e, file.path)}
                  onCopyPath={() => handleCopyPath(file.path)}
                  onCopyContent={() => handleCopyContent(file.path)}
                  onDelete={() => handleDelete(file.path)}
                  isFavorite={true}
                  isLoadingContent={copyingPath === file.path}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}