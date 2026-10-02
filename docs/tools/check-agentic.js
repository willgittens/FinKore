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
const REGISTRY_ROW = /^\| `(finkore\.[a-z]+(?:\.[a-z]+)+)` \| ([^|]+) \| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \| ([^|]+) \| ([^|]+) \|$/gm
const STATE_MUTATION_VALUES = new Set(['yes', 'no'])
const TRI_STATE_VALUES = new Set(['yes', 'no', 'unspecified'])
const AUDIT_VALUES = new Set(['none', 'may', 'required', 'unspecified'])

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

function descriptorBlocks(text) {
  const headings = [...text.matchAll(DESCRIPTOR_OPERATION)]
  return new Map(headings.map((heading, index) => [
    heading[1],
    text.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? text.length),
  ]))
}

function fieldBody(block, labels) {
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const match = block.match(new RegExp(`^\\*\\*(?:${escaped}):\\*\\*\\s*(?<body>[\\s\\S]*?)(?=^\\*\\*[^*]+:\\*\\*|\\s*$)`, 'm'))
  return match?.groups?.body.trim()
}

function validateDescriptor(operation, block, errors) {
  const fields = [
    [['Purpose'], 'purpose'],
    [['Input', 'Input semantics'], 'input semantics'],
    [['Preconditions'], 'preconditions'],
    [['Success', 'Success postcondition'], 'success/postconditions'],
    [['Known operation-specific error', 'Known operation-specific errors', 'Portable errors', 'Exhaustive portable errors'], 'portable errors and exhaustiveness'],
    [['Normative traceability'], 'normative traceability'],
  ]
  for (const [labels, description] of fields) {
    const body = fieldBody(block, labels)
    if (body === undefined || body.length === 0) errors.push(`Agentic descriptor ${operation} lacks non-empty ${description}`)
  }
  const traceability = fieldBody(block, ['Normative traceability']) ?? ''
  if (!REQUIREMENT_ID.test(traceability)) errors.push(`Agentic descriptor ${operation} has no normative requirement reference`)
  REQUIREMENT_ID.lastIndex = 0
}

function validateRegistryRows(text, registryOperations, errors) {
  const rows = new Map()
  for (const match of text.matchAll(REGISTRY_ROW)) {
    const [operation, domain, stateMutation, financialMutation, deterministic, auditProduction, approvalRelation, requirements] = match.slice(1).map((value) => value.trim())
    rows.set(operation, { domain, stateMutation, financialMutation, deterministic, auditProduction, approvalRelation, requirements })
    if (domain.length === 0) errors.push(`Agentic registry operation has no domain: ${operation}`)
    if (!STATE_MUTATION_VALUES.has(stateMutation)) errors.push(`Agentic registry operation ${operation} has invalid State mutation value: ${stateMutation}`)
    if (!TRI_STATE_VALUES.has(financialMutation)) errors.push(`Agentic registry operation ${operation} has invalid Financial-state mutation value: ${financialMutation}`)
    if (!TRI_STATE_VALUES.has(deterministic)) errors.push(`Agentic registry operation ${operation} has invalid Determinism value: ${deterministic}`)
    if (!AUDIT_VALUES.has(auditProduction)) errors.push(`Agentic registry operation ${operation} has invalid Audit production value: ${auditProduction}`)
    if (approvalRelation.length === 0) errors.push(`Agentic registry operation has no Approval relation: ${operation}`)
    if (!REQUIREMENT_ID.test(requirements)) errors.push(`Agentic registry operation has no requirement reference: ${operation}`)
    REQUIREMENT_ID.lastIndex = 0
  }
  for (const operation of registryOperations) {
    if (!rows.has(operation)) errors.push(`Agentic registry row has unsupported structure: ${operation}`)
  }
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
  const descriptors = descriptorBlocks(operationsText)

  validateRegistryRows(operationsText, registryOperations, errors)

  for (const operation of registryOperations) {
    if (!descriptorOperations.has(operation)) errors.push(`Agentic registry operation lacks a descriptor: ${operation}`)
  }
  for (const operation of descriptorOperations) {
    if (!registryOperations.has(operation)) errors.push(`Agentic descriptor is absent from the registry: ${operation}`)
    validateDescriptor(operation, descriptors.get(operation) ?? '', errors)
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

export function runAgenticCli(repositoryRoot = process.cwd(), output = console) {
  try {
    const result = validateAgenticConsistency(repositoryRoot)
    output.log(`Agentic consistency passed: ${result.operationCount} canonical operations, ${result.requirementReferenceCount} requirement references, ${result.portableErrorReferenceCount} portable errors.`)
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : String(error))
    return 1
  }
}

if (isDirectExecution()) {
  process.exitCode = runAgenticCli()
}
