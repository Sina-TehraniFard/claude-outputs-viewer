import { io, Socket } from 'socket.io-client'

export interface NotificationPayload {
  type: 'file_added' | 'file_modified' | 'file_deleted'
  title: string
  message: string
  data: {
    filePath: string
    fileName: string
    directory: string
    timestamp: string
  }
}

export class NotificationService {
  private socket: Socket | null = null
  private isConnected = false
  private notificationPermission: NotificationPermission = 'default'

  constructor(private readonly serverUrl: string = 'http://localhost:3001') {}

  async initialize(): Promise<void> {
    // Request notification permission
    await this.requestNotificationPermission()
    
    // Connect to WebSocket
    this.connect()
  }

  private async requestNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
      return
    }
    
    if (Notification.permission === 'default') {
      this.notificationPermission = await Notification.requestPermission()
    } else {
      this.notificationPermission = Notification.permission
    }
  }

  private connect(): void {
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      this.subscribeToNotifications()
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
    })

    this.socket.on('file_notification', (notification: NotificationPayload) => {
      this.handleNotification(notification)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  private subscribeToNotifications(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_notifications')
    }
  }

  private handleNotification(notification: NotificationPayload): void {
    // Show browser notification
    this.showBrowserNotification(notification)

    // Trigger custom event for UI updates
    const customEvent = new CustomEvent('file_change_notification', {
      detail: notification
    })
    window.dispatchEvent(customEvent)
  }

  private showBrowserNotification(notification: NotificationPayload): void {
    if (this.notificationPermission !== 'granted') {
      return
    }

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/icon/pen.svg',
      badge: '/icon/pen.svg',
      tag: `file_${notification.type}`,
      requireInteraction: false,
      silent: false,
      data: notification.data
    }

    const browserNotification = new Notification(notification.title, options)

    // Auto close after 5 seconds
    setTimeout(() => {
      browserNotification.close()
    }, 5000)

    // Handle click to focus window
    browserNotification.onclick = () => {
      window.focus()
      browserNotification.close()
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.emit('unsubscribe_notifications')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  isNotificationEnabled(): boolean {
    return this.notificationPermission === 'granted'
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}