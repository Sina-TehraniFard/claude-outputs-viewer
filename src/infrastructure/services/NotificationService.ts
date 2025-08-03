import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { FileChangeEvent, IFileWatcherService } from '../../domain/services/FileWatcherService'
import { ILogger } from '../../application/ports/ILogger'

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
  private io: SocketIOServer | null = null

  constructor(
    private readonly fileWatcher: IFileWatcherService,
    private readonly logger: ILogger
  ) {}

  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"]
      }
    })

    this.setupSocketHandlers()
    this.setupFileWatcher()
    
    this.logger.info('Notification service initialized with WebSocket support')
  }

  private setupSocketHandlers(): void {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`)

      socket.on('subscribe_notifications', () => {
        this.logger.info(`Client ${socket.id} subscribed to notifications`)
        socket.join('file_notifications')
      })

      socket.on('unsubscribe_notifications', () => {
        this.logger.info(`Client ${socket.id} unsubscribed from notifications`)
        socket.leave('file_notifications')
      })

      socket.on('disconnect', () => {
        this.logger.info(`Client disconnected: ${socket.id}`)
      })
    })
  }

  private setupFileWatcher(): void {
    this.fileWatcher.onFileChange((event: FileChangeEvent) => {
      const notification = this.createNotificationFromEvent(event)
      this.broadcastNotification(notification)
    })

    this.fileWatcher.startWatching()
  }

  private createNotificationFromEvent(event: FileChangeEvent): NotificationPayload {
    const typeMap = {
      'added': 'file_added' as const,
      'modified': 'file_modified' as const,
      'deleted': 'file_deleted' as const
    }

    const actionMap = {
      'added': '追加されました',
      'modified': '更新されました', 
      'deleted': '削除されました'
    }

    return {
      type: typeMap[event.type],
      title: 'ファイル変更通知',
      message: `${event.fileName} が${actionMap[event.type]}`,
      data: {
        filePath: event.filePath,
        fileName: event.fileName,
        directory: event.directory,
        timestamp: event.timestamp.toISOString()
      }
    }
  }

  private broadcastNotification(notification: NotificationPayload): void {
    if (!this.io) return

    this.logger.info(`Broadcasting notification: ${notification.message}`)
    this.io.to('file_notifications').emit('file_notification', notification)
  }

  shutdown(): void {
    this.fileWatcher.stopWatching()
    if (this.io) {
      this.io.close()
      this.logger.info('Notification service shutdown')
    }
  }
}