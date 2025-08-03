import { Request, Response } from 'express'
import { GetFilesUseCase } from '../../application/use-cases/GetFilesUseCase'
import { GetFileContentUseCase } from '../../application/use-cases/GetFileContentUseCase'
import { UpdateFileContentUseCase } from '../../application/use-cases/UpdateFileContentUseCase'
import { DeleteFileUseCase } from '../../application/use-cases/DeleteFileUseCase'
import { CopyFilePathUseCase } from '../../application/use-cases/CopyFilePathUseCase'
import { ILogger } from '../../application/ports/ILogger'

export class FileController {
  constructor(
    private readonly getFilesUseCase: GetFilesUseCase,
    private readonly getFileContentUseCase: GetFileContentUseCase,
    private readonly updateFileContentUseCase: UpdateFileContentUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly copyFilePathUseCase: CopyFilePathUseCase,
    private readonly logger: ILogger
  ) {}

  async getFiles(req: Request, res: Response): Promise<void> {
    try {
      const directoryPath = req.query.directory as string
      
      if (!directoryPath) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Directory parameter is required',
            timestamp: new Date()
          }
        })
        return
      }
      
      this.logger.info('FileController.getFiles called', { directoryPath })
      
      const result = await this.getFilesUseCase.execute(directoryPath)
      
      const response = {
        success: true,
        data: {
          files: result.files.map(file => file.toDTO()),
          directory: result.directory.toDTO()
        }
      }
      
      res.status(200).json(response)
    } catch (error) {
      this.logger.error('FileController.getFiles failed', error as Error)
      
      const errorMessage = (error as Error).message
      const isNotFound = errorMessage.includes('not found')
      
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        error: {
          code: isNotFound ? 'DIRECTORY_NOT_FOUND' : 'SERVER_ERROR',
          message: isNotFound ? errorMessage : 'Failed to retrieve files',
          timestamp: new Date()
        }
      })
    }
  }

  async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.query.path as string
      
      if (!filePath) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File path parameter is required',
            timestamp: new Date()
          }
        })
        return
      }
      
      this.logger.info('FileController.getFileContent called', { filePath })
      
      const result = await this.getFileContentUseCase.execute(filePath)
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      this.logger.error('FileController.getFileContent failed', error as Error)
      
      const errorMessage = (error as Error).message
      const isNotFound = errorMessage.includes('not found')
      
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        error: {
          code: isNotFound ? 'FILE_NOT_FOUND' : 'SERVER_ERROR',
          message: isNotFound ? errorMessage : 'Failed to retrieve file content',
          timestamp: new Date()
        }
      })
    }
  }

  async updateFileContent(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.query.path as string
      const { content } = req.body
      
      if (!filePath) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File path parameter is required',
            timestamp: new Date()
          }
        })
        return
      }
      
      if (typeof content !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content must be a string',
            timestamp: new Date()
          }
        })
        return
      }
      
      this.logger.info('FileController.updateFileContent called', { filePath })
      
      const result = await this.updateFileContentUseCase.execute(filePath, content)
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      this.logger.error('FileController.updateFileContent failed', error as Error)
      
      const errorMessage = (error as Error).message
      const isNotFound = errorMessage.includes('not found')
      
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        error: {
          code: isNotFound ? 'FILE_NOT_FOUND' : 'SERVER_ERROR',
          message: isNotFound ? errorMessage : 'Failed to update file content',
          timestamp: new Date()
        }
      })
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.query.path as string
      const { confirm } = req.body
      
      if (!filePath) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File path parameter is required',
            timestamp: new Date()
          }
        })
        return
      }
      
      this.logger.info('FileController.deleteFile called', { filePath, confirm })
      
      const result = await this.deleteFileUseCase.execute(filePath, confirm)
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      this.logger.error('FileController.deleteFile failed', error as Error)
      
      const errorMessage = (error as Error).message
      const isNotFound = errorMessage.includes('not found')
      const isConfirmationError = errorMessage.includes('confirmation')
      
      let statusCode = 500
      let errorCode = 'SERVER_ERROR'
      
      if (isNotFound) {
        statusCode = 404
        errorCode = 'FILE_NOT_FOUND'
      } else if (isConfirmationError) {
        statusCode = 400
        errorCode = 'VALIDATION_ERROR'
      }
      
      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          timestamp: new Date()
        }
      })
    }
  }

  async copyFilePath(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.query.path as string
      
      if (!filePath) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File path parameter is required',
            timestamp: new Date()
          }
        })
        return
      }
      
      this.logger.info('FileController.copyFilePath called', { filePath })
      
      const result = await this.copyFilePathUseCase.execute(filePath)
      
      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      this.logger.error('FileController.copyFilePath failed', error as Error)
      
      const errorMessage = (error as Error).message
      const isNotFound = errorMessage.includes('not found')
      
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        error: {
          code: isNotFound ? 'FILE_NOT_FOUND' : 'SERVER_ERROR',
          message: isNotFound ? errorMessage : 'Failed to copy file path',
          timestamp: new Date()
        }
      })
    }
  }
}