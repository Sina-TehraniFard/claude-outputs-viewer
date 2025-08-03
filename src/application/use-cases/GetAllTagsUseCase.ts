import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { ILogger } from '../ports/ILogger'

export class GetAllTagsUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<{ tags: string[]; count: number }> {
    try {
      this.logger.info('Executing GetAllTagsUseCase')
      
      const allTags = await this.fileRepository.getAllTags()
      const tags = allTags.values
      
      this.logger.info('GetAllTagsUseCase completed successfully', {
        tagCount: tags.length
      })
      
      return {
        tags,
        count: tags.length
      }
    } catch (error) {
      this.logger.error('GetAllTagsUseCase failed', error as Error)
      throw error
    }
  }
}