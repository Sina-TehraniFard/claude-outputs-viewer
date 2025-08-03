import { Tags } from '../value-objects/Tags'

export class TagExtractionService {
  extractFromMarkdown(content: string): Tags {
    const tags: string[] = []
    
    // Extract hashtags (#tag)
    const hashtagRegex = /#([a-zA-Z0-9\-_]+)/g
    let match
    while ((match = hashtagRegex.exec(content)) !== null) {
      const tagValue = match[1]
      tags.push(tagValue)
    }
    
    // Extract tags from frontmatter
    const frontmatterTags = this.extractFromFrontmatter(content)
    tags.push(...frontmatterTags)
    
    // Extract tags from tag blocks
    const tagBlockTags = this.extractFromTagBlocks(content)
    tags.push(...tagBlockTags)
    
    return Tags.create(tags)
  }
  
  private extractFromFrontmatter(content: string): string[] {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/
    const match = frontmatterRegex.exec(content)
    
    if (!match) return []
    
    const frontmatter = match[1]
    const tagsRegex = /^tags:\s*(.+)$/m
    const tagsMatch = tagsRegex.exec(frontmatter)
    
    if (!tagsMatch) return []
    
    // Handle array format: [tag1, tag2] or - tag1\n- tag2
    const tagsString = tagsMatch[1].trim()
    
    if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
      // Array format: [tag1, tag2, tag3]
      return tagsString
        .slice(1, -1)
        .split(',')
        .map(tag => tag.trim().replace(/['"]/g, ''))
        .filter(tag => tag.length > 0)
    }
    
    // YAML list format handled elsewhere
    return []
  }
  
  private extractFromTagBlocks(content: string): string[] {
    const tags: string[] = []
    
    // Extract from "Tags: tag1, tag2, tag3" format
    const tagLineRegex = /^Tags:\s*(.+)$/gm
    let match
    while ((match = tagLineRegex.exec(content)) !== null) {
      const tagString = match[1]
      const lineTags = tagString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      tags.push(...lineTags)
    }
    
    return tags
  }
  
  generatePreview(content: string, maxLength: number = 200): string {
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '')
    
    // Remove markdown formatting
    const cleanContent = contentWithoutFrontmatter
      .replace(/#+\s/g, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, '') // Code blocks
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
      .replace(/\n+/g, ' ') // Multiple newlines to space
      .trim()
    
    return cleanContent.length <= maxLength 
      ? cleanContent 
      : cleanContent.substring(0, maxLength - 3) + '...'
  }
}