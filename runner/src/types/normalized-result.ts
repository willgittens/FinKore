// SPDX-License-Identifier: MPL-2.0
export type NormalizedSuccess = {
  readonly status: 'success'
  readonly value: unknown
  readonly observations?: Readonly<Record<string, unknown>>
}

export type NormalizedError = {
  readonly status: 'error'
  readonly error: {
    readonly code: string
    readonly details?: unknown
  }
  readonly observations?: Readonly<Record<string, unknown>>
}

export type NormalizedResult = NormalizedSuccess | NormalizedError
