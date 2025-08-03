import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { DirectoryController } from '../../presentation/controllers/DirectoryController'
import { FileController } from '../../presentation/controllers/FileController'
import { SearchController } from '../../presentation/controllers/SearchController'
import { ErrorHandler } from '../../presentation/middleware/ErrorHandler'
import { SecurityMiddleware } from '../../presentation/middleware/SecurityMiddleware'
import { ILogger } from '../../application/ports/ILogger'

export class ExpressApp {
  private app: express.Application
  private server?: any

  constructor(
    private readonly directoryController: DirectoryController,
    private readonly fileController: FileController,
    private readonly searchController: SearchController,
    private readonly errorHandler: ErrorHandler,
    private readonly securityMiddleware: SecurityMiddleware,
    private readonly logger: ILogger
  ) {
    this.app = express()
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet())
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }))

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          this.logger.info('HTTP Request', { message: message.trim() })
        }
      }
    }))

    // Custom security middleware
    this.app.use(this.securityMiddleware.validatePath.bind(this.securityMiddleware))
    this.app.use(this.securityMiddleware.rateLimiting.bind(this.securityMiddleware))
  }

  private setupRoutes(): void {
    const apiRouter = express.Router()

    // Health check
    apiRouter.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          version: process.env.npm_package_version || '1.0.0'
        }
      })
    })

    // Directory routes
    apiRouter.get('/directories', 
      this.directoryController.getDirectories.bind(this.directoryController)
    )

    // File routes
    apiRouter.get('/files', 
      this.fileController.getFiles.bind(this.fileController)
    )
    
    apiRouter.get('/file/content', 
      this.fileController.getFileContent.bind(this.fileController)
    )
    
    apiRouter.put('/file/content', 
      this.fileController.updateFileContent.bind(this.fileController)
    )
    
    apiRouter.delete('/file', 
      this.fileController.deleteFile.bind(this.fileController)
    )
    
    apiRouter.post('/file/copy-path', 
      this.fileController.copyFilePath.bind(this.fileController)
    )

    // Search routes
    apiRouter.post('/search',
      this.searchController.searchFiles.bind(this.searchController)
    )
    
    apiRouter.get('/search/tags',
      this.searchController.getAllTags.bind(this.searchController)
    )

    this.app.use('/api', apiRouter)

    // 404 handler for all unmatched routes
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
          timestamp: new Date()
        }
      })
    })
  }

  private setupErrorHandling(): void {
    this.app.use(this.errorHandler.handle.bind(this.errorHandler))
  }

  getApp(): express.Application {
    return this.app
  }

  start(port: number = 3001): void {
    this.server = this.app.listen(port, () => {
      this.logger.info(`Server started on port ${port}`)
    })
    
    // Keep the process alive
    this.server.on('error', (error: Error) => {
      this.logger.error('Server error', error)
    })
  }

  stop(): void {
    if (this.server) {
      this.server.close()
    }
  }
}