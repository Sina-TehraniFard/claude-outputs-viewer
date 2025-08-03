import { watch } from 'fs'
import { ILogger } from '../../application/ports/ILogger'

export interface FileChangeEvent {
  type: 'added' | 'modified' | 'deleted'
  filePath: string
  fileName: string
  timestamp: Date
  directory: string
}

export interface IFileWatcherService {
  startWatching(): void
  stopWatching(): void
  onFileChange(callback: (event: FileChangeEvent) => void): void
}

export class FileWatcherService implements IFileWatcherService {
  private watcher: any = null
  private callbacks: Array<(event: FileChangeEvent) => void> = []
  private watchedFiles = new Set<string>()
  private recentEvents = new Map<string, number>()

  constructor(
    private readonly basePath: string,
    private readonly logger: ILogger
  ) {}

  startWatching(): void {
    if (this.watcher) {
      this.logger.warn('File watcher is already running')
      return
    }

    try {
      this.logger.info(`Starting file watcher for: ${this.basePath}`)
      
      this.watcher = watch(this.basePath, { recursive: true }, (eventType, filename) => {
        if (!filename) return
        
        const filePath = `${this.basePath}/${filename}`
        const isSupported = this.isSupportedFile(filename)
        
        if (!isSupported) return

        // Debounce duplicate events (within 100ms)
        const eventKey = `${eventType}_${filePath}`
        const now = Date.now()
        const lastEventTime = this.recentEvents.get(eventKey)
        
        if (lastEventTime && (now - lastEventTime) < 100) {
          return // Skip duplicate event
        }
        
        this.recentEvents.set(eventKey, now)
        
        // Clean up old events (older than 1 second)
        setTimeout(() => {
          this.recentEvents.delete(eventKey)
        }, 1000)

        this.logger.debug(`File event: ${eventType} - ${filename}`)

        // Determine the change type
        let changeType: 'added' | 'modified' | 'deleted'
        
        if (eventType === 'rename') {
          // Check if file exists to determine if it's added or deleted
          try {
            require('fs').accessSync(filePath)
            changeType = this.watchedFiles.has(filePath) ? 'modified' : 'added'
            this.watchedFiles.add(filePath)
          } catch {
            changeType = 'deleted'
            this.watchedFiles.delete(filePath)
          }
        } else {
          // 'change' event
          changeType = this.watchedFiles.has(filePath) ? 'modified' : 'added'
          this.watchedFiles.add(filePath)
        }

        const event: FileChangeEvent = {
          type: changeType,
          filePath,
          fileName: filename,
          timestamp: new Date(),
          directory: this.getDirectoryFromPath(filename)
        }

        this.notifyCallbacks(event)
      })

      this.logger.info('File watcher started successfully')
    } catch (error) {
      this.logger.error('Failed to start file watcher', error as Error)
      throw error
    }
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
      this.watchedFiles.clear()
      this.recentEvents.clear()
      this.logger.info('File watcher stopped')
    }
  }

  onFileChange(callback: (event: FileChangeEvent) => void): void {
    this.callbacks.push(callback)
  }

  private notifyCallbacks(event: FileChangeEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        this.logger.error('Error in file change callback', error as Error)
      }
    })
  }

  private isSupportedFile(filename: string): boolean {
    const supportedExtensions = ['.md', '.txt', '.log', '.json']
    return supportedExtensions.some(ext => filename.endsWith(ext))
  }

  private getDirectoryFromPath(filename: string): string {
    const parts = filename.split('/')
    return parts.length > 1 ? parts[0] : ''
  }
}