import { Request, Response, NextFunction } from 'express'
import { ILogger } from '../../application/ports/ILogger'

export class ErrorHandler {
  constructor(private readonly logger: ILogger) {}

  handle(error: Error, req: Request, res: Response, _next: NextFunction): void {
    this.logger.error('Unhandled error in Express middleware', error, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    // Don't send stack trace in production
    const isDevelopment = process.env.NODE_ENV === 'development'

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date(),
        ...(isDevelopment && { stack: error.stack })
      }
    })
  }
}