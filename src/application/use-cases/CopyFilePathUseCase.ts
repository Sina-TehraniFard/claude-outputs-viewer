import { FilePath } from '@/domain/value-objects/FilePath.ts'
import { IFileRepository } from '@/domain/repositories/IFileRepository.ts'
import { ILogger } from '../ports/ILogger'

export class CopyFilePathUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly logger: ILogger
  ) {}

  async execute(filePath: string): Promise<{ success: boolean; copiedPath: string }> {
    try {
      this.logger.info('Executing CopyFilePathUseCase', { filePath })
      
      const path = FilePath.create(filePath)
      
      // Check if file exists
      const existingFile = await this.fileRepository.findByPath(path)
      if (!existingFile) {
        throw new Error(`File not found: ${filePath}`)
      }
      
      // Return the path that should be copied to clipboard
      // The actual copying will be handled by the frontend
      const absolutePath = path.value
      
      this.logger.info('CopyFilePathUseCase completed successfully', { filePath })
      
      return { success: true, copiedPath: absolutePath }
    } catch (error) {
      this.logger.error('CopyFilePathUseCase failed', error as Error, { filePath })
      throw error
    }
  }
}