// SPDX-License-Identifier: MPL-2.0
/**
 * Validates the published conformance manifest and vector files as data.
 *
 * This developer tool reads repository artifacts without changing them. It
 * validates syntax, declared paths, the published JSON Schema, and globally
 * unique vector identifiers. It does not define or execute financial behavior.
 */
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const SUITE_ID = /^[a-z][a-z0-9-]*$/

export class ArtifactValidationError extends Error {
  constructor(message, path, cause) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'ArtifactValidationError'
    this.path = path
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new ArtifactValidationError(`Cannot read valid JSON for ${label}: ${path}`, path, error)
  }
}

export function validateManifest(value, source = 'manifest') {
  if (!isRecord(value)) throw new ArtifactValidationError('Manifest must be an object', source)
  if (value.finkoreConformance !== '0.1') {
    throw new ArtifactValidationError('Unsupported or missing finkoreConformance version', source)
  }
  if (typeof value.vectorSchema !== 'string' || value.vectorSchema.length === 0) {
    throw new ArtifactValidationError('Manifest vectorSchema must be a non-empty path', source)
  }
  if (!Array.isArray(value.suites) || value.suites.length === 0) {
    throw new ArtifactValidationError('Manifest suites must be a non-empty array', source)
  }

  const suiteIds = new Set()
  const suites = value.suites.map((candidate, index) => {
    if (!isRecord(candidate)) {
      throw new ArtifactValidationError(`Suite at index ${index} must be an object`, source)
    }
    const { id, vectorFiles } = candidate
    if (typeof id !== 'string' || !SUITE_ID.test(id)) {
      throw new ArtifactValidationError(`Suite at index ${index} has an invalid id`, source)
    }
    if (suiteIds.has(id)) throw new ArtifactValidationError(`Duplicate suite id: ${id}`, source)
    suiteIds.add(id)
    if (!Array.isArray(vectorFiles) || vectorFiles.length === 0 ||
        vectorFiles.some((file) => typeof file !== 'string' || file.length === 0)) {
      throw new ArtifactValidationError(`Suite ${id} must declare non-empty vectorFiles`, source)
    }
    if (new Set(vectorFiles).size !== vectorFiles.length) {
      throw new ArtifactValidationError(`Suite ${id} declares duplicate vector files`, source)
    }
    return { id, vectorFiles }
  })

  return { finkoreConformance: '0.1', vectorSchema: value.vectorSchema, suites }
}

function resolveWithin(root, declaredPath, label) {
  const resolved = resolve(root, declaredPath)
  const relation = relative(root, resolved)
  if (relation === '..' || relation.startsWith(`..${sep}`) || relation === '') {
    throw new ArtifactValidationError(`${label} escapes or resolves to the conformance root: ${declaredPath}`, declaredPath)
  }
  return resolved
}

function schemaFailure(validate, path) {
  const details = (validate.errors ?? [])
    .map((error) => {
      const property = error.keyword === 'additionalProperties'
        ? ` (${String(error.params.additionalProperty)})`
        : ''
      return `${error.instancePath || '/'} ${error.message ?? 'is invalid'}${property}`
    })
    .join('; ')
  return new ArtifactValidationError(`Vector file does not satisfy its declared schema: ${details}`, path)
}

export function validateConformance(manifestPath = 'conformance/manifest.json') {
  const absoluteManifest = resolve(manifestPath)
  const conformanceRoot = dirname(absoluteManifest)
  const manifest = validateManifest(readJson(absoluteManifest, 'manifest'), absoluteManifest)
  const schemaPath = resolveWithin(conformanceRoot, manifest.vectorSchema, 'Vector schema path')
  const schema = readJson(schemaPath, 'vector schema')
  const ajv = new Ajv2020({ allErrors: true, strict: true })

  if (!ajv.validateSchema(schema)) {
    const details = (ajv.errors ?? []).map((error) => error.message).join('; ')
    throw new ArtifactValidationError(`Declared vector schema is invalid: ${details}`, schemaPath)
  }

  let validate
  try {
    validate = ajv.compile(schema)
  } catch (error) {
    throw new ArtifactValidationError('Declared vector schema cannot be compiled', schemaPath, error)
  }

  const vectorIds = new Set()
  let vectorCount = 0
  let vectorFileCount = 0
  for (const suite of manifest.suites) {
    for (const declaredPath of suite.vectorFiles) {
      const vectorPath = resolveWithin(conformanceRoot, declaredPath, `Vector path for suite ${suite.id}`)
      const vectorFile = readJson(vectorPath, `vector file in suite ${suite.id}`)
      if (!validate(vectorFile)) throw schemaFailure(validate, vectorPath)
      vectorFileCount += 1
      for (const vector of vectorFile.vectors) {
        if (vectorIds.has(vector.id)) {
          throw new ArtifactValidationError(`Duplicate vector id: ${vector.id}`, vectorPath)
        }
        vectorIds.add(vector.id)
        vectorCount += 1
      }
    }
  }

  return {
    manifestPath: absoluteManifest,
    suiteCount: manifest.suites.length,
    vectorFileCount,
    vectorCount,
  }
}

function isDirectExecution() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (isDirectExecution()) {
  try {
    const result = validateConformance(process.argv[2])
    console.log(`Conformance artifacts passed: ${result.suiteCount} suites, ${result.vectorFileCount} files, ${result.vectorCount} vectors.`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
