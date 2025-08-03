import { FilePath } from '../../domain/value-objects/FilePath'
import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { ILogger } from '../ports/ILogger'

export class DeleteFileUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly logger: ILogger
  ) {}

  async execute(filePath: string, confirmed: boolean = false): Promise<{ success: boolean; deletedPath: string }> {
    try {
      this.logger.info('Executing DeleteFileUseCase', { filePath, confirmed })
      
      if (!confirmed) {
        throw new Error('File deletion requires confirmation')
      }
      
      const path = FilePath.create(filePath)
      
      // Check if file exists
      const existingFile = await this.fileRepository.findByPath(path)
      if (!existingFile) {
        throw new Error(`File not found: ${filePath}`)
      }
      
      // Delete the file
      await this.fileRepository.delete(path)
      
      this.logger.info('DeleteFileUseCase completed successfully', { filePath })
      
      return { success: true, deletedPath: filePath }
    } catch (error) {
      this.logger.error('DeleteFileUseCase failed', error as Error, { filePath })
      throw error
    }
  }
}