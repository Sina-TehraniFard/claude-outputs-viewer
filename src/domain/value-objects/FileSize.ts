export class FileSize {
  private constructor(private readonly _value: number) {
    this.validate(_value)
  }

  static create(value: number): FileSize {
    return new FileSize(value)
  }

  private validate(value: number): void {
    if (value < 0) {
      throw new Error('File size cannot be negative')
    }

    if (value > 100 * 1024 * 1024) { // 100MB
      throw new Error('File size is too large (max 100MB)')
    }
  }

  get value(): number {
    return this._value
  }

  get inKB(): number {
    return this._value / 1024
  }

  get inMB(): number {
    return this._value / (1024 * 1024)
  }

  format(): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = this._value
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  equals(other: FileSize): boolean {
    return this._value === other._value
  }
}