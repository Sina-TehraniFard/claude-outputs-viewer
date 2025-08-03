import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Heart, 
  Copy, 
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useApp, useAppActions } from '../contexts/AppContext'
import { api } from '../lib/api'
import { convertToHomePath } from '../lib/path-utils'
import { copyToClipboard } from '../lib/clipboard-utils'

export function FileView() {
  const { filePath } = useParams<{ filePath: string }>()
  const { state } = useApp()
  const { setLoading, setError, toggleFavorite } = useAppActions()
  const navigate = useNavigate()
  
  const [file, setFile] = useState<any>(null)
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (filePath) {
      const decodedPath = decodeURIComponent(filePath)
      loadFileContent(decodedPath)
    }
  }, [filePath])

  const loadFileContent = async (path: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getFileContent(path)
      setFile(response.file)
      setContent(response.content)
      setEditContent(response.content)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!file) return
    
    try {
      setLoading(true)
      await api.updateFileContent(file.path, editContent)
      setContent(editContent)
      setIsEditing(false)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPath = async () => {
    if (!file) return
    
    try {
      const homePath = convertToHomePath(file.path)
      await copyToClipboard(homePath)
    } catch (error) {
      console.error('Failed to copy path:', error)
      setError('パスのコピーに失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!file) return
    
    const confirmed = window.confirm(`"${file.name}"を削除してもよろしいですか？`)
    if (!confirmed) return
    
    try {
      setLoading(true)
      await api.deleteFile(file.path, true)
      navigate(-1) // Go back to previous page
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium">ファイルを読み込み中...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">{file.name}</h1>
              <p className="text-muted-foreground text-sm">
                {formatFileSize(file.size)} • 最終更新 {formatDate(file.lastModified)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(file.path)}
            >
              <Heart 
                className={`h-4 w-4 mr-2 ${
                  state.favorites.includes(file.path) 
                    ? 'fill-red-500 text-red-500' 
                    : ''
                }`} 
              />
              {state.favorites.includes(file.path) ? 'お気に入り解除' : 'お気に入りに追加'}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleCopyPath}>
              <Copy className="h-4 w-4 mr-2" />
              パスをコピー
            </Button>
            
            {file.type === 'markdown' || file.type === 'text' ? (
              <Button
                variant={isEditing ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </>
                )}
              </Button>
            ) : null}
            
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </div>

        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {file.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor/Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Edit className="h-5 w-5" />
                  エディター
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5" />
                  コンテンツ
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-96 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="ここにコンテンツを入力してください..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={editContent === content}>
                    <Save className="h-4 w-4 mr-2" />
                    変更を保存
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditContent(content)
                      setIsEditing(false)
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {file.type === 'markdown' ? (
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ 
                      __html: content.replace(/\n/g, '<br>') 
                    }} 
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md overflow-auto">
                    {content}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview (for markdown) */}
        {file.type === 'markdown' && isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                プレビュー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none markdown-content"
                dangerouslySetInnerHTML={{ 
                  __html: editContent.replace(/\n/g, '<br>') 
                }} 
              />
            </CardContent>
          </Card>
        )}

        {/* File Info */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>ファイル情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">パス</label>
                <p className="font-mono text-sm">{file.path}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">サイズ</label>
                <p>{formatFileSize(file.size)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">タイプ</label>
                <p className="capitalize">{file.type}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">最終更新日時</label>
                <p>{formatDate(file.lastModified)}</p>
              </div>
              
              {file.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">タグ</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {file.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  ファイルをダウンロード
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}