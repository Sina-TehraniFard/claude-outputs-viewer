import { Directory } from '../../domain/entities/Directory'
import { IDirectoryRepository } from '../../domain/repositories/IDirectoryRepository'
import { ILogger } from '../ports/ILogger'

export class GetDirectoriesUseCase {
  constructor(
    private readonly directoryRepository: IDirectoryRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<Directory[]> {
    try {
      this.logger.info('Executing GetDirectoriesUseCase')
      
      const directories = await this.directoryRepository.findAll()
      
      this.logger.info('GetDirectoriesUseCase completed successfully', {
        count: directories.length
      })
      
      return directories
    } catch (error) {
      this.logger.error('GetDirectoriesUseCase failed', error as Error)
      throw error
    }
  }
}