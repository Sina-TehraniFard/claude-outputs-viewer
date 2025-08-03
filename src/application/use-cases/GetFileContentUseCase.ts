import { FilePath } from '../../domain/value-objects/FilePath'
import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { ILogger } from '../ports/ILogger'

export class GetFileContentUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly logger: ILogger
  ) {}

  async execute(filePath: string): Promise<{ content: string; file: any }> {
    try {
      this.logger.info('Executing GetFileContentUseCase', { filePath })
      
      const path = FilePath.create(filePath)
      
      const file = await this.fileRepository.findByPath(path)
      if (!file) {
        throw new Error(`File not found: ${filePath}`)
      }
      
      const content = await this.fileRepository.getContent(path)
      
      this.logger.info('GetFileContentUseCase completed successfully', { filePath })
      
      return { content, file: file.toDTO() }
    } catch (error) {
      this.logger.error('GetFileContentUseCase failed', error as Error, { filePath })
      throw error
    }
  }
}