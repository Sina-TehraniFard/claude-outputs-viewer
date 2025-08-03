export class FilePath {
  private constructor(private readonly _value: string) {
    this.validate(_value)
  }

  static create(value: string): FilePath {
    return new FilePath(value)
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('FilePath cannot be empty')
    }

    if (value.includes('..')) {
      throw new Error('Path traversal is not allowed')
    }

    if (value.length > 1000) {
      throw new Error('Path is too long (max 1000 characters)')
    }

    // Allow Unicode characters for international file names (including Japanese)
    // Disallow only specific dangerous characters
    if (/[\x00-\x1f\x7f<>:"|?*\\]/.test(value)) {
      throw new Error('Path contains invalid characters')
    }
  }

  get value(): string {
    return this._value
  }

  get fileName(): string {
    return this._value.split('/').pop() || ''
  }

  get directory(): string {
    const parts = this._value.split('/')
    parts.pop()
    return parts.join('/')
  }

  get extension(): string {
    const fileName = this.fileName
    const lastDot = fileName.lastIndexOf('.')
    return lastDot !== -1 ? fileName.substring(lastDot) : ''
  }

  equals(other: FilePath): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}