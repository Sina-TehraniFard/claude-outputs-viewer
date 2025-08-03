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
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useApp, useAppActions } from '../contexts/AppContext'
import { api } from '../lib/api'
import { convertToHomePath } from '../lib/path-utils'
import { copyToClipboard } from '../lib/clipboard-utils'
import { MarkdownViewer } from '../components/MarkdownViewer'
import { MarkdownEditor } from '../components/MarkdownEditor'

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
    <div className="max-w-7xl mx-auto">
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

      {isEditing ? (
        /* Edit Mode - Editor Only */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                エディター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {file.type === 'markdown' ? (
                  <MarkdownEditor
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Markdownファイルの内容を編集...&#10;&#10;# 見出し&#10;&#10;**太字** *斜体*&#10;&#10;- リスト項目&#10;&#10;```javascript&#10;const example = 'コードブロック';&#10;```&#10;&#10;```mermaid&#10;graph TD&#10;    A[開始] --> B[処理]&#10;    B --> C[終了]&#10;```"
                  />
                ) : (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[500px] p-3 border rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    placeholder="ファイルの内容を編集..."
                    spellCheck={false}
                    style={{ height: `${Math.max(500, editContent.split('\n').length * 24 + 100)}px` }}
                  />
                )}
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
            </CardContent>
          </Card>
        </div>
      ) : (
        /* View Mode - Single Column */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                コンテンツ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-none">
                {file.type === 'markdown' ? (
                  <MarkdownViewer content={content} />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md overflow-auto">
                    {content}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}