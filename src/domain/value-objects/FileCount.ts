export class FileCount {
  private constructor(private readonly _value: number) {
    this.validate(_value)
  }

  static create(value: number): FileCount {
    return new FileCount(value)
  }

  private validate(value: number): void {
    if (value < 0) {
      throw new Error('File count cannot be negative')
    }

    if (!Number.isInteger(value)) {
      throw new Error('File count must be an integer')
    }
  }

  get value(): number {
    return this._value
  }

  get isEmpty(): boolean {
    return this._value === 0
  }

  increment(): FileCount {
    return new FileCount(this._value + 1)
  }

  decrement(): FileCount {
    return new FileCount(Math.max(0, this._value - 1))
  }

  equals(other: FileCount): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value.toString()
  }
}