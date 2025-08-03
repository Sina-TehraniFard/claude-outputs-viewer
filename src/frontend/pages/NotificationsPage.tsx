import { useState, useEffect } from 'react'
import { useApp, useAppActions } from '../contexts/AppContext'
import { NotificationSettings } from '../components/NotificationSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { X, FileText, FileEdit, Trash2 } from 'lucide-react'

export function NotificationsPage() {
  const { state } = useApp()
  const { removeNotification } = useAppActions()
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'file_added':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'file_modified':
        return <FileEdit className="h-4 w-4 text-blue-500" />
      case 'file_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'file_added':
        return '追加'
      case 'file_modified':
        return '更新'
      case 'file_deleted':
        return '削除'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'file_added':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'file_modified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'file_deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">通知設定</h1>
        <p className="text-muted-foreground mt-2">
          ファイル変更の通知設定と履歴を管理
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div>
          {state.notificationService && (
            <NotificationSettings notificationService={state.notificationService} />
          )}
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>最近の通知</CardTitle>
            <CardDescription>
              最近受信したファイル変更通知の履歴
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>通知履歴はありません</p>
                <p className="text-sm">ファイルの変更があると、ここに表示されます</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.notifications.map((notification, index) => {
                  const notificationId = `${notification.data.timestamp}_${notification.type}_${index}`
                  return (
                    <div
                      key={notificationId}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTypeColor(notification.type)}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.data.timestamp).toLocaleString('ja-JP')}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium">{notification.data.fileName}</p>
                        
                        {notification.data.directory && (
                          <p className="text-xs text-muted-foreground">
                            📁 {notification.data.directory}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const originalId = `${notification.data.timestamp}_${notification.type}`
                          removeNotification(originalId)
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting Section */}
      {permission === 'denied' && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              🚫 通知が拒否されています
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              通知を有効にするには、以下の手順で設定を変更してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 text-red-700 dark:text-red-300">💻 ブラウザ設定での解決方法</h4>
              <div className="space-y-3 text-sm">
                <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                  <h5 className="font-medium mb-2">🔒 方法1: アドレスバーから設定</h5>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>ブラウザのアドレスバー左側にある<strong>🔒アイコン</strong>をクリック</li>
                    <li>「通知」または「Notifications」の項目を見つける</li>
                    <li>「拒否」から<strong>「許可」</strong>に変更</li>
                    <li>ページを再読み込み（F5キー）</li>
                  </ol>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                  <h5 className="font-medium mb-2">⚙️ 方法2: ブラウザ設定から</h5>
                  <div className="space-y-2">
                    <div>
                      <strong>Chrome:</strong>
                      <ol className="list-decimal list-inside ml-4 text-muted-foreground">
                        <li>右上の⋮メニュー → 設定</li>
                        <li>プライバシーとセキュリティ → サイトの設定</li>
                        <li>通知 → ブロック中のサイトからlocalhost:3000を削除</li>
                      </ol>
                    </div>
                    
                    <div>
                      <strong>Firefox:</strong>
                      <ol className="list-decimal list-inside ml-4 text-muted-foreground">
                        <li>右上の☰メニュー → 設定</li>
                        <li>プライバシーとセキュリティ → 許可設定 → 通知</li>
                        <li>localhost:3000を見つけて「許可」に変更</li>
                      </ol>
                    </div>
                    
                    <div>
                      <strong>Safari:</strong>
                      <ol className="list-decimal list-inside ml-4 text-muted-foreground">
                        <li>Safari → 環境設定 → Webサイト</li>
                        <li>通知 → localhost:3000を「許可」に変更</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-700 dark:text-red-300">🖥️ OS設定での解決方法</h4>
              <div className="space-y-3 text-sm">
                <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                  <h5 className="font-medium mb-2">🍎 macOS</h5>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>システム設定 → 通知</li>
                    <li>使用中のブラウザ（Chrome/Safari/Firefox）を選択</li>
                    <li>「通知を許可」をオンにする</li>
                    <li>「集中モード」がオフになっているか確認</li>
                  </ol>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                  <h5 className="font-medium mb-2">🪟 Windows</h5>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>設定 → システム → 通知とアクション</li>
                    <li>「アプリやその他の送信者からの通知を受け取る」をオン</li>
                    <li>使用中のブラウザがリストにあることを確認</li>
                    <li>「集中モード」がオフになっているか確認</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>💡 ヒント:</strong> 設定を変更した後は、ブラウザを再起動して変更を反映させてください。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>通知について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">対応するファイル形式</h4>
            <p className="text-sm text-muted-foreground">
              .md, .txt, .log, .json ファイルの変更を監視します
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">通知の種類</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>ファイル追加 - 新しいファイルが作成された時</span>
              </div>
              <div className="flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-blue-500" />
                <span>ファイル更新 - 既存のファイルが変更された時</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>ファイル削除 - ファイルが削除された時</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">よくある問題と解決方法</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• 通知が表示されない → OS設定で集中モード/おやすみモードを確認</div>
              <div>• 音が鳴らない → システム音量と通知音設定を確認</div>
              <div>• 通知が遅れる → ブラウザがバックグラウンドで動作しているか確認</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">プライバシー</h4>
            <p className="text-sm text-muted-foreground">
              通知はブラウザのローカル機能を使用し、外部に情報は送信されません。
              通知の履歴はブラウザセッション中のみ保持されます。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}