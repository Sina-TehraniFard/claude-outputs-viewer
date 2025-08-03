import { v4 as uuidv4 } from 'uuid'

export class DirectoryId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim().length === 0) {
      throw new Error('DirectoryId cannot be empty')
    }
  }

  static create(value?: string): DirectoryId {
    return new DirectoryId(value || uuidv4())
  }

  get value(): string {
    return this._value
  }

  equals(other: DirectoryId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}