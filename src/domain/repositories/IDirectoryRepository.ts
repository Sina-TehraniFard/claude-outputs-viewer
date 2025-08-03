import { Directory } from '../entities/Directory'
import { FilePath } from '../value-objects/FilePath'

export interface IDirectoryRepository {
  findAll(): Promise<Directory[]>
  findByPath(path: FilePath): Promise<Directory | null>
  findDateBasedDirectories(basePath: FilePath): Promise<Directory[]>
  exists(path: FilePath): Promise<boolean>
  getFileCount(path: FilePath): Promise<number>
  getLastModified(path: FilePath): Promise<Date>
}