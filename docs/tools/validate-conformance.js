// SPDX-License-Identifier: MPL-2.0
/**
 * Validates the published conformance manifest and vector files as data.
 *
 * This developer tool reads repository artifacts without changing them. It
 * validates syntax, declared paths, the published JSON Schema, and globally
 * unique vector identifiers. It does not define or execute financial behavior.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const SUITE_ID = /^[a-z][a-z0-9-]*$/
const PORTABLE_ERROR = /^FINKORE_[A-Z]+(?:_[A-Z]+)+$/
const SUPPLEMENTARY_CASES = 'boundary097-cases.json'

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

function collectPortableErrorCodes(repositoryRoot) {
  const conventionsPath = join(repositoryRoot, 'spec', 'conventions.md')
  let text
  try {
    text = readFileSync(conventionsPath, 'utf8')
  } catch (error) {
    throw new ArtifactValidationError(`Cannot read the consolidated portable error catalog: ${conventionsPath}`, conventionsPath, error)
  }
  const section = text.match(/## Error Codes\n(?<body>[\s\S]*?)(?=\n## |$)/)?.groups?.body
  if (section === undefined) {
    throw new ArtifactValidationError('Specification conventions contain no Error Codes section', conventionsPath)
  }
  const codes = new Set()
  for (const line of section.split('\n')) {
    const match = line.match(/^\|[^|]*\|\s*`(FINKORE_[A-Z0-9_]+)`\s*\|/)
    if (match === null) continue
    if (!PORTABLE_ERROR.test(match[1])) {
      throw new ArtifactValidationError(`Malformed portable error declaration: ${match[1]}`, conventionsPath)
    }
    if (codes.has(match[1])) {
      throw new ArtifactValidationError(`Duplicate portable error declaration: ${match[1]}`, conventionsPath)
    }
    codes.add(match[1])
  }
  if (codes.size === 0) throw new ArtifactValidationError('Portable error catalog declares no codes', conventionsPath)
  return codes
}

function readSupplementaryCases(conformanceRoot) {
  const path = join(conformanceRoot, SUPPLEMENTARY_CASES)
  if (!existsSync(path)) return { path, cases: [] }
  const value = readJson(path, 'supplementary boundary cases')
  if (!isRecord(value) || !Array.isArray(value.cases)) {
    throw new ArtifactValidationError('Supplementary boundary case file must contain a cases array', path)
  }
  return { path, cases: value.cases }
}

function validateExpectedError(candidate, label, portableErrors, path) {
  const code = candidate?.expected?.error?.code
  if (code !== undefined && !portableErrors.has(code)) {
    throw new ArtifactValidationError(`${label} references undeclared portable error: ${code}`, path)
  }
}

export function validateConformance(manifestPath = 'conformance/manifest.json', repositoryRoot) {
  const absoluteManifest = resolve(manifestPath)
  const conformanceRoot = dirname(absoluteManifest)
  const resolvedRepositoryRoot = resolve(repositoryRoot ?? join(conformanceRoot, '..'))
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
  const vectors = []
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
        vectors.push({ vector, path: vectorPath })
        vectorCount += 1
      }
    }
  }

  const portableErrors = collectPortableErrorCodes(resolvedRepositoryRoot)
  const supplementary = readSupplementaryCases(conformanceRoot)
  const supplementaryIds = new Set()
  for (const [index, candidate] of supplementary.cases.entries()) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || candidate.id.length === 0) {
      throw new ArtifactValidationError(`Supplementary case at index ${index} has no valid id`, supplementary.path)
    }
    if (vectorIds.has(candidate.id) || supplementaryIds.has(candidate.id)) {
      throw new ArtifactValidationError(`Duplicate manifest/supplementary case id: ${candidate.id}`, supplementary.path)
    }
    supplementaryIds.add(candidate.id)
    validateExpectedError(candidate, `Supplementary case ${candidate.id}`, portableErrors, supplementary.path)
  }

  const supportedControlIds = new Set([...vectorIds, ...supplementaryIds])
  for (const { vector, path } of vectors) {
    validateExpectedError(vector, `Vector ${vector.id}`, portableErrors, path)
    if (vector.pairedControl !== undefined && !supportedControlIds.has(vector.pairedControl)) {
      throw new ArtifactValidationError(`Vector ${vector.id} references unknown pairedControl: ${vector.pairedControl}`, path)
    }
  }
  for (const candidate of supplementary.cases) {
    if (candidate.pairedControl !== undefined && !supportedControlIds.has(candidate.pairedControl)) {
      throw new ArtifactValidationError(`Supplementary case ${candidate.id} references unknown pairedControl: ${candidate.pairedControl}`, supplementary.path)
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

export function runConformanceCli(manifestPath, repositoryRoot, output = console) {
  try {
    const result = validateConformance(manifestPath, repositoryRoot)
    output.log(`Conformance artifacts passed: ${result.suiteCount} suites, ${result.vectorFileCount} files, ${result.vectorCount} vectors.`)
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : String(error))
    return 1
  }
}

if (isDirectExecution()) {
  process.exitCode = runConformanceCli(process.argv[2], process.argv[3])
}
