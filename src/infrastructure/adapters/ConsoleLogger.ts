import { ILogger } from '@/application/ports/ILogger.ts'

export class ConsoleLogger implements ILogger {
  info(message: string, meta?: unknown): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta, null, 2) : '')
  }

  warn(message: string, meta?: unknown): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`)
    if (meta instanceof Error) {
      console.warn('Error details:', meta.message)
      console.warn('Stack trace:', meta.stack)
    } else if (meta) {
      console.warn('Meta:', JSON.stringify(meta, null, 2))
    }
  }

  error(message: string, error?: Error, meta?: unknown): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`)
    if (error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }
    if (meta) {
      console.error('Meta:', JSON.stringify(meta, null, 2))
    }
  }

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta, null, 2) : '')
    }
  }
}