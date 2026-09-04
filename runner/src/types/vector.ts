export type ExpectedSuccess = {
  readonly status: 'success'
  readonly value: unknown
  readonly observations?: Readonly<Record<string, unknown>>
}

export type ExpectedError = {
  readonly status: 'error'
  readonly error: { readonly code: string }
  readonly observations?: Readonly<Record<string, unknown>>
}

export type ExpectedResult = ExpectedSuccess | ExpectedError

export interface ConformanceVector {
  readonly id: string
  readonly spec: string
  readonly requirements: readonly string[]
  readonly description: string
  readonly operation: string
  readonly input: Readonly<Record<string, unknown>>
  readonly context?: Readonly<Record<string, unknown>>
  readonly expected: ExpectedResult
  readonly tags: readonly string[]
  readonly guardsAgainst?: readonly string[]
}

export interface LoadedVector extends ConformanceVector {
  readonly suiteId: string
  readonly sourceFile: string
}

export interface VectorFile {
  readonly finkoreVectorFile: '0.1'
  readonly vectors: readonly ConformanceVector[]
}
