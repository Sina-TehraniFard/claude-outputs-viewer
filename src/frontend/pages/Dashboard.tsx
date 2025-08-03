import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, Calendar, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useApp, useAppActions } from '../contexts/AppContext'
import { api } from '../lib/api'

export function Dashboard() {
  const { state } = useApp()
  const { setLoading, setError, setDirectories } = useAppActions()
  const navigate = useNavigate()

  useEffect(() => {
    loadDirectories()
  }, [])

  const loadDirectories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getDirectories()
      setDirectories(response.directories)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ディレクトリの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectoryClick = (directory: any) => {
    navigate(`/directory/${encodeURIComponent(directory.path)}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Compare calendar days, not just 24-hour periods
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = nowDay.getTime() - dateDay.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return formatDate(dateString)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Claude出力ディレクトリ</h1>
        <p className="text-muted-foreground mt-2">
          日付別に整理されたClaude会話の出力を参照
        </p>
      </div>

      {state.directories.length === 0 && !state.isLoading ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">ディレクトリが見つかりません</h3>
          <p className="text-muted-foreground mt-2">
            Claude出力ディレクトリに日付形式のフォルダ(YYYY-MM-DD)が含まれていることを確認してください
          </p>
          <Button onClick={loadDirectories} className="mt-4">
            再読み込み
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.directories.map((directory) => (
            <Card 
              key={directory.path}
              className="directory-card cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              onClick={() => handleDirectoryClick(directory)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {directory.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {directory.fileCount}
                  </Badge>
                </div>
                
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(directory.lastModified)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatDate(directory.lastModified)}</span>
                  <span>{directory.fileCount} ファイル</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}