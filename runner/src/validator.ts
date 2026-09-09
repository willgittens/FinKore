// SPDX-License-Identifier: MPL-2.0
import { RunnerInfrastructureError } from './errors/runner-errors.js'
import type { RunnerMetadata } from './metadata.js'
import type { ConformanceVector, ExpectedResult, VectorFile } from './types/vector.js'

const VECTOR_ID = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/
const SPEC_PATH = /^[a-z]+\/[a-z-]+$/
const REQUIREMENT_ID = /^[A-Z]+(?:-[A-Z]+)+-[0-9]{3}$/
const OPERATION_ID = /^[a-z]+(?:\.[a-z]+)+$/
const ERROR_CODE = /^FINKORE_[A-Z]+(?:_[A-Z]+)+$/
const GUARD_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_TAGS = new Set(['positive', 'negative', 'boundary', 'invariant', 'regression', 'mutation-sensitive'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.hasOwn(value, key)
}

function invalid(message: string, source: string): never {
  throw new RunnerInfrastructureError('VECTOR', message, source)
}

function validateUniqueStrings(
  value: unknown,
  field: string,
  source: string,
  predicate: (entry: string) => boolean,
): string[] {
  if (!Array.isArray(value)) invalid(`${field} must be an array`, source)
  if (value.length === 0) invalid(`${field} must be non-empty`, source)
  const strings: string[] = []
  for (const entry of value) {
    if (typeof entry !== 'string') invalid(`${field} entries must be strings`, source)
    if (!predicate(entry)) invalid(`${field} contains invalid string ${entry}`, source)
    strings.push(entry)
  }
  if (new Set(strings).size !== strings.length) invalid(`${field} must not contain duplicates`, source)
  return strings
}

function validateExpected(value: unknown, source: string): ExpectedResult {
  if (!isRecord(value)) invalid('expected must be an object', source)
  const hasValue = hasOwn(value, 'value')
  const hasError = hasOwn(value, 'error')
  if (hasValue && hasError) invalid('expected must not contain both value and error', source)
  if (!hasValue && !hasError) invalid('expected must declare either value or error', source)
  if (value.observations !== undefined && !isRecord(value.observations)) {
    invalid('expected.observations must be an object', source)
  }

  if (value.status === 'success') {
    if (!hasValue) invalid('success expectation must contain value', source)
    const expected: ExpectedResult = value.observations === undefined
      ? { status: 'success', value: value.value }
      : { status: 'success', value: value.value, observations: value.observations }
    return expected
  }
  if (value.status === 'error') {
    if (!hasError) invalid('error expectation must contain error', source)
    if (!isRecord(value.error)) invalid('expected.error must contain a portable error code', source)
    if (typeof value.error.code !== 'string') invalid('expected.error.code must be a portable error code string', source)
    if (!ERROR_CODE.test(value.error.code)) invalid('expected.error.code must be a portable error code', source)
    const error = { code: value.error.code }
    return value.observations === undefined
      ? { status: 'error', error }
      : { status: 'error', error, observations: value.observations }
  }
  return invalid('expected.status must be success or error', source)
}

export function validateVector(value: unknown, metadata: RunnerMetadata, source = 'vector'): ConformanceVector {
  if (!isRecord(value)) invalid('Vector must be an object', source)
  if (typeof value.id !== 'string' || !VECTOR_ID.test(value.id)) invalid('Vector has a missing or invalid id', source)
  if (typeof value.spec !== 'string' || !SPEC_PATH.test(value.spec)) invalid(`Vector ${value.id} has an invalid spec reference`, source)
  if (typeof value.description !== 'string' || value.description.length === 0) invalid(`Vector ${value.id} has an empty description`, source)
  if (!isRecord(value.input)) invalid(`Vector ${value.id} input must be an object`, source)
  if (value.context !== undefined && !isRecord(value.context)) invalid(`Vector ${value.id} context must be an object`, source)

  const requirements = validateUniqueStrings(value.requirements, `Vector ${value.id} requirements`, source, (id) => REQUIREMENT_ID.test(id))
  for (const requirement of requirements) {
    if (!metadata.requirementIds.has(requirement)) invalid(`Vector ${value.id} references unknown requirement ${requirement}`, source)
  }

  if (typeof value.operation !== 'string' || !OPERATION_ID.test(value.operation)) {
    invalid(`Vector ${value.id} has a missing or invalid operation id`, source)
  }
  if (!metadata.operationIds.has(value.operation)) invalid(`Vector ${value.id} references unknown operation ${value.operation}`, source)
  if (value.operation.startsWith('finkore.') && !metadata.agenticOperationIds.has(value.operation)) {
    invalid(`Vector ${value.id} references unregistered Agentic operation ${value.operation}`, source)
  }

  const tags = validateUniqueStrings(value.tags, `Vector ${value.id} tags`, source, (tag) => VALID_TAGS.has(tag))
  const guardsAgainst = value.guardsAgainst === undefined
    ? undefined
    : validateUniqueStrings(value.guardsAgainst, `Vector ${value.id} guardsAgainst`, source, (name) => GUARD_NAME.test(name))
  const expected = validateExpected(value.expected, source)

  return {
    id: value.id,
    spec: value.spec,
    requirements,
    description: value.description,
    operation: value.operation,
    input: value.input,
    ...(value.context === undefined ? {} : { context: value.context }),
    expected,
    tags,
    ...(guardsAgainst === undefined ? {} : { guardsAgainst }),
  }
}

export function validateVectorFile(value: unknown, metadata: RunnerMetadata, source: string): VectorFile {
  if (!isRecord(value)) invalid('Vector file must be an object', source)
  if (value.finkoreVectorFile !== '0.1') invalid('Unsupported or missing finkoreVectorFile version', source)
  if (!Array.isArray(value.vectors) || value.vectors.length === 0) invalid('Vector file must contain a non-empty vectors array', source)
  return {
    finkoreVectorFile: '0.1',
    vectors: value.vectors.map((vector, index) => validateVector(vector, metadata, `${source}#${index}`)),
  }
}

export function assertUniqueVectorIds(vectors: readonly ConformanceVector[], source = 'manifest'): void {
  const seen = new Set<string>()
  for (const vector of vectors) {
    if (seen.has(vector.id)) invalid(`Duplicate vector id: ${vector.id}`, source)
    seen.add(vector.id)
  }
}

export function isNormalizedResult(value: unknown): value is import('./types/normalized-result.js').NormalizedResult {
  if (!isRecord(value)) return false
  if (value.observations !== undefined && !isRecord(value.observations)) return false
  if (value.status === 'success') return hasOwn(value, 'value') && !hasOwn(value, 'error')
  return value.status === 'error'
    && !hasOwn(value, 'value')
    && isRecord(value.error)
    && typeof value.error.code === 'string'
    && ERROR_CODE.test(value.error.code)
}
