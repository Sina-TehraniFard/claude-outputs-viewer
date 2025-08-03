import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Tag, Filter, X, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { FileCard } from '../components/FileCard'
import { useApp, useAppActions } from '../contexts/AppContext'
import { api } from '../lib/api'
import { SearchQuery } from '../types/api'
import { convertToHomePath } from '../lib/path-utils'
import { copyToClipboard } from '../lib/clipboard-utils'

export function SearchPage() {
  const { state } = useApp()
  const navigate = useNavigate()
  const { 
    setLoading, 
    setError, 
    setSearchResults, 
    setAvailableTags,
    setSearchQuery,
    toggleFavorite
  } = useAppActions()
  
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [operator, setOperator] = useState<'AND' | 'OR'>('OR')
  const [includeContent, setIncludeContent] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [copyingPath, setCopyingPath] = useState<string | null>(null)

  useEffect(() => {
    loadAvailableTags()
  }, [])

  useEffect(() => {
    if (tagInput) {
      const filtered = state.availableTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag)
      )
      setFilteredTags(filtered.slice(0, 10))
    } else {
      setFilteredTags([])
    }
  }, [tagInput, state.availableTags, selectedTags])

  const loadAvailableTags = async () => {
    try {
      const response = await api.getAllTags()
      setAvailableTags(response.tags)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'タグの読み込みに失敗しました')
    }
  }

  const handleSearch = async () => {
    if (selectedTags.length === 0) {
      setError('検索するために少なくとも1つのタグを選択してください')
      return
    }

    const query: SearchQuery = {
      tags: selectedTags,
      operator,
      includeContent
    }

    try {
      setLoading(true)
      setError(null)
      setSearchQuery(query)
      const response = await api.searchFiles(query)
      setSearchResults(response.results)
    } catch (error) {
      setError(error instanceof Error ? error.message : '検索に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const clearSearch = () => {
    setSelectedTags([])
    setOperator('OR')
    setIncludeContent(false)
    setSearchResults([])
    setSearchQuery({
      tags: [],
      operator: 'OR',
      includeContent: false
    })
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
      // Re-run search to reflect the deletion
      await handleSearch()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ファイルの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ファイル検索</h1>
        <p className="text-muted-foreground mt-2">
          タグやコンテンツでClaude出力を検索
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            検索条件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tag Selection */}
          <div>
            <label className="text-sm font-medium">タグ</label>
            <div className="mt-2 space-y-2">
              <div className="relative">
                <Input
                  placeholder="タグを検索するには入力してください..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="pr-10"
                />
                <Tag className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              
              {filteredTags.length > 0 && (
                <div className="border rounded-md p-2 bg-background">
                  <div className="flex flex-wrap gap-1">
                    {filteredTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="h-7 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        #{tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="default" className="gap-1 hover:bg-primary/80 transition-colors cursor-default">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">検索演算子</label>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={operator === 'OR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOperator('OR')}
                >
                  OR (いずれかのタグ)
                </Button>
                <Button
                  variant={operator === 'AND' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOperator('AND')}
                >
                  AND (すべてのタグ)
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">コンテンツ検索</label>
              <div className="mt-2">
                <Button
                  variant={includeContent ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIncludeContent(!includeContent)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {includeContent ? 'コンテンツを含む' : 'タグのみ'}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch}
              disabled={selectedTags.length === 0}
            >
              <Search className="h-4 w-4 mr-2" />
              ファイルを検索
            </Button>
            
            {(selectedTags.length > 0 || state.searchResults.length > 0) && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4 mr-2" />
                クリア
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {state.searchResults.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              検索結果 ({state.searchResults.length}件)
            </h2>
            <p className="text-muted-foreground text-sm">
              条件に一致する{state.searchResults.length}個のファイルが見つかりました
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.searchResults.map((result) => (
              <FileCard
                key={result.file.path}
                file={result.file}
                onClick={() => handleFileClick(result.file)}
                onToggleFavorite={(e) => handleToggleFavorite(e, result.file.path)}
                onCopyPath={() => handleCopyPath(result.file.path)}
                onCopyContent={() => handleCopyContent(result.file.path)}
                onDelete={() => handleDelete(result.file.path)}
                isFavorite={state.favorites.includes(result.file.path)}
                isLoadingContent={copyingPath === result.file.path}
                score={result.score}
                matchedTags={result.matchedTags}
                contentMatches={result.contentMatches}
              />
            ))}
          </div>
        </div>
      )}

      {state.searchResults.length === 0 && selectedTags.length > 0 && !state.isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">ファイルが見つかりません</h3>
          <p className="text-muted-foreground mt-2">
            検索条件に一致するファイルがありません。タグを調整するか、OR演算子を使用してください。
          </p>
        </div>
      )}
    </div>
  )
}