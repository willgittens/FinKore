// SPDX-License-Identifier: MPL-2.0
/**
 * Validates specification, vector, Agentic, and traceability requirement metadata.
 *
 * This developer tool reads repository metadata without changing it and does
 * not define financial behavior.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

const root = process.cwd()
const errors = []

function filesUnder(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return filesUnder(path, extension)
    return extname(entry.name) === extension ? [path] : []
  })
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function collectSpecificationRequirements() {
  const requirements = new Map()
  for (const file of filesUnder(resolve(root, 'spec'), '.md')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*\s*[—-]/g)) {
      const id = match[1]
      if (requirements.has(id)) errors.push(`${id} is defined by both ${requirements.get(id)} and ${file}`)
      requirements.set(id, file)
    }
  }
  return requirements
}

function collectVectors() {
  const manifest = readJson(resolve(root, 'conformance/manifest.json'))
  const vectors = new Map()
  const requirements = new Map()
  const operations = new Map()

  for (const suite of manifest.suites) {
    for (const relativePath of suite.vectorFiles) {
      const file = resolve(root, 'conformance', relativePath)
      for (const vector of readJson(file).vectors) {
        if (vectors.has(vector.id)) errors.push(`duplicate vector ID ${vector.id} in ${file}`)
        vectors.set(vector.id, { file, requirements: new Set(vector.requirements) })
        const specificationTopic = vector.spec === 'shared/conventions' ? 'conventions' : vector.spec
        const specificationPath = resolve(root, 'spec', `${specificationTopic}.md`)
        if (!existsSync(specificationPath)) errors.push(`${vector.id} references missing specification topic ${vector.spec}`)
        const operationVectors = operations.get(vector.operation) ?? []
        operationVectors.push(vector.id)
        operations.set(vector.operation, operationVectors)
        for (const requirement of vector.requirements) {
          const references = requirements.get(requirement) ?? []
          references.push(vector.id)
          requirements.set(requirement, references)
        }
      }
    }
  }
  return { vectors, requirements, operations }
}

function collectConformanceOperations() {
  const text = readFileSync(resolve(root, 'conformance/conventions.md'), 'utf8')
  const catalog = text.match(/## Semantic operation catalog\n(?<body>[\s\S]*?)(?=\n## )/)?.groups?.body
  if (catalog === undefined) {
    errors.push('conformance/conventions.md contains no Semantic operation catalog section')
    return new Set()
  }
  const operations = new Set()
  for (const line of catalog.split('\n').filter((candidate) => candidate.startsWith('| `'))) {
    for (const match of line.matchAll(/`([a-z]+(?:\.[a-z]+)+)`/g)) {
      if (operations.has(match[1])) errors.push(`duplicate conformance operation: ${match[1]}`)
      operations.add(match[1])
    }
  }
  if (operations.size === 0) errors.push('conformance/conventions.md contains no semantic operation catalog')
  return operations
}

function collectTraceabilityRows() {
  const text = readFileSync(resolve(root, 'conformance/traceability.md'), 'utf8')
  const mapping = text.match(/## Requirement mapping\n(?<body>[\s\S]*?)(?=\n## )/)?.groups?.body
  if (mapping === undefined) throw new Error('conformance/traceability.md has no Requirement mapping section')
  const rows = new Map()
  for (const line of mapping.split('\n')) {
    const match = line.match(/^\| ([A-Z][A-Z0-9-]+-\d{3}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/)
    if (match === null) continue
    const [, id, domain, modality, coverage, evidence] = match
    if (rows.has(id)) errors.push(`duplicate traceability row ${id}`)
    rows.set(id, {
      domain: domain.trim(),
      modality: modality.trim(),
      coverage: coverage.trim(),
      evidence: evidence.trim(),
    })
  }
  return { rows, text }
}

function checkAgenticReferences(specificationRequirements) {
  for (const file of filesUnder(resolve(root, 'agentic'), '.md')) {
    for (const [lineIndex, line] of readFileSync(file, 'utf8').split('\n').entries()) {
      let prefix
      const token = /([A-Z][A-Z0-9-]+)-(\d{3})|-(\d{3})/g
      for (const match of line.matchAll(token)) {
        let id
        if (match[1] !== undefined) {
          prefix = match[1]
          id = `${prefix}-${match[2]}`
        } else if (prefix !== undefined) {
          id = `${prefix}-${match[3]}`
        }
        if (id !== undefined && !specificationRequirements.has(id)) {
          errors.push(`${file}:${lineIndex + 1} references unknown requirement ${id}`)
        }
      }
    }
  }
}

function checkInventorySummary(text, rows, vectorCount) {
  const totalLine = text.split('\n').find((line) => line.startsWith('| **Total** |'))
  const cells = totalLine?.split('|').slice(1, -1).map((cell) => cell.replaceAll('*', '').trim())
  const statusCounts = new Map()
  for (const row of rows.values()) statusCounts.set(row.coverage, (statusCounts.get(row.coverage) ?? 0) + 1)
  if (cells === undefined || Number(cells[1]) !== rows.size) {
    errors.push(`inventory total must equal ${rows.size}`)
  } else {
    const expectedColumns = [
      ['COVERED', 5],
      ['PARTIAL', 6],
      ['UNCOVERED', 7],
      ['NOT DIRECTLY TESTABLE', 8],
      ['DEFERRED', 9],
      ['BLOCKING SPEC GAP', 10],
    ]
    for (const [status, column] of expectedColumns) {
      if (Number(cells[column]) !== (statusCounts.get(status) ?? 0)) {
        errors.push(`inventory ${status} total must equal ${statusCounts.get(status) ?? 0}`)
      }
    }
  }
  const statedVectorCount = Number(text.match(/suite contains (\d+) vectors/)?.[1])
  if (statedVectorCount !== vectorCount) errors.push(`inventory vector total must equal ${vectorCount}`)
}

const specificationRequirements = collectSpecificationRequirements()
const { vectors, requirements: vectorRequirements, operations: vectorOperations } = collectVectors()
const conformanceOperations = collectConformanceOperations()
const { rows, text: traceabilityText } = collectTraceabilityRows()

for (const id of specificationRequirements.keys()) {
  if (!rows.has(id)) errors.push(`specification requirement ${id} is missing from traceability`)
}
for (const id of rows.keys()) {
  if (!specificationRequirements.has(id)) errors.push(`traceability references unknown requirement ${id}`)
}
for (const [id, vectorIds] of vectorRequirements) {
  if (!specificationRequirements.has(id)) {
    errors.push(`vectors ${vectorIds.join(', ')} reference unknown requirement ${id}`)
  }
}
for (const [operation, vectorIds] of vectorOperations) {
  if (!conformanceOperations.has(operation)) {
    errors.push(`vectors ${vectorIds.join(', ')} reference operation absent from the conformance catalog: ${operation}`)
  }
}
for (const operation of conformanceOperations) {
  if (!vectorOperations.has(operation)) errors.push(`conformance operation has no manifest-listed vector: ${operation}`)
}

for (const [id, row] of rows) {
  const actualVectors = [...(vectorRequirements.get(id) ?? [])].sort()
  if (row.coverage === 'COVERED') {
    const listedVectors = row.evidence.split(/,\s*/).filter((value) => value !== '—').sort()
    if (listedVectors.length === 0) errors.push(`COVERED row ${id} has no vector reference`)
    for (const vectorId of listedVectors) {
      if (!vectors.has(vectorId)) errors.push(`${id} references unknown vector ${vectorId}`)
      else if (!vectors.get(vectorId).requirements.has(id)) {
        errors.push(`${id} references ${vectorId}, but that vector does not declare ${id}`)
      }
    }
    if (listedVectors.join('\n') !== actualVectors.join('\n')) {
      errors.push(`${id} vector index differs from manifest metadata`)
    }
  } else if (row.coverage === 'NOT DIRECTLY TESTABLE') {
    if (row.evidence === '—' || row.evidence.length < 12) errors.push(`${id} needs a written classification rationale`)
    if (actualVectors.length > 0) errors.push(`${id} has vectors but is classified NOT DIRECTLY TESTABLE`)
  }
}

checkAgenticReferences(specificationRequirements)
checkInventorySummary(traceabilityText, rows, vectors.size)

if (errors.length > 0) {
  console.error(`Traceability check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  process.exitCode = 1
} else {
  const covered = [...rows.values()].filter((row) => row.coverage === 'COVERED').length
  console.log(`Traceability check passed: ${rows.size} requirements, ${vectors.size} vectors, ${vectorOperations.size} operations, ${covered} covered.`)
}
