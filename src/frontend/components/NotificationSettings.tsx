import { useState, useEffect } from 'react'
import { Bell, BellOff, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { NotificationService } from '../services/NotificationService'

interface NotificationSettingsProps {
  notificationService: NotificationService
}

export function NotificationSettings({ notificationService }: NotificationSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check initial state
    updateStatus()

    // Update status periodically
    const interval = setInterval(updateStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = () => {
    const enabled = notificationService.isNotificationEnabled()
    const connected = notificationService.getConnectionStatus()
    const perm = Notification.permission
    
    setIsEnabled(enabled)
    setIsConnected(connected)
    setPermission(perm)
  }

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません')
      return
    }

    if (permission === 'default') {
      const newPermission = await Notification.requestPermission()
      setPermission(newPermission)
    } else if (permission === 'denied') {
      alert('通知が拒否されています。ブラウザの設定から通知を有効にしてください。')
    }
    
    updateStatus()
  }

  const getStatusColor = () => {
    if (!isEnabled) return 'text-red-500'
    if (!isConnected) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!isEnabled) return <BellOff className="h-4 w-4" />
    if (!isConnected) return <WifiOff className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (!isEnabled) return '通知無効'
    if (!isConnected) return '接続中...'
    return '通知有効'
  }

  const getConnectionIcon = () => {
    return isConnected ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          ファイル変更通知
        </CardTitle>
        <CardDescription>
          ディレクトリにファイルが追加・変更された時にデスクトップ通知を受け取ります
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <span className={getStatusColor()}>{getStatusIcon()}</span>
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="text-xs text-muted-foreground">
              {isConnected ? '接続済み' : '未接続'}
            </span>
          </div>
        </div>

        {/* Permission Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">通知権限</h4>
          <div className="text-xs text-muted-foreground">
            {permission === 'granted' && '✅ 許可済み'}
            {permission === 'denied' && '❌ 拒否済み'}
            {permission === 'default' && '⏳ 未設定'}
          </div>
        </div>

        {/* Enable Button */}
        {!isEnabled && (
          <Button onClick={handleEnableNotifications} className="w-full">
            通知を有効にする
          </Button>
        )}

        {/* Test Notification */}
        {isEnabled && (
          <Button
            variant="outline"
            onClick={() => {
              console.clear() // コンソールをクリア
              console.log('🧪 =================================')
              console.log('🧪 テスト通知を開始します')
              console.log('🧪 =================================')
              
              // ステップ1: ブラウザサポート確認
              console.log('📋 ステップ1: ブラウザがデスクトップ通知をサポートしているか確認中...')
              if (!('Notification' in window)) {
                console.error('❌ このブラウザはデスクトップ通知をサポートしていません')
                console.log('💡 解決方法: Chrome、Firefox、Safari、Edgeなどの最新ブラウザを使用してください')
                alert('❌ このブラウザは通知をサポートしていません')
                return
              }
              console.log('✅ ブラウザは通知をサポートしています')
              
              // ステップ2: 権限確認
              console.log('📋 ステップ2: 通知権限を確認中...')
              console.log('🔍 現在の権限状態:', Notification.permission)
              
              if (Notification.permission === 'denied') {
                console.error('❌ 通知権限が拒否されています')
                console.log('💡 解決方法1: ブラウザのアドレスバー左の🔒をクリック → 通知を「許可」に変更')
                console.log('💡 解決方法2: ブラウザ設定 → プライバシーとセキュリティ → サイトの設定 → 通知')
                alert('❌ 通知権限が拒否されています。ブラウザの設定から通知を許可してください。')
                return
              }
              
              if (Notification.permission === 'default') {
                console.error('❌ 通知権限がまだ設定されていません')
                console.log('💡 解決方法: 「通知を有効にする」ボタンをクリックして権限を許可してください')
                alert('❌ 先に「通知を有効にする」ボタンをクリックして権限を許可してください')
                return
              }
              
              console.log('✅ 通知権限が許可されています')
              
              // ステップ3: OS設定確認のガイド
              console.log('📋 ステップ3: OS設定の確認ガイド')
              const userAgent = navigator.userAgent
              if (userAgent.includes('Mac')) {
                console.log('🍎 macOSユーザーへ:')
                console.log('   - システム設定 → 通知 → ブラウザ名 → 通知を「許可」に')
                console.log('   - 集中モード（Do Not Disturb）がオフになっているか確認')
                console.log('   - 通知センター（画面右上から下にスワイプ）で確認可能')
              } else if (userAgent.includes('Win')) {
                console.log('🪟 Windowsユーザーへ:')
                console.log('   - 設定 → システム → 通知とアクション → 通知を「オン」に')
                console.log('   - 集中モードがオフになっているか確認')
              } else {
                console.log('🐧 Linuxユーザーへ:')
                console.log('   - デスクトップ環境の通知設定を確認してください')
              }
              
              // ステップ4: 通知作成
              console.log('📋 ステップ4: テスト通知を作成中...')
              try {
                const notification = new Notification('🔔 Claude Outputs Viewer テスト', {
                  body: '通知システムが正常に動作しています！\nこの通知が見えていれば成功です 🎉',
                  icon: '/icon/pen.svg',
                  requireInteraction: true,
                  silent: false,
                  tag: 'test-notification-' + Date.now()
                })
                
                console.log('✅ 通知オブジェクトが正常に作成されました')
                
                // 成功時のイベント
                notification.onshow = () => {
                  console.log('🎉 ========================================')
                  console.log('🎉 成功！デスクトップ通知が表示されました！')
                  console.log('🎉 ========================================')
                  console.log('📍 通知の場所を確認:')
                  console.log('   - 画面の右上角')
                  console.log('   - 通知センター')
                  console.log('   - タスクバーの通知領域')
                  console.log('🔔 音が鳴った場合は音声通知も正常です')
                  
                  setTimeout(() => {
                    alert('🎉 成功！デスクトップ通知が表示されました！\n\n📍 通知を確認してください:\n• 画面右上\n• 通知センター\n• タスクバー')
                  }, 500)
                }
                
                // クリック時のイベント
                notification.onclick = () => {
                  console.log('👆 通知がクリックされました - 正常に動作しています！')
                  window.focus()
                  notification.close()
                }
                
                // エラー時のイベント
                notification.onerror = (error) => {
                  console.error('💥 ========================================')
                  console.error('💥 通知の表示中にエラーが発生しました')
                  console.error('💥 ========================================')
                  console.error('🔍 エラー詳細:', error)
                  console.log('💡 考えられる原因:')
                  console.log('   1. OS設定で通知が無効になっている')
                  console.log('   2. ブラウザの通知がブロックされている')
                  console.log('   3. 集中モード/おやすみモードが有効')
                  console.log('   4. 通知音量が0になっている')
                  alert('❌ 通知エラーが発生しました。コンソールで詳細を確認してください。')
                }
                
                // 閉じられた時のイベント
                notification.onclose = () => {
                  console.log('🚪 通知が閉じられました')
                }
                
                // 10秒後に自動クローズ
                setTimeout(() => {
                  console.log('⏰ 10秒経過 - 通知を自動的に閉じます')
                  notification.close()
                }, 10000)
                
                // 3秒後に状況確認
                setTimeout(() => {
                  console.log('❓ ========================================')
                  console.log('❓ 3秒経過 - 通知状況の確認')
                  console.log('❓ ========================================')
                  console.log('🤔 もし通知が見えない場合の確認事項:')
                  console.log('   1. 画面の四隅をすべて確認')
                  console.log('   2. 通知センターを開く')
                  console.log('   3. OS設定で通知がオンになっているか')
                  console.log('   4. ブラウザを再起動してみる')
                  console.log('   5. 他のサイトの通知が動作するか確認')
                }, 3000)
                
              } catch (error) {
                console.error('💥 ========================================')
                console.error('💥 通知作成中に予期しないエラーが発生')
                console.error('💥 ========================================')
                console.error('🔍 エラー詳細:', error)
                console.error('🔍 エラータイプ:', error.constructor.name)
                console.error('🔍 エラーメッセージ:', error.message)
                console.log('💡 考えられる原因:')
                console.log('   1. ブラウザのセキュリティ設定')
                console.log('   2. JavaScriptの実行制限')
                console.log('   3. 拡張機能による干渉')
                alert('❌ 通知作成エラー: ' + error.message)
              }
            }}
            className="w-full"
          >
            テスト通知を送信
          </Button>
        )}
      </CardContent>
    </Card>
  )
}