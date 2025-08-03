import { Tags } from '../../domain/value-objects/Tags'
import { IFileRepository } from '../../domain/repositories/IFileRepository'
import { ILogger } from '../ports/ILogger'

export interface SearchQuery {
  tags: string[]
  operator: 'AND' | 'OR'
  includeContent: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface SearchResult {
  file: any
  matchedTags: string[]
  contentMatches?: {
    line: number
    text: string
    highlighted: string
  }[]
  score: number
}

export class SearchFilesUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly logger: ILogger
  ) {}

  async execute(query: SearchQuery): Promise<{ results: SearchResult[]; totalCount: number; searchTime: number }> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Executing SearchFilesUseCase', { query })
      
      if (!query.tags || query.tags.length === 0) {
        throw new Error('At least one tag is required for search')
      }
      
      const searchTags = Tags.create(query.tags)
      const files = await this.fileRepository.findByTags(searchTags, query.operator)
      
      // Filter by date range if specified
      let filteredFiles = files
      if (query.dateRange) {
        filteredFiles = files.filter(file => {
          const fileDate = file.lastModified
          return fileDate >= query.dateRange!.start && fileDate <= query.dateRange!.end
        })
      }
      
      // Create search results
      const results: SearchResult[] = filteredFiles.map(file => {
        const matchedTags = this.getMatchedTags(file.tags, searchTags, query.operator)
        const score = this.calculateScore(file, matchedTags, query)
        
        const result: SearchResult = {
          file: file.toDTO(),
          matchedTags,
          score
        }
        
        // Add content matches if requested
        if (query.includeContent && file.preview) {
          result.contentMatches = this.findContentMatches(file.preview, query.tags)
        }
        
        return result
      })
      
      // Sort by score descending
      results.sort((a, b) => b.score - a.score)
      
      const searchTime = Date.now() - startTime
      
      this.logger.info('SearchFilesUseCase completed successfully', {
        resultCount: results.length,
        searchTime
      })
      
      return {
        results,
        totalCount: results.length,
        searchTime
      }
    } catch (error) {
      this.logger.error('SearchFilesUseCase failed', error as Error, { query })
      throw error
    }
  }
  
  private getMatchedTags(fileTags: Tags, searchTags: Tags, _operator: 'AND' | 'OR'): string[] {
    const matched: string[] = []
    
    for (const tag of searchTags.values) {
      if (fileTags.has(tag)) {
        matched.push(tag)
      }
    }
    
    return matched
  }
  
  private calculateScore(file: any, matchedTags: string[], _query: SearchQuery): number {
    let score = 0
    
    // Base score from matched tags
    score += matchedTags.length * 10
    
    // Bonus for newer files
    const daysSinceModified = (Date.now() - file.lastModified.getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 30 - daysSinceModified) * 2
    
    // Bonus for markdown files
    if (file.type === 'markdown') {
      score += 5
    }
    
    // Penalty for very old files
    if (daysSinceModified > 90) {
      score -= 10
    }
    
    return Math.max(0, score)
  }
  
  private findContentMatches(content: string, searchTerms: string[]): {
    line: number
    text: string
    highlighted: string
  }[] {
    const lines = content.split('\n')
    const matches: { line: number; text: string; highlighted: string }[] = []
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase()
      const hasMatch = searchTerms.some(term => 
        lowerLine.includes(term.toLowerCase())
      )
      
      if (hasMatch) {
        let highlighted = line
        searchTerms.forEach(term => {
          const regex = new RegExp(`(${term})`, 'gi')
          highlighted = highlighted.replace(regex, '<mark>$1</mark>')
        })
        
        matches.push({
          line: index + 1,
          text: line,
          highlighted
        })
      }
    })
    
    return matches.slice(0, 10) // Limit to 10 matches per file
  }
}