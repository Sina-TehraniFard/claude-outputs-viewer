export class Tags {
  private constructor(private readonly _values: Set<string>) {
    this.validate(_values)
  }

  static create(values: string[] = []): Tags {
    const uniqueValues = new Set(values.map(tag => tag.trim().toLowerCase()))
    return new Tags(uniqueValues)
  }

  private validate(values: Set<string>): void {
    for (const tag of values) {
      if (!tag || tag.trim().length === 0) {
        throw new Error('Tag cannot be empty')
      }

      if (tag.length > 50) {
        throw new Error('Tag is too long (max 50 characters)')
      }

      if (!/^[a-zA-Z0-9\-_]+$/.test(tag)) {
        throw new Error('Tag contains invalid characters (only alphanumeric, dash, underscore)')
      }
    }
  }

  get values(): string[] {
    return Array.from(this._values).sort()
  }

  get count(): number {
    return this._values.size
  }

  has(tag: string): boolean {
    return this._values.has(tag.trim().toLowerCase())
  }

  add(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase()
    if (normalizedTag) {
      this.validate(new Set([normalizedTag]))
      this._values.add(normalizedTag)
    }
  }

  remove(tag: string): void {
    this._values.delete(tag.trim().toLowerCase())
  }

  intersects(other: Tags): boolean {
    for (const tag of this._values) {
      if (other.has(tag)) {
        return true
      }
    }
    return false
  }

  containsAll(other: Tags): boolean {
    for (const tag of other._values) {
      if (!this.has(tag)) {
        return false
      }
    }
    return true
  }

  equals(other: Tags): boolean {
    if (this._values.size !== other._values.size) {
      return false
    }
    
    for (const tag of this._values) {
      if (!other.has(tag)) {
        return false
      }
    }
    
    return true
  }

  toString(): string {
    return this.values.join(', ')
  }
}