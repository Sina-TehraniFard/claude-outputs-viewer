import { FileId } from '../value-objects/FileId'
import { FilePath } from '../value-objects/FilePath'
import { FileSize } from '../value-objects/FileSize'
import { FileType } from '../value-objects/FileType'
import { Tags } from '../value-objects/Tags'

export class File {
  private constructor(
    private readonly _id: FileId,
    private readonly _name: string,
    private readonly _path: FilePath,
    private readonly _relativePath: FilePath,
    private readonly _size: FileSize,
    private readonly _lastModified: Date,
    private readonly _type: FileType,
    private readonly _tags: Tags,
    private readonly _preview: string | undefined,
    private _isFavorite: boolean
  ) {}

  static create(params: {
    name: string
    path: string
    relativePath: string
    size: number
    lastModified: Date
    type: 'markdown' | 'text' | 'other'
    tags: string[]
    preview?: string
    isFavorite: boolean
  }): File {
    return new File(
      FileId.create(),
      params.name,
      FilePath.create(params.path),
      FilePath.create(params.relativePath),
      FileSize.create(params.size),
      params.lastModified,
      FileType.create(params.type),
      Tags.create(params.tags),
      params.preview,
      params.isFavorite
    )
  }

  get id(): FileId {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get path(): FilePath {
    return this._path
  }

  get relativePath(): FilePath {
    return this._relativePath
  }

  get size(): FileSize {
    return this._size
  }

  get lastModified(): Date {
    return this._lastModified
  }

  get type(): FileType {
    return this._type
  }

  get tags(): Tags {
    return this._tags
  }

  get preview(): string | undefined {
    return this._preview
  }

  get isFavorite(): boolean {
    return this._isFavorite
  }

  toggleFavorite(): void {
    this._isFavorite = !this._isFavorite
  }

  addTag(tag: string): void {
    this._tags.add(tag)
  }

  removeTag(tag: string): void {
    this._tags.remove(tag)
  }

  toDTO() {
    return {
      name: this._name,
      path: this._path.value,
      relativePath: this._relativePath.value,
      size: this._size.value,
      lastModified: this._lastModified,
      type: this._type.value,
      tags: this._tags.values,
      preview: this._preview,
      isFavorite: this._isFavorite
    }
  }
}