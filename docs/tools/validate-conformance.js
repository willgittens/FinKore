// SPDX-License-Identifier: MPL-2.0
/**
 * Validates the published conformance manifest and vector files as data.
 *
 * This developer tool reads repository artifacts without changing them. It
 * validates syntax, declared paths, the published JSON Schema, globally unique
 * vector identifiers, and documented error associations. It does not define or
 * execute financial behavior.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const SUITE_ID = /^[a-z][a-z0-9-]*$/
const PORTABLE_ERROR = /^FINKORE_[A-Z]+(?:_[A-Z]+)+$/
const OPERATION = /^[a-z]+(?:\.[a-z]+)+$/

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

function collectPortableErrors(repositoryRoot) {
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
  const codes = new Map()
  for (const line of section.split('\n')) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*`(FINKORE_[A-Z0-9_]+)`\s*\|/)
    if (match === null) continue
    const [, catalog, code] = match
    if (!PORTABLE_ERROR.test(code)) {
      throw new ArtifactValidationError(`Malformed portable error declaration: ${code}`, conventionsPath)
    }
    if (codes.has(code)) {
      throw new ArtifactValidationError(`Duplicate portable error declaration: ${code}`, conventionsPath)
    }
    codes.set(code, catalog.trim())
  }
  if (codes.size === 0) throw new ArtifactValidationError('Portable error catalog declares no codes', conventionsPath)
  return codes
}

function collectOperationErrorAssociations(repositoryRoot, portableErrors) {
  const path = join(repositoryRoot, 'conformance', 'operations.md')
  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch (error) {
    throw new ArtifactValidationError(`Cannot read operation error associations: ${path}`, path, error)
  }
  const section = text.match(/(?:^|\n)## Error association checks\n(?<body>[\s\S]*?)(?=\n## |$)/)?.groups?.body
  if (section === undefined) throw new ArtifactValidationError('Operation contracts contain no Error association checks section', path)
  const catalogs = new Set(portableErrors.values())
  const associations = new Map()
  function tokens(cell, label, pattern) {
    const values = [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1])
    if (values.length === 0 || cell.replace(/`[^`]+`/g, '').replace(/[,\s]/g, '') !== '' ||
        new Set(values).size !== values.length || (pattern !== undefined && values.some((value) => !pattern.test(value)))) {
      throw new ArtifactValidationError(`Invalid ${label} in operation error associations: ${cell}`, path)
    }
    return values
  }
  for (const line of section.split('\n').filter((line) => line.startsWith('|'))) {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells[0] === 'Operation labels' || cells.every((cell) => /^-+$/.test(cell))) continue
    if (!line.endsWith('|') || cells.length !== 4 || cells[3].length === 0) {
      throw new ArtifactValidationError(`Malformed operation error association row: ${line}`, path)
    }
    const operations = tokens(cells[0], 'operation labels', OPERATION)
    const allowedCatalogs = new Set(tokens(cells[1], 'permitted catalogs'))
    const excludedErrors = new Set(cells[2] === 'none' ? [] : tokens(cells[2], 'excluded errors', PORTABLE_ERROR))
    for (const catalog of allowedCatalogs) {
      if (!catalogs.has(catalog)) throw new ArtifactValidationError(`Operation error association references unknown catalog: ${catalog}`, path)
    }
    for (const code of excludedErrors) {
      if (!portableErrors.has(code)) throw new ArtifactValidationError(`Operation error association excludes undeclared portable error: ${code}`, path)
      if (!allowedCatalogs.has(portableErrors.get(code))) throw new ArtifactValidationError(`Excluded error is outside permitted catalogs: ${code}`, path)
    }
    for (const operation of operations) {
      if (associations.has(operation)) throw new ArtifactValidationError(`Duplicate operation error association: ${operation}`, path)
      associations.set(operation, { allowedCatalogs, excludedErrors })
    }
  }
  if (associations.size === 0) throw new ArtifactValidationError('Operation contracts contain no operation error associations', path)
  const operations = new Set([...text.replace(section, '').matchAll(/^\| `([a-z]+(?:\.[a-z]+)+)` \|/gm)].map((match) => match[1]))
  for (const operation of associations.keys()) {
    if (!operations.has(operation)) throw new ArtifactValidationError(`Error association references operation absent from operation contracts: ${operation}`, path)
  }
  for (const operation of operations) {
    if (!associations.has(operation)) throw new ArtifactValidationError(`Operation contract lacks error association: ${operation}`, path)
  }
  return associations
}

function validateExpectedError(candidate, label, portableErrors, associations, path) {
  const code = candidate?.expected?.error?.code
  if (code !== undefined && !portableErrors.has(code)) {
    throw new ArtifactValidationError(`${label} references undeclared portable error: ${code}`, path)
  }
  const association = associations.get(candidate.operation)
  if (association === undefined) {
    throw new ArtifactValidationError(`${label} has no documented error association for operation: ${candidate.operation}`, path)
  }
  if (code !== undefined && (!association.allowedCatalogs.has(portableErrors.get(code)) || association.excludedErrors.has(code))) {
    throw new ArtifactValidationError(`${label} references portable error ${code} not associated with operation ${candidate.operation}`, path)
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

  const portableErrors = collectPortableErrors(resolvedRepositoryRoot)
  const associations = collectOperationErrorAssociations(resolvedRepositoryRoot, portableErrors)
  for (const { vector, path } of vectors) {
    validateExpectedError(vector, `Vector ${vector.id}`, portableErrors, associations, path)
    if (vector.pairedControl !== undefined && !vectorIds.has(vector.pairedControl)) {
      throw new ArtifactValidationError(`Vector ${vector.id} references unknown pairedControl: ${vector.pairedControl}`, path)
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
