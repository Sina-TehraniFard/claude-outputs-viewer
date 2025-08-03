import { File } from '../../domain/entities/File'
import { Directory } from '../../domain/entities/Directory'
import { FilePath } from '../../domain/value-objects/FilePath'
import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { IDirectoryRepository } from '../../domain/repositories/IDirectoryRepository'
import { ILogger } from '../ports/ILogger'

export class GetFilesUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly directoryRepository: IDirectoryRepository,
    private readonly logger: ILogger
  ) {}

  async execute(directoryPath: string): Promise<{ files: File[]; directory: Directory }> {
    try {
      this.logger.info('Executing GetFilesUseCase', { directoryPath })
      
      const path = FilePath.create(directoryPath)
      
      const directory = await this.directoryRepository.findByPath(path)
      if (!directory) {
        throw new Error(`Directory not found: ${directoryPath}`)
      }
      
      const files = await this.fileRepository.findByDirectory(path)
      
      this.logger.info('GetFilesUseCase completed successfully', {
        directoryPath,
        fileCount: files.length
      })
      
      return { files, directory }
    } catch (error) {
      this.logger.error('GetFilesUseCase failed', error as Error, { directoryPath })
      throw error
    }
  }
}