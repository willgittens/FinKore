// SPDX-License-Identifier: MPL-2.0
import type { LoadedVector } from './types/vector.js'

export interface RunFilters {
  readonly suites?: readonly string[]
  readonly tags?: readonly string[]
  readonly vectorIds?: readonly string[]
}

function matchesOne(value: string, selected: readonly string[] | undefined): boolean {
  return selected === undefined || selected.length === 0 || selected.includes(value)
}

export function filterVectors(vectors: readonly LoadedVector[], filters: RunFilters = {}): LoadedVector[] {
  return vectors.filter((vector) =>
    matchesOne(vector.suiteId, filters.suites)
    && (filters.tags === undefined || filters.tags.length === 0 || filters.tags.some((tag) => vector.tags.includes(tag)))
    && matchesOne(vector.id, filters.vectorIds),
  )
}
