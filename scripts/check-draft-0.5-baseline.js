// SPDX-License-Identifier: MPL-2.0
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const expected = {
  requirements: 381,
  vectorFiles: 16,
  suites: 5,
  manifestVectors: 244,
  moneyVectors: 83,
  operationLabels: 35,
  canonicalAgenticOperations: 20,
  conformanceLocalOperationLabels: 15,
  mutationSensitiveVectors: 217,
  portableErrorCodes: 31,
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function markdownFilesUnder(directory) {
  return walk(directory).filter((path) => path.endsWith('.md')).sort()
}

function collectSpecRequirementIds() {
  const ids = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*/g)) {
      ids.add(match[1])
    }
  }
  return ids
}

function collectPortableErrorCodes() {
  const codes = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\bFINKORE_[A-Z0-9_]+\b/g)) {
      codes.add(match[0])
    }
  }
  return codes
}

function collectCanonicalAgenticOperations() {
  const text = readFileSync('agentic/operations.md', 'utf8')
  return new Set([...text.matchAll(/`(finkore\.[a-z.]+)`/g)].map((match) => match[1]))
}

function manifestVectorFiles(manifest) {
  return manifest.suites.flatMap((suite) => suite.vectorFiles.map((file) => join('conformance', file.replace(/^\.\//, ''))))
}

function loadVectors(files) {
  return files.flatMap((file) => {
    const vectorFile = JSON.parse(readFileSync(file, 'utf8'))
    return vectorFile.vectors.map((vector) => ({ ...vector, file }))
  })
}

const manifest = JSON.parse(readFileSync('conformance/manifest.json', 'utf8'))
const vectorFiles = manifestVectorFiles(manifest)
const vectors = loadVectors(vectorFiles)
const operationLabels = new Set(vectors.map((vector) => vector.operation))
const canonicalAgenticOperations = collectCanonicalAgenticOperations()
const conformanceLocalOperationLabels = new Set(
  [...operationLabels].filter((operation) => !canonicalAgenticOperations.has(operation)),
)

const actual = {
  requirements: collectSpecRequirementIds().size,
  vectorFiles: vectorFiles.length,
  suites: manifest.suites.length,
  manifestVectors: vectors.length,
  moneyVectors: vectors.filter((vector) => vector.file.includes('/money/')).length,
  operationLabels: operationLabels.size,
  canonicalAgenticOperations: canonicalAgenticOperations.size,
  conformanceLocalOperationLabels: conformanceLocalOperationLabels.size,
  mutationSensitiveVectors: vectors.filter((vector) => vector.tags?.includes('mutation-sensitive')).length,
  portableErrorCodes: collectPortableErrorCodes().size,
}

const failures = Object.entries(expected)
  .filter(([key, value]) => actual[key] !== value)
  .map(([key, value]) => `${key}: expected ${value}, found ${actual[key]}`)

if (failures.length > 0) {
  console.error('Draft 0.5 baseline validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Draft 0.5 baseline validation passed.')
console.log(JSON.stringify(actual, null, 2))
