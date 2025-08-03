import { Request, Response } from 'express'
import { GetDirectoriesUseCase } from '@/application/use-cases/GetDirectoriesUseCase.ts'
import { ILogger } from '@/application/ports/ILogger.ts'

export class DirectoryController {
  constructor(
    private readonly getDirectoriesUseCase: GetDirectoriesUseCase,
    private readonly logger: ILogger
  ) {}

  async getDirectories(_req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('DirectoryController.getDirectories called')
      
      const directories = await this.getDirectoriesUseCase.execute()
      
      const response = {
        success: true,
        data: {
          directories: directories.map(dir => dir.toDTO())
        }
      }
      
      res.status(200).json(response)
    } catch (error) {
      this.logger.error('DirectoryController.getDirectories failed', error as Error)
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to retrieve directories',
          timestamp: new Date()
        }
      })
    }
  }
}