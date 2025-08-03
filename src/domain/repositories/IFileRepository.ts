import { File } from '../entities/File'
import { FilePath } from '../value-objects/FilePath'
import { Tags } from '../value-objects/Tags'

export interface IFileRepository {
  findByPath(path: FilePath): Promise<File | null>
  findByDirectory(directoryPath: FilePath): Promise<File[]>
  findByTags(tags: Tags, operator: 'AND' | 'OR'): Promise<File[]>
  save(file: File): Promise<void>
  delete(path: FilePath): Promise<void>
  exists(path: FilePath): Promise<boolean>
  getContent(path: FilePath): Promise<string>
  saveContent(path: FilePath, content: string): Promise<void>
  getAllTags(): Promise<Tags>
}