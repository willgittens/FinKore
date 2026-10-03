// SPDX-License-Identifier: MPL-2.0
/**
 * Validates specification, vector, Agentic, and traceability requirement metadata.
 *
 * This developer tool reads repository metadata without changing it and does
 * not define financial behavior.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

let root = process.cwd()
let errors = []
const COVERAGE_VALUES = new Set([
  'COVERED',
  'PARTIAL',
  'UNCOVERED',
  'NOT DIRECTLY TESTABLE',
  'DEFERRED',
  'BLOCKING SPEC GAP',
])
const MODALITY_VALUES = new Set(['MUST / MUST NOT', 'SHOULD / SHOULD NOT', 'MAY'])
const DOMAIN_NAMES = new Map([
  ['money', 'Money'],
  ['workflow', 'Workflow'],
  ['audit', 'Audit'],
  ['approvals', 'Approvals'],
  ['entities', 'Entities'],
])

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

function requirementModality(body, id, file) {
  if (/\bMUST(?: NOT)?\b/.test(body)) return 'MUST / MUST NOT'
  if (/\bSHOULD(?: NOT)?\b/.test(body)) return 'SHOULD / SHOULD NOT'
  if (/\bMAY\b/.test(body)) return 'MAY'
  errors.push(`${id} in ${file} has no recognized uppercase normative keyword`)
  return undefined
}

function requirementDomain(file) {
  const first = relative(resolve(root, 'spec'), file).split(sep)[0]
  return first.endsWith('.md') ? 'Shared' : DOMAIN_NAMES.get(first)
}

function collectSpecificationRequirements() {
  const requirements = new Map()
  for (const file of filesUnder(resolve(root, 'spec'), '.md')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/^\s*-\s+\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*\s*[—-]\s*(.*)$/gm)) {
      const id = match[1]
      if (requirements.has(id)) errors.push(`${id} is defined by both ${requirements.get(id).file} and ${file}`)
      const domain = requirementDomain(file)
      if (domain === undefined) errors.push(`${id} is defined in an unknown specification domain: ${file}`)
      requirements.set(id, {
        file,
        domain,
        modality: requirementModality(match[2], id, file),
      })
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

function checkCaseApplicabilityReferences(vectors) {
  const file = resolve(root, 'conformance/consumer-guide.md')
  const text = readFileSync(file, 'utf8')
  const section = text.match(/## Case applicability\n(?<body>[\s\S]*?)(?=\n## )/)?.groups?.body
  if (section === undefined) {
    errors.push('conformance/consumer-guide.md contains no Case applicability section')
    return
  }
  const references = new Set()
  for (const line of section.split('\n')) {
    const id = line.match(/^\| `([a-z][a-z0-9]*(?:[.-][a-z0-9]+)+-\d{3})` \|/)?.[1]
    if (id === undefined) continue
    if (references.has(id)) errors.push(`duplicate case-applicability vector ${id}`)
    references.add(id)
    if (!vectors.has(id)) errors.push(`case applicability references unknown vector ${id}`)
  }
  if (references.size === 0) errors.push('Case applicability contains no vector references')
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
    if (!MODALITY_VALUES.has(modality.trim())) errors.push(`${id} has unsupported modality ${modality.trim()}`)
    if (!COVERAGE_VALUES.has(coverage.trim())) errors.push(`${id} has unsupported coverage classification ${coverage.trim()}`)
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

function countsFor(rows) {
  const counts = {
    requirements: rows.length,
    must: 0,
    should: 0,
    may: 0,
    covered: 0,
    partial: 0,
    uncovered: 0,
    notDirectlyTestable: 0,
    deferred: 0,
    blocking: 0,
  }
  for (const row of rows) {
    if (row.modality === 'MUST / MUST NOT') counts.must += 1
    if (row.modality === 'SHOULD / SHOULD NOT') counts.should += 1
    if (row.modality === 'MAY') counts.may += 1
    if (row.coverage === 'COVERED') counts.covered += 1
    if (row.coverage === 'PARTIAL') counts.partial += 1
    if (row.coverage === 'UNCOVERED') counts.uncovered += 1
    if (row.coverage === 'NOT DIRECTLY TESTABLE') counts.notDirectlyTestable += 1
    if (row.coverage === 'DEFERRED') counts.deferred += 1
    if (row.coverage === 'BLOCKING SPEC GAP') counts.blocking += 1
  }
  return counts
}

function checkInventorySummary(text, rows, vectorCount) {
  const inventory = text.match(/## Inventory and coverage\n(?<body>[\s\S]*?)(?=\n## )/)?.groups?.body
  if (inventory === undefined) {
    errors.push('traceability contains no Inventory and coverage section')
    return
  }
  const stated = new Map()
  for (const line of inventory.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.replaceAll('*', '').trim())
    if (cells.length !== 11 || cells[0] === 'Domain' || cells[0] === '---') continue
    stated.set(cells[0], cells.slice(1).map(Number))
  }
  const byDomain = new Map()
  for (const row of rows.values()) {
    const values = byDomain.get(row.domain) ?? []
    values.push(row)
    byDomain.set(row.domain, values)
  }
  const expectedDomains = [...byDomain.keys()].sort()
  const statedDomains = [...stated.keys()].filter((domain) => domain !== 'Total').sort()
  if (expectedDomains.join('\n') !== statedDomains.join('\n')) errors.push('inventory domain rows do not match requirement mapping domains')
  const keys = ['requirements', 'must', 'should', 'may', 'covered', 'partial', 'uncovered', 'notDirectlyTestable', 'deferred', 'blocking']
  for (const [domain, domainRows] of byDomain) {
    const expected = countsFor(domainRows)
    const actual = stated.get(domain)
    if (actual === undefined) continue
    keys.forEach((key, index) => {
      if (actual[index] !== expected[key]) errors.push(`inventory ${domain} ${key} total must equal ${expected[key]}`)
    })
  }
  const expectedTotal = countsFor([...rows.values()])
  const actualTotal = stated.get('Total')
  if (actualTotal === undefined) errors.push('inventory has no Total row')
  else keys.forEach((key, index) => {
    if (actualTotal[index] !== expectedTotal[key]) errors.push(`inventory Total ${key} must equal ${expectedTotal[key]}`)
  })
  const statedVectorCount = Number(text.match(/suite contains (\d+) vectors/)?.[1])
  if (statedVectorCount !== vectorCount) errors.push(`inventory vector total must equal ${vectorCount}`)
}

export function validateTraceability(repositoryRoot = process.cwd()) {
  root = resolve(repositoryRoot)
  errors = []
  const specificationRequirements = collectSpecificationRequirements()
  const { vectors, requirements: vectorRequirements, operations: vectorOperations } = collectVectors()
  const conformanceOperations = collectConformanceOperations()
  const { rows, text: traceabilityText } = collectTraceabilityRows()

  checkCaseApplicabilityReferences(vectors)

  for (const id of specificationRequirements.keys()) {
    if (!rows.has(id)) errors.push(`specification requirement ${id} is missing from traceability`)
  }
  for (const id of rows.keys()) {
    if (!specificationRequirements.has(id)) errors.push(`traceability references unknown requirement ${id}`)
  }
  for (const [id, requirement] of specificationRequirements) {
    const row = rows.get(id)
    if (row === undefined) continue
    if (row.domain !== requirement.domain) errors.push(`${id} domain ${row.domain} differs from specification domain ${requirement.domain}`)
    if (row.modality !== requirement.modality) errors.push(`${id} modality ${row.modality} differs from specification modality ${requirement.modality}`)
  }
  for (const [id, vectorIds] of vectorRequirements) {
    if (!specificationRequirements.has(id)) errors.push(`vectors ${vectorIds.join(', ')} reference unknown requirement ${id}`)
  }
  for (const [operation, vectorIds] of vectorOperations) {
    if (!conformanceOperations.has(operation)) errors.push(`vectors ${vectorIds.join(', ')} reference operation absent from the conformance catalog: ${operation}`)
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
        else if (!vectors.get(vectorId).requirements.has(id)) errors.push(`${id} references ${vectorId}, but that vector does not declare ${id}`)
      }
      if (listedVectors.join('\n') !== actualVectors.join('\n')) errors.push(`${id} vector index differs from manifest metadata`)
    } else if (row.coverage === 'PARTIAL') {
      const listedVectors = [...row.evidence.matchAll(/\b[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+-\d{3}\b/g)].map((match) => match[0]).sort()
      for (const vectorId of listedVectors) {
        if (!vectors.has(vectorId)) errors.push(`${id} references unknown vector ${vectorId}`)
        else if (!vectors.get(vectorId).requirements.has(id)) errors.push(`${id} references ${vectorId}, but that vector does not declare ${id}`)
      }
      if (actualVectors.length > 0 && listedVectors.join('\n') !== actualVectors.join('\n')) errors.push(`${id} PARTIAL vector index differs from manifest metadata`)
      if (actualVectors.length === 0 && row.evidence.length < 12) errors.push(`${id} needs a written PARTIAL rationale`)
    } else if (row.coverage === 'NOT DIRECTLY TESTABLE') {
      if (row.evidence === '—' || row.evidence.length < 12) errors.push(`${id} needs a written classification rationale`)
      if (actualVectors.length > 0) errors.push(`${id} has vectors but is classified NOT DIRECTLY TESTABLE`)
    } else {
      if (row.evidence === '—' || row.evidence.length < 12) errors.push(`${id} needs a written ${row.coverage} rationale`)
      if (actualVectors.length > 0) errors.push(`${id} has vectors but is classified ${row.coverage}`)
    }
  }

  checkAgenticReferences(specificationRequirements)
  checkInventorySummary(traceabilityText, rows, vectors.size)
  if (errors.length > 0) throw new Error(`Traceability check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  const covered = [...rows.values()].filter((row) => row.coverage === 'COVERED').length
  return { requirementCount: rows.size, vectorCount: vectors.size, operationCount: vectorOperations.size, coveredCount: covered }
}

export function runTraceabilityCli(repositoryRoot = process.cwd(), output = console) {
  try {
    const result = validateTraceability(repositoryRoot)
    output.log(`Traceability check passed: ${result.requirementCount} requirements, ${result.vectorCount} vectors, ${result.operationCount} operations, ${result.coveredCount} covered.`)
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : String(error))
    return 1
  }
}

function isDirectExecution() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (isDirectExecution()) {
  process.exitCode = runTraceabilityCli()
}
