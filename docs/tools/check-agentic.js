// SPDX-License-Identifier: MPL-2.0
/**
 * Validates stable identifiers shared by the specification, vectors, and Agentic Contract.
 *
 * This developer tool reads repository artifacts without changing them. It
 * checks metadata consistency only and does not define or execute financial
 * behavior.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const REQUIREMENT_ID = /\b[A-Z][A-Z0-9-]+-[0-9]{3}\b/g
const ERROR_CODE = /\bFINKORE_[A-Z0-9_]+\b/g
const REGISTRY_OPERATION = /^\| `(finkore\.[a-z]+(?:\.[a-z]+)+)` \|/gm
const DESCRIPTOR_OPERATION = /^## `(finkore\.[a-z]+(?:\.[a-z]+)+)`$/gm

function filesUnder(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory()
      ? filesUnder(path, extension)
      : extname(entry.name) === extension ? [path] : []
  })
}

function matches(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1] ?? match[0])
}

function unique(values, label, errors) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) errors.push(`duplicate ${label}: ${value}`)
    seen.add(value)
  }
  return seen
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function validateAgenticConsistency(repositoryRoot = process.cwd()) {
  const root = resolve(repositoryRoot)
  const errors = []
  const specificationText = filesUnder(join(root, 'spec'), '.md')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')
  const requirementIds = new Set(matches(specificationText, REQUIREMENT_ID))
  const portableErrors = new Set(matches(specificationText, ERROR_CODE))

  const agenticFiles = filesUnder(join(root, 'agentic'), '.md')
  const agenticText = agenticFiles.map((path) => readFileSync(path, 'utf8')).join('\n')
  const operationsPath = join(root, 'agentic', 'operations.md')
  const operationsText = readFileSync(operationsPath, 'utf8')
  const registryOperations = unique(matches(operationsText, REGISTRY_OPERATION), 'Agentic registry operation', errors)
  const descriptorOperations = unique(matches(operationsText, DESCRIPTOR_OPERATION), 'Agentic descriptor operation', errors)

  for (const operation of registryOperations) {
    if (!descriptorOperations.has(operation)) errors.push(`Agentic registry operation lacks a descriptor: ${operation}`)
  }
  for (const operation of descriptorOperations) {
    if (!registryOperations.has(operation)) errors.push(`Agentic descriptor is absent from the registry: ${operation}`)
  }
  for (const requirement of new Set(matches(agenticText, REQUIREMENT_ID))) {
    if (!requirementIds.has(requirement)) errors.push(`Agentic Contract references unknown requirement: ${requirement}`)
  }
  for (const errorCode of new Set(matches(agenticText, ERROR_CODE))) {
    if (!portableErrors.has(errorCode)) errors.push(`Agentic Contract references unknown portable error: ${errorCode}`)
  }

  const manifest = readJson(join(root, 'conformance', 'manifest.json'))
  const vectorOperations = new Set()
  for (const suite of manifest.suites) {
    for (const declaredPath of suite.vectorFiles) {
      const vectorFile = readJson(resolve(root, 'conformance', declaredPath))
      for (const vector of vectorFile.vectors) vectorOperations.add(vector.operation)
    }
  }
  const canonicalVectorOperations = new Set([...vectorOperations].filter((operation) => operation.startsWith('finkore.')))
  for (const operation of canonicalVectorOperations) {
    if (!registryOperations.has(operation)) errors.push(`Canonical vector operation is absent from Agentic registry: ${operation}`)
  }
  for (const operation of registryOperations) {
    if (!canonicalVectorOperations.has(operation)) errors.push(`Agentic registry operation has no manifest-listed vector: ${operation}`)
  }

  if (errors.length > 0) throw new Error(`Agentic consistency check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  return {
    operationCount: registryOperations.size,
    requirementReferenceCount: new Set(matches(agenticText, REQUIREMENT_ID)).size,
    portableErrorReferenceCount: new Set(matches(agenticText, ERROR_CODE)).size,
  }
}

function isDirectExecution() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (isDirectExecution()) {
  try {
    const result = validateAgenticConsistency()
    console.log(`Agentic consistency passed: ${result.operationCount} canonical operations, ${result.requirementReferenceCount} requirement references, ${result.portableErrorReferenceCount} portable errors.`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
