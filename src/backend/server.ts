import { ExpressApp } from '../infrastructure/web/ExpressApp'
import { DIContainer } from '../infrastructure/web/DIContainer'

let expressApp: ExpressApp | null = null

function main(): void {
  const container = DIContainer.getInstance()
  const logger = container.getLogger()

  try {
    expressApp = new ExpressApp(
      container.getDirectoryController(),
      container.getFileController(),
      container.getSearchController(),
      container.getErrorHandler(),
      container.getSecurityMiddleware(),
      container.getNotificationService(),
      logger
    )

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

    expressApp.start(port)

    logger.info('Claude Outputs Viewer API Server started successfully', {
      port,
      environment: process.env.NODE_ENV || 'development'
    })

  } catch (error) {
    logger.error('Failed to start server', error as Error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  const logger = DIContainer.getInstance().getLogger()
  logger.info('SIGTERM received, shutting down gracefully')
  if (expressApp) {
    expressApp.stop()
  }
  process.exit(0)
})

process.on('SIGINT', () => {
  const logger = DIContainer.getInstance().getLogger()
  logger.info('SIGINT received, shutting down gracefully')
  if (expressApp) {
    expressApp.stop()
  }
  process.exit(0)
})

main()