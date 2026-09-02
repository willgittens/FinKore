export type RunnerErrorKind = 'MANIFEST' | 'VECTOR' | 'METADATA' | 'IO'

export class RunnerInfrastructureError extends Error {
  readonly kind: RunnerErrorKind
  readonly path?: string

  constructor(kind: RunnerErrorKind, message: string, path?: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'RunnerInfrastructureError'
    this.kind = kind
    if (path !== undefined) this.path = path
  }
}
