import * as fs from 'fs-extra'
import * as path from 'path'
import { readdir, stat, readFile } from 'fs/promises'
import { File } from '../../domain/entities/File'
import { FilePath } from '../../domain/value-objects/FilePath'
import { FileType } from '../../domain/value-objects/FileType'
import { Tags } from '../../domain/value-objects/Tags'
import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { TagExtractionService } from '../../domain/services/TagExtractionService'
import { ILogger } from '../../application/ports/ILogger'

export class FileSystemFileRepository implements IFileRepository {
  constructor(
    private readonly basePath: string,
    private readonly tagExtractionService: TagExtractionService,
    private readonly logger: ILogger
  ) {}

  async findByPath(filePath: FilePath): Promise<File | null> {
    try {
      const fullPath = path.resolve(this.basePath, filePath.value)
      
      if (!await this.exists(filePath)) {
        return null
      }

      const stats = await stat(fullPath)
      if (!stats.isFile()) {
        return null
      }

      const name = path.basename(fullPath)
      const extension = path.extname(name)
      const fileType = FileType.fromExtension(extension)
      
      let tags = Tags.create([])
      let preview: string | undefined

      if (fileType.isEditable) {
        try {
          const content = await readFile(fullPath, 'utf-8')
          tags = this.tagExtractionService.extractFromMarkdown(content)
          preview = this.tagExtractionService.generatePreview(content)
        } catch (error) {
          this.logger.warn(`Failed to read file content: ${filePath.value}`, error as Error)
        }
      }

      return File.create({
        name,
        path: filePath.value,
        relativePath: path.relative(this.basePath, fullPath),
        size: stats.size,
        lastModified: stats.mtime,
        type: fileType.value,
        tags: tags.values,
        preview,
        isFavorite: false // Will be managed by frontend
      })
    } catch (error) {
      this.logger.error(`Failed to find file at path: ${filePath.value}`, error as Error)
      return null
    }
  }

  async findByDirectory(directoryPath: FilePath): Promise<File[]> {
    try {
      const fullPath = path.resolve(this.basePath, directoryPath.value)
      
      this.logger.debug(`Finding files in directory: ${fullPath}`)
      
      if (!await fs.pathExists(fullPath)) {
        this.logger.warn(`Directory does not exist: ${fullPath}`)
        return []
      }

      const entries = await readdir(fullPath, { withFileTypes: true })
      const files: File[] = []
      
      this.logger.debug(`Found ${entries.length} entries in ${fullPath}`)

      for (const entry of entries) {
        if (entry.isFile() && this.isSupportedFile(entry.name)) {
          const filePath = path.join(directoryPath.value, entry.name)
          
          this.logger.debug(`Processing file: ${entry.name}`)
          
          try {
            const file = await this.findByPath(FilePath.create(filePath))
            if (file) {
              files.push(file)
              this.logger.debug(`Added file: ${entry.name}`)
            }
          } catch (error) {
            const err = error as Error
            this.logger.warn(`Skipping file ${entry.name} due to error: ${err.message}`, err)
            this.logger.debug(`Error stack trace:`, { stack: err.stack })
          }
        }
      }

      // Sort by last modified descending
      files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

      return files
    } catch (error) {
      this.logger.error(`Failed to find files in directory: ${directoryPath.value}`, error as Error)
      throw error
    }
  }

  async findByTags(tags: Tags, operator: 'AND' | 'OR'): Promise<File[]> {
    try {
      const allFiles = await this.getAllFiles()
      
      const matchingFiles = allFiles.filter(file => {
        const fileTags = file.tags
        
        if (operator === 'AND') {
          return tags.containsAll(fileTags)
        } else {
          return tags.intersects(fileTags)
        }
      })

      return matchingFiles
    } catch (error) {
      this.logger.error('Failed to find files by tags', error as Error, { tags: tags.values, operator })
      throw error
    }
  }

  async save(file: File): Promise<void> {
    try {
      const fullPath = path.resolve(this.basePath, file.path.value)
      const directory = path.dirname(fullPath)
      
      // Ensure directory exists
      await fs.ensureDir(directory)
      
      // For now, we don't save file metadata separately
      // The file system already contains the file
      this.logger.debug(`File saved: ${file.path.value}`)
    } catch (error) {
      this.logger.error(`Failed to save file: ${file.path.value}`, error as Error)
      throw error
    }
  }

  async delete(filePath: FilePath): Promise<void> {
    try {
      const fullPath = path.resolve(this.basePath, filePath.value)
      
      if (await this.exists(filePath)) {
        await fs.remove(fullPath)
        this.logger.info(`File deleted: ${filePath.value}`)
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath.value}`, error as Error)
      throw error
    }
  }

  async exists(filePath: FilePath): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.basePath, filePath.value)
      const stats = await stat(fullPath)
      return stats.isFile()
    } catch {
      return false
    }
  }

  async getContent(filePath: FilePath): Promise<string> {
    try {
      const fullPath = path.resolve(this.basePath, filePath.value)
      const content = await readFile(fullPath, 'utf-8')
      return content
    } catch (error) {
      this.logger.error(`Failed to get content for file: ${filePath.value}`, error as Error)
      throw error
    }
  }

  async saveContent(filePath: FilePath, content: string): Promise<void> {
    try {
      const fullPath = path.resolve(this.basePath, filePath.value)
      const directory = path.dirname(fullPath)
      
      // Ensure directory exists
      await fs.ensureDir(directory)
      
      await fs.writeFile(fullPath, content, 'utf-8')
      this.logger.info(`Content saved to file: ${filePath.value}`)
    } catch (error) {
      this.logger.error(`Failed to save content to file: ${filePath.value}`, error as Error)
      throw error
    }
  }

  async getAllTags(): Promise<Tags> {
    try {
      const allFiles = await this.getAllFiles()
      const allTags = new Set<string>()
      
      for (const file of allFiles) {
        for (const tag of file.tags.values) {
          allTags.add(tag)
        }
      }

      return Tags.create(Array.from(allTags))
    } catch (error) {
      this.logger.error('Failed to get all tags', error as Error)
      throw error
    }
  }

  private async getAllFiles(): Promise<File[]> {
    const allFiles: File[] = []
    
    try {
      await this.scanDirectoryRecursively(this.basePath, allFiles)
    } catch (error) {
      this.logger.error('Failed to scan all files', error as Error)
    }

    return allFiles
  }

  private async scanDirectoryRecursively(directoryPath: string, files: File[]): Promise<void> {
    try {
      const entries = await readdir(directoryPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(directoryPath, entry.name)
        
        if (entry.isDirectory()) {
          await this.scanDirectoryRecursively(fullPath, files)
        } else if (entry.isFile() && this.isSupportedFile(entry.name)) {
          try {
            const relativePath = path.relative(this.basePath, fullPath)
            const file = await this.findByPath(FilePath.create(relativePath))
            if (file) {
              files.push(file)
            }
          } catch (error) {
            this.logger.warn(`Skipping file ${entry.name} due to error`, error as Error)
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to scan directory: ${directoryPath}`, error as Error)
    }
  }

  private isSupportedFile(filename: string): boolean {
    const supportedExtensions = ['.md', '.txt', '.log', '.json']
    const extension = path.extname(filename).toLowerCase()
    return supportedExtensions.includes(extension)
  }
}