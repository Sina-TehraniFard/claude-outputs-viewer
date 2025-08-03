import { v4 as uuidv4 } from 'uuid'

export class FileId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('FileId cannot be empty')
    }
  }

  static create(value?: string): FileId {
    return new FileId(value || uuidv4())
  }

  get value(): string {
    return this._value
  }

  equals(other: FileId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}