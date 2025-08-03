// Dependency Injection Container for Clean Architecture
import { GetDirectoriesUseCase } from '../../application/use-cases/GetDirectoriesUseCase'
import { GetFilesUseCase } from '../../application/use-cases/GetFilesUseCase'
import { GetFileContentUseCase } from '../../application/use-cases/GetFileContentUseCase'
import { UpdateFileContentUseCase } from '../../application/use-cases/UpdateFileContentUseCase'
import { DeleteFileUseCase } from '../../application/use-cases/DeleteFileUseCase'
import { CopyFilePathUseCase } from '../../application/use-cases/CopyFilePathUseCase'
import { SearchFilesUseCase } from '../../application/use-cases/SearchFilesUseCase'
import { GetAllTagsUseCase } from '../../application/use-cases/GetAllTagsUseCase'
import { DirectoryController } from '../../presentation/controllers/DirectoryController'
import { FileController } from '../../presentation/controllers/FileController'
import { SearchController } from '../../presentation/controllers/SearchController'
import { ErrorHandler } from '../../presentation/middleware/ErrorHandler'
import { SecurityMiddleware } from '../../presentation/middleware/SecurityMiddleware'
import { ConsoleLogger } from '../adapters/ConsoleLogger'
import { FileSystemDirectoryRepository } from '../repositories/FileSystemDirectoryRepository'
import { FileSystemFileRepository } from '../repositories/FileSystemFileRepository'
import { TagExtractionService } from '../../domain/services/TagExtractionService'
import { ILogger } from '../../application/ports/ILogger'
import { IDirectoryRepository } from '../../domain/repositories/IDirectoryRepository'
import { IFileRepository } from '../../domain/repositories/IFileRepository'

export class DIContainer {
  private static instance: DIContainer
  private logger: ILogger
  private directoryRepository: IDirectoryRepository
  private fileRepository: IFileRepository
  private tagExtractionService: TagExtractionService

  private constructor() {
    this.logger = new ConsoleLogger()
    this.tagExtractionService = new TagExtractionService()
    
    // Use actual file system implementations
    const basePath = process.env.CLAUDE_OUTPUTS_PATH || '/Users/tehrani/Documents/claude-outputs'
    this.directoryRepository = new FileSystemDirectoryRepository(basePath, this.logger)
    this.fileRepository = new FileSystemFileRepository(basePath, this.tagExtractionService, this.logger)
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  getLogger(): ILogger {
    return this.logger
  }

  getDirectoryRepository(): IDirectoryRepository {
    return this.directoryRepository
  }

  getFileRepository(): IFileRepository {
    return this.fileRepository
  }

  getGetDirectoriesUseCase(): GetDirectoriesUseCase {
    return new GetDirectoriesUseCase(
      this.getDirectoryRepository(),
      this.getLogger()
    )
  }

  getGetFilesUseCase(): GetFilesUseCase {
    return new GetFilesUseCase(
      this.getFileRepository(),
      this.getDirectoryRepository(),
      this.getLogger()
    )
  }

  getGetFileContentUseCase(): GetFileContentUseCase {
    return new GetFileContentUseCase(
      this.getFileRepository(),
      this.getLogger()
    )
  }

  getUpdateFileContentUseCase(): UpdateFileContentUseCase {
    return new UpdateFileContentUseCase(
      this.getFileRepository(),
      this.getLogger()
    )
  }

  getDeleteFileUseCase(): DeleteFileUseCase {
    return new DeleteFileUseCase(
      this.getFileRepository(),
      this.getLogger()
    )
  }

  getCopyFilePathUseCase(): CopyFilePathUseCase {
    return new CopyFilePathUseCase(
      this.getFileRepository(),
      this.getLogger()
    )
  }

  getSearchFilesUseCase(): SearchFilesUseCase {
    return new SearchFilesUseCase(
      this.getFileRepository(),
      this.getLogger()
    )
  }

  getGetAllTagsUseCase(): GetAllTagsUseCase {
    return new GetAllTagsUseCase(
      this.getFileRepository(),
      this.getLogger()
    )
  }

  getDirectoryController(): DirectoryController {
    return new DirectoryController(
      this.getGetDirectoriesUseCase(),
      this.getLogger()
    )
  }

  getFileController(): FileController {
    return new FileController(
      this.getGetFilesUseCase(),
      this.getGetFileContentUseCase(),
      this.getUpdateFileContentUseCase(),
      this.getDeleteFileUseCase(),
      this.getCopyFilePathUseCase(),
      this.getLogger()
    )
  }

  getSearchController(): SearchController {
    return new SearchController(
      this.getSearchFilesUseCase(),
      this.getGetAllTagsUseCase(),
      this.getLogger()
    )
  }

  getErrorHandler(): ErrorHandler {
    return new ErrorHandler(this.getLogger())
  }

  getSecurityMiddleware(): SecurityMiddleware {
    return new SecurityMiddleware(this.getLogger())
  }
}