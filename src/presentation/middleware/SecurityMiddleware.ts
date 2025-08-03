import { Request, Response, NextFunction } from 'express'
import { ILogger } from '../../application/ports/ILogger'

export class SecurityMiddleware {
  constructor(private readonly logger: ILogger) {}

  validatePath(req: Request, res: Response, next: NextFunction): void {
    const path = req.params.path || req.query.directory || req.query.path

    if (path && typeof path === 'string') {
      // Prevent directory traversal
      if (path.includes('..')) {
        this.logger.warn('Path traversal attempt detected', {
          path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        })

        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PATH',
            message: 'Path traversal is not allowed',
            timestamp: new Date()
          }
        })
        return
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /\x00/,  // null bytes
        /[<>:"|?*]/,  // Windows forbidden characters
        /^\s*$/  // empty or whitespace only
      ]

      if (suspiciousPatterns.some(pattern => pattern.test(path))) {
        this.logger.warn('Suspicious path pattern detected', {
          path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        })

        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PATH',
            message: 'Invalid path format',
            timestamp: new Date()
          }
        })
        return
      }
    }

    next()
  }

  rateLimiting(_req: Request, _res: Response, next: NextFunction): void {
    // Simple rate limiting (can be enhanced with Redis/memory store)
    // This is a simplified implementation
    // In production, use a proper rate limiting library
    
    next()
  }
}