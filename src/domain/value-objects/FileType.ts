export type FileTypeValue = 'markdown' | 'text' | 'other'

export class FileType {
  private constructor(private readonly _value: FileTypeValue) {
    this.validate(_value)
  }

  static create(value: FileTypeValue): FileType {
    return new FileType(value)
  }

  static fromExtension(extension: string): FileType {
    const ext = extension.toLowerCase()
    
    switch (ext) {
      case '.md':
      case '.markdown':
        return new FileType('markdown')
      case '.txt':
      case '.log':
        return new FileType('text')
      default:
        return new FileType('other')
    }
  }

  private validate(value: FileTypeValue): void {
    const validTypes: FileTypeValue[] = ['markdown', 'text', 'other']
    if (!validTypes.includes(value)) {
      throw new Error(`Invalid file type: ${value}`)
    }
  }

  get value(): FileTypeValue {
    return this._value
  }

  get isMarkdown(): boolean {
    return this._value === 'markdown'
  }

  get isText(): boolean {
    return this._value === 'text'
  }

  get isEditable(): boolean {
    return this._value === 'markdown' || this._value === 'text'
  }

  equals(other: FileType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}