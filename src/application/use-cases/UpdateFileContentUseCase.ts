import { FilePath } from '../../domain/value-objects/FilePath'
import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { ILogger } from '../ports/ILogger'

export class UpdateFileContentUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly logger: ILogger
  ) {}

  async execute(filePath: string, content: string): Promise<{ success: boolean; file: any }> {
    try {
      this.logger.info('Executing UpdateFileContentUseCase', { filePath })
      
      const path = FilePath.create(filePath)
      
      // Check if file exists
      const existingFile = await this.fileRepository.findByPath(path)
      if (!existingFile) {
        throw new Error(`File not found: ${filePath}`)
      }
      
      // Save the new content
      await this.fileRepository.saveContent(path, content)
      
      // Get the updated file information
      const updatedFile = await this.fileRepository.findByPath(path)
      if (!updatedFile) {
        throw new Error(`Failed to retrieve updated file: ${filePath}`)
      }
      
      this.logger.info('UpdateFileContentUseCase completed successfully', { filePath })
      
      return { success: true, file: updatedFile.toDTO() }
    } catch (error) {
      this.logger.error('UpdateFileContentUseCase failed', error as Error, { filePath })
      throw error
    }
  }
}