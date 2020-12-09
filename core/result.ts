export interface IResult<T, E = any> {
  readonly fail: boolean
  readonly success: boolean
  readonly error?: E
  unwrap(): T
}

export class Result<T, E = any> implements IResult<T, E> {
  private value: T

  constructor(value: T) {
    this.value = value
  }

  get fail() {
    return false
  }

  get success() {
    return true
  }

  unwrap() {
    return this.value
  }
}

export class ResultError<T, E = any> implements IResult<T, E> {
  readonly error: E

  constructor(error: E) {
    this.error = error
  }

  get fail() {
    return true
  }

  get success() {
    return false
  }

  unwrap() {
    throw new Error('try unchecked unwrap')

    return (undefined as any) as T
  }
}
