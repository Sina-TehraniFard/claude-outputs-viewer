import { DirectoryId } from '../value-objects/DirectoryId'
import { FilePath } from '../value-objects/FilePath'
import { FileCount } from '../value-objects/FileCount'

export class Directory {
  private constructor(
    private readonly _id: DirectoryId,
    private readonly _name: string,
    private readonly _path: FilePath,
    private readonly _date: string,
    private readonly _fileCount: FileCount,
    private readonly _lastModified: Date,
    private readonly _isDateBased: boolean
  ) {}

  static create(params: {
    name: string
    path: string
    date: string
    fileCount: number
    lastModified: Date
    isDateBased: boolean
  }): Directory {
    return new Directory(
      DirectoryId.create(),
      params.name,
      FilePath.create(params.path),
      params.date,
      FileCount.create(params.fileCount),
      params.lastModified,
      params.isDateBased
    )
  }

  get id(): DirectoryId {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get path(): FilePath {
    return this._path
  }

  get date(): string {
    return this._date
  }

  get fileCount(): FileCount {
    return this._fileCount
  }

  get lastModified(): Date {
    return this._lastModified
  }

  get isDateBased(): boolean {
    return this._isDateBased
  }

  toDTO() {
    return {
      name: this._name,
      path: this._path.value,
      date: this._date,
      fileCount: this._fileCount.value,
      lastModified: this._lastModified,
      isDateBased: this._isDateBased
    }
  }
}