import * as fs from 'fs-extra'
import * as path from 'path'
import { readdir, stat } from 'fs/promises'
import { Directory } from '../../domain/entities/Directory'
import { FilePath } from '../../domain/value-objects/FilePath'
import { IDirectoryRepository } from '../../domain/repositories/IDirectoryRepository'
import { ILogger } from '../../application/ports/ILogger'

export class FileSystemDirectoryRepository implements IDirectoryRepository {
  constructor(
    private readonly basePath: string,
    private readonly logger: ILogger
  ) {}

  async findAll(): Promise<Directory[]> {
    try {
      const directories = await this.findDateBasedDirectories(FilePath.create(this.basePath))
      this.logger.debug(`Found ${directories.length} directories in ${this.basePath}`)
      return directories
    } catch (error) {
      this.logger.error('Failed to find all directories', error as Error)
      throw error
    }
  }

  async findByPath(directoryPath: FilePath): Promise<Directory | null> {
    try {
      const fullPath = path.resolve(this.basePath, directoryPath.value)
      
      if (!await this.exists(directoryPath)) {
        return null
      }

      const stats = await stat(fullPath)
      if (!stats.isDirectory()) {
        return null
      }

      const name = path.basename(fullPath)
      const fileCountNumber = await this.getFileCount(directoryPath)
      const lastModified = await this.getLastModified(directoryPath)

      return Directory.create({
        name,
        path: directoryPath.value,
        date: this.extractDateFromDirectoryName(name),
        fileCount: fileCountNumber,
        lastModified,
        isDateBased: this.isDateBasedDirectory(name)
      })
    } catch (error) {
      this.logger.error(`Failed to find directory at path: ${directoryPath.value}`, error as Error)
      return null
    }
  }

  async findDateBasedDirectories(basePath: FilePath): Promise<Directory[]> {
    try {
      const fullBasePath = path.resolve(basePath.value)
      
      if (!await fs.pathExists(fullBasePath)) {
        this.logger.warn(`Base path does not exist: ${fullBasePath}`)
        return []
      }

      const entries = await readdir(fullBasePath, { withFileTypes: true })
      const directories: Directory[] = []

      for (const entry of entries) {
        if (entry.isDirectory() && this.isDateBasedDirectory(entry.name)) {
          const directoryPath = path.join(fullBasePath, entry.name)
          const relativePath = path.relative(this.basePath, directoryPath)
          
          try {
            const fileCountNumber = await this.getFileCount(FilePath.create(relativePath))
            const lastModified = await this.getLastModified(FilePath.create(relativePath))

            const directory = Directory.create({
              name: entry.name,
              path: relativePath,
              date: this.extractDateFromDirectoryName(entry.name),
              fileCount: fileCountNumber,
              lastModified,
              isDateBased: true
            })

            directories.push(directory)
          } catch (error) {
            this.logger.warn(`Skipping directory ${entry.name} due to error`, error as Error)
          }
        }
      }

      // Sort by date descending (newest first)
      directories.sort((a, b) => b.date.localeCompare(a.date))

      return directories
    } catch (error) {
      this.logger.error(`Failed to find date-based directories in: ${basePath.value}`, error as Error)
      throw error
    }
  }

  async exists(directoryPath: FilePath): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.basePath, directoryPath.value)
      const stats = await stat(fullPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  async getFileCount(directoryPath: FilePath): Promise<number> {
    try {
      const fullPath = path.resolve(this.basePath, directoryPath.value)
      const entries = await readdir(fullPath, { withFileTypes: true })
      
      const fileCount = entries.filter(entry => 
        entry.isFile() && this.isSupportedFile(entry.name)
      ).length

      return fileCount
    } catch (error) {
      this.logger.warn(`Failed to get file count for: ${directoryPath.value}`, error as Error)
      return 0
    }
  }

  async getLastModified(directoryPath: FilePath): Promise<Date> {
    try {
      const fullPath = path.resolve(this.basePath, directoryPath.value)
      const entries = await readdir(fullPath)
      
      let latestDate = new Date(0) // Unix epoch
      
      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry)
        try {
          const stats = await stat(entryPath)
          if (stats.isFile() && stats.mtime > latestDate) {
            latestDate = stats.mtime
          }
        } catch {
          // Skip files that can't be accessed
        }
      }

      // If no files found, use directory modification time
      if (latestDate.getTime() === 0) {
        const stats = await stat(fullPath)
        latestDate = stats.mtime
      }

      return latestDate
    } catch (error) {
      this.logger.warn(`Failed to get last modified time for: ${directoryPath.value}`, error as Error)
      return new Date()
    }
  }

  private isDateBasedDirectory(name: string): boolean {
    // Match YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    return dateRegex.test(name)
  }

  private extractDateFromDirectoryName(name: string): string {
    if (this.isDateBasedDirectory(name)) {
      return name
    }
    
    // Try to extract date from other formats
    const dateMatch = name.match(/(\d{4}-\d{2}-\d{2})/)
    return dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
  }

  private isSupportedFile(filename: string): boolean {
    const supportedExtensions = ['.md', '.txt', '.log', '.json']
    const extension = path.extname(filename).toLowerCase()
    return supportedExtensions.includes(extension)
  }
}