// SPDX-License-Identifier: MPL-2.0
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const expected = {
  requirements: 381,
  vectorFiles: 16,
  suites: 5,
  manifestVectors: 254,
  moneyVectors: 93,
  operationLabels: 35,
  canonicalAgenticOperations: 20,
  conformanceLocalOperationLabels: 15,
  mutationSensitiveVectors: 227,
  portableErrorCodes: 31,
}

const expectedVersions = {
  manifestFormat: '0.1',
  vectorFileFormat: '0.1',
  runner: '0.1.0',
  typescriptCore: '0.1.0',
  typescriptAdapter: '0.1.0',
  pythonCore: '0.1.0',
  javaCore: '0.1.0',
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

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function collectSpecRequirementIds() {
  const ids = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*/g)) ids.add(match[1])
  }
  return ids
}

function collectPortableErrorCodes() {
  const codes = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\bFINKORE_[A-Z0-9_]+\b/g)) codes.add(match[0])
  }
  return codes
}

function collectCanonicalAgenticOperations() {
  const text = readFileSync('agentic/operations.md', 'utf8')
  return new Set([...text.matchAll(/`(finkore\.[a-z.]+)`/g)].map((match) => match[1]))
}

function manifestVectorFiles(manifest) {
  return manifest.suites.flatMap((suite) =>
    suite.vectorFiles.map((file) => join('conformance', file.replace(/^\.\//, ''))),
  )
}

function loadVectors(files) {
  return files.flatMap((file) => {
    const vectorFile = readJson(file)
    return vectorFile.vectors.map((vector) => ({ ...vector, file, format: vectorFile.finkoreVectorFile }))
  })
}

function packageVersion(path) {
  return readJson(path).version
}

function capture(path, pattern, description) {
  const value = readFileSync(path, 'utf8').match(pattern)?.[1]
  if (value === undefined) throw new Error(`Could not read ${description} from ${path}`)
  return value
}

const manifest = readJson('conformance/manifest.json')
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

const formats = new Set(vectors.map((vector) => vector.format))
const actualVersions = {
  manifestFormat: manifest.finkoreConformance,
  vectorFileFormat: formats.size === 1 ? [...formats][0] : [...formats].sort().join(','),
  runner: packageVersion('runner/package.json'),
  typescriptCore: packageVersion('implementations/typescript/core/package.json'),
  typescriptAdapter: packageVersion('implementations/typescript/adapters/conformance/package.json'),
  pythonCore: capture('implementations/python/core/pyproject.toml', /^version\s*=\s*"([^"]+)"/m, 'Python core version'),
  javaCore: capture('implementations/java/core/pom.xml', /<artifactId>finkore-java-core<\/artifactId>\s*<version>([^<]+)<\/version>/m, 'Java core version'),
}

const failures = [
  ...Object.entries(expected)
    .filter(([key, value]) => actual[key] !== value)
    .map(([key, value]) => `${key}: expected ${value}, found ${actual[key]}`),
  ...Object.entries(expectedVersions)
    .filter(([key, value]) => actualVersions[key] !== value)
    .map(([key, value]) => `${key}: expected ${value}, found ${actualVersions[key]}`),
]

if (failures.length > 0) {
  console.error('Draft 0.6 baseline validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Draft 0.6 baseline validation passed.')
console.log(JSON.stringify({ inventory: actual, versions: actualVersions }, null, 2))
