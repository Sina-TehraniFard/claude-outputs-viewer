import { Request, Response } from 'express'
import { SearchFilesUseCase } from '../../application/use-cases/SearchFilesUseCase'
import { GetAllTagsUseCase } from '../../application/use-cases/GetAllTagsUseCase'
import { ILogger } from '../../application/ports/ILogger'

export class SearchController {
  constructor(
    private readonly searchFilesUseCase: SearchFilesUseCase,
    private readonly getAllTagsUseCase: GetAllTagsUseCase,
    private readonly logger: ILogger
  ) {}

  async searchFiles(req: Request, res: Response): Promise<void> {
    try {
      const { tags, operator, includeContent, dateRange } = req.body
      
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tags array is required and must not be empty',
            timestamp: new Date()
          }
        })
        return
      }
      
      if (operator && !['AND', 'OR'].includes(operator)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Operator must be either AND or OR',
            timestamp: new Date()
          }
        })
        return
      }
      
      this.logger.info('SearchController.searchFiles called', {
        tags,
        operator: operator || 'OR',
        includeContent: includeContent || false
      })
      
      const searchQuery = {
        tags,
        operator: operator || 'OR',
        includeContent: includeContent || false,
        dateRange: dateRange ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : undefined
      }
      
      const result = await this.searchFilesUseCase.execute(searchQuery)
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      this.logger.error('SearchController.searchFiles failed', error as Error)
      
      const errorMessage = (error as Error).message
      const isValidationError = errorMessage.includes('required') || errorMessage.includes('must')
      
      res.status(isValidationError ? 400 : 500).json({
        success: false,
        error: {
          code: isValidationError ? 'VALIDATION_ERROR' : 'SERVER_ERROR',
          message: isValidationError ? errorMessage : 'Failed to perform search',
          timestamp: new Date()
        }
      })
    }
  }

  async getAllTags(_req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('SearchController.getAllTags called')
      
      const result = await this.getAllTagsUseCase.execute()
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      this.logger.error('SearchController.getAllTags failed', error as Error)
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to retrieve tags',
          timestamp: new Date()
        }
      })
    }
  }
}