// SPDX-License-Identifier: MPL-2.0
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = 'conformance/draft-0.6'
const expectedFormats = {
  finkoreCompatibility: '0.1',
  finkoreProfiles: '0.1',
  finkoreCapabilities: '0.1',
  finkoreChecksums: '0.1',
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
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

function manifestVectorFiles(manifest) {
  return manifest.suites.flatMap((suite) =>
    suite.vectorFiles.map((file) => ({
      file: join('conformance', file.replace(/^\.\//, '')),
      suiteId: suite.id,
    })),
  )
}

function loadVectors(files) {
  return files.flatMap(({ file, suiteId }) => {
    const vectorFile = readJson(file)
    return vectorFile.vectors.map((vector) => ({ ...vector, file, suiteId, format: vectorFile.finkoreVectorFile }))
  })
}

function collectSpecRequirementIds() {
  const ids = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*/g)) ids.add(match[1])
  }
  return ids
}

function collectSpecPaths() {
  return new Set(markdownFilesUnder('spec').map((file) => file.replace(/^spec\//, '').replace(/\.md$/, '')))
}

function collectPortableErrorCodes(paths) {
  const codes = new Set()
  for (const file of paths) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\bFINKORE_[A-Z0-9_]+\b/g)) codes.add(match[0])
  }
  return codes
}

function collectCanonicalAgenticOperations() {
  const text = readFileSync('agentic/operations.md', 'utf8')
  return new Set([...text.matchAll(/`(finkore\.[a-z.]+)`/g)].map((match) => match[1]))
}

function duplicateValues(values) {
  const seen = new Set()
  const duplicates = new Set()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates].sort()
}

function selectedProfileVectors(profile, context) {
  if (profile.selection?.suites !== undefined) {
    return context.vectors.filter((vector) => profile.selection.suites.includes(vector.suiteId))
  }
  if (profile.selection?.operationId !== undefined) {
    return context.vectors.filter((vector) => vector.operation === profile.selection.operationId)
  }
  return []
}

function vectorIdsDigest(vectors) {
  const vectorIds = vectors.map((vector) => vector.id).sort((left, right) => left.localeCompare(right, 'en'))
  return createHash('sha256').update(vectorIds.join('\n')).digest('hex')
}

function validateCompatibility(value, errors) {
  if (value.finkoreCompatibility !== expectedFormats.finkoreCompatibility) errors.push('compatibility: unsupported finkoreCompatibility')
  if (value.unknownVersionPolicy !== 'reject') errors.push('compatibility: unknownVersionPolicy must be reject')
  if (!Array.isArray(value.relationships) || value.relationships.length === 0) errors.push('compatibility: relationships must be non-empty')
  if (!value.relationships?.some((entry) => entry.coreVersion === 'draft-0.6' && entry.manifestFormat === '0.1' && entry.vectorFileFormat === '0.1')) {
    errors.push('compatibility: missing draft-0.6 format relationship')
  }
}

function validateProfiles(value, context, errors, options = {}) {
  if (value.finkoreProfiles !== expectedFormats.finkoreProfiles) errors.push('profiles: unsupported finkoreProfiles')
  if (!Array.isArray(value.profiles) || value.profiles.length === 0) {
    errors.push('profiles: profiles must be non-empty')
    return new Set()
  }
  const profileIds = value.profiles.map((profile) => profile.id)
  for (const duplicate of duplicateValues(profileIds)) errors.push(`profiles: duplicate profile id ${duplicate}`)
  const profileSet = new Set(profileIds)
  const suiteIds = new Set(context.manifest.suites.map((suite) => suite.id))
  for (const profile of value.profiles) {
    if (typeof profile.id !== 'string' || !profile.id.startsWith('finkore.core.draft0_6.')) errors.push(`profiles: invalid id ${profile.id}`)
    if (profile.coreVersion !== 'draft-0.6') errors.push(`profiles: ${profile.id} must target draft-0.6`)
    if (profile.selection?.suites !== undefined) {
      for (const suite of profile.selection.suites) {
        if (!suiteIds.has(suite)) errors.push(`profiles: ${profile.id} references unknown suite ${suite}`)
      }
      const count = selectedProfileVectors(profile, context).length
      if (count === 0) errors.push(`profiles: ${profile.id} selects no vectors`)
    } else if (profile.selection?.operationId !== undefined) {
      if (!context.agenticOperations.has(profile.selection.operationId)) errors.push(`profiles: ${profile.id} references non-canonical operation ${profile.selection.operationId}`)
      const count = selectedProfileVectors(profile, context).length
      if (count === 0) errors.push(`profiles: ${profile.id} selects no vectors`)
    } else {
      errors.push(`profiles: ${profile.id} has no supported selection`)
    }
  }
  if (options.requireOperationProfiles !== false) {
    for (const operation of context.agenticOperations) {
      if (!profileSet.has(`finkore.core.draft0_6.operation.${operation}`)) errors.push(`profiles: missing operation profile for ${operation}`)
    }
  }
  return profileSet
}

function validateClaims(capabilities, profiles, context, profileIds, errors) {
  const profileById = new Map(profiles.profiles.map((profile) => [profile.id, profile]))
  for (const declaration of capabilities.declarations ?? []) {
    const claimPath = declaration.conformanceClaim
    if (typeof claimPath !== 'string') continue
    if (!existsSync(claimPath)) {
      errors.push(`claims: ${declaration.implementation} claim file does not exist`)
      continue
    }
    const claim = readJson(claimPath)
    if (claim.finkoreClaim !== '0.1') errors.push(`claims: ${claimPath} has unsupported finkoreClaim`)
    if (claim.implementation !== declaration.implementation) errors.push(`claims: ${claimPath} implementation mismatch`)
    if (!profileIds.has(claim.profileId)) errors.push(`claims: ${claimPath} references unknown profile ${claim.profileId}`)
    if (!(declaration.supportedProfiles ?? []).includes(claim.profileId)) {
      errors.push(`claims: ${claimPath} profile is not supported by ${declaration.implementation}`)
    }
    const profile = profileById.get(claim.profileId)
    if (profile !== undefined) {
      const vectors = selectedProfileVectors(profile, context)
      const expectedCount = vectors.length
      if (claim.summary?.total !== expectedCount) errors.push(`claims: ${claimPath} total does not match profile vector count`)
      if (claim.summary?.passed !== expectedCount) errors.push(`claims: ${claimPath} passed count does not match profile vector count`)
      if (claim.evidence?.profileVectorIdsSha256 !== vectorIdsDigest(vectors)) {
        errors.push(`claims: ${claimPath} profile vector digest mismatch`)
      }
    }
    if (claim.summary?.failed !== 0 || claim.summary?.unsupported !== 0 || claim.summary?.infrastructureErrors !== 0) {
      errors.push(`claims: ${claimPath} is not a successful zero-error claim`)
    }
  }
}

function validateCapabilities(value, context, profileIds, errors) {
  if (value.finkoreCapabilities !== expectedFormats.finkoreCapabilities) errors.push('capabilities: unsupported finkoreCapabilities')
  if (!Array.isArray(value.declarations) || value.declarations.length === 0) {
    errors.push('capabilities: declarations must be non-empty')
    return
  }
  const implementations = new Set()
  for (const declaration of value.declarations) {
    implementations.add(declaration.implementation)
    for (const operation of declaration.canonicalOperations ?? []) {
      if (!context.agenticOperations.has(operation)) errors.push(`capabilities: ${declaration.implementation} advertises non-canonical operation ${operation}`)
    }
    for (const profile of declaration.supportedProfiles ?? []) {
      if (!profileIds.has(profile)) errors.push(`capabilities: ${declaration.implementation} references unknown profile ${profile}`)
      if (profile.includes('.domain.money') && declaration.limits?.meetsDraft06PortableFloor !== true) {
        errors.push(`capabilities: ${declaration.implementation} supports Money profile without portable floor`)
      }
      if (profile.endsWith('.full') && (declaration.unsupportedDomains?.length ?? 0) > 0) {
        errors.push(`capabilities: ${declaration.implementation} cannot support full profile while declaring unsupported domains`)
      }
    }
    if (!existsSync(declaration.adapter?.path ?? '')) errors.push(`capabilities: ${declaration.implementation} adapter path does not exist`)
  }
  for (const required of ['typescript', 'python', 'java']) {
    if (!implementations.has(required)) errors.push(`capabilities: missing ${required} declaration`)
  }
}

function validateChecksums(value, errors) {
  if (value.finkoreChecksums !== expectedFormats.finkoreChecksums) errors.push('checksums: unsupported finkoreChecksums')
  if (value.algorithm !== 'SHA-256') errors.push('checksums: algorithm must be SHA-256')
  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0) {
    errors.push('checksums: artifacts must be a non-empty array')
    return
  }
  const paths = value.artifacts.map((artifact) => artifact.path)
  for (const duplicate of duplicateValues(paths)) errors.push(`checksums: duplicate artifact ${duplicate}`)
  for (const artifact of value.artifacts) {
    if (typeof artifact.path !== 'string' || artifact.path.length === 0) {
      errors.push('checksums: artifact path must be a non-empty string')
      continue
    }
    if (artifact.path === `${root}/checksums.json`) errors.push('checksums: manifest must not checksum itself')
    if (artifact.path.includes('..') || artifact.path.startsWith('/')) errors.push(`checksums: unsafe artifact path ${artifact.path}`)
    if (typeof artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(artifact.sha256)) {
      errors.push(`checksums: ${artifact.path} must have a SHA-256 digest`)
      continue
    }
    if (!existsSync(artifact.path)) {
      errors.push(`checksums: artifact does not exist ${artifact.path}`)
      continue
    }
    const digest = createHash('sha256').update(readFileSync(artifact.path)).digest('hex')
    if (digest !== artifact.sha256) errors.push(`checksums: digest mismatch for ${artifact.path}`)
  }
}

function validateDrift(context, errors) {
  for (const duplicate of duplicateValues(context.vectors.map((vector) => vector.id))) errors.push(`vectors: duplicate id ${duplicate}`)
  for (const vector of context.vectors) {
    if (!context.specPaths.has(vector.spec)) errors.push(`vectors: ${vector.id} references missing spec path ${vector.spec}`)
    for (const requirement of vector.requirements) {
      if (!context.requirementIds.has(requirement)) errors.push(`vectors: ${vector.id} references unknown requirement ${requirement}`)
    }
    if (vector.operation.startsWith('finkore.') && !context.agenticOperations.has(vector.operation)) {
      errors.push(`vectors: ${vector.id} references unregistered canonical operation ${vector.operation}`)
    }
    const errorCode = vector.expected?.error?.code
    if (errorCode !== undefined && !context.specErrorCodes.has(errorCode)) {
      errors.push(`vectors: ${vector.id} expects unknown portable error ${errorCode}`)
    }
  }
  for (const code of context.implementationErrorCodes) {
    if (!context.specErrorCodes.has(code)) errors.push(`portable-errors: implementation references unknown ${code}`)
  }
}

function expectInvalidFixture(path, validator) {
  const errors = []
  validator(readJson(path), errors)
  return errors.length > 0
}

const manifest = readJson('conformance/manifest.json')
const vectorFiles = manifestVectorFiles(manifest)
const vectors = loadVectors(vectorFiles)
const specFiles = markdownFilesUnder('spec')
const implementationFiles = [
  ...walk('implementations/typescript/core/src'),
  ...walk('implementations/python/core/src'),
  ...walk('implementations/java/core/src/main/java'),
].filter((path) => /\.(ts|py|java)$/.test(path))
const context = {
  manifest,
  vectors,
  requirementIds: collectSpecRequirementIds(),
  specPaths: collectSpecPaths(),
  specErrorCodes: collectPortableErrorCodes(specFiles),
  implementationErrorCodes: collectPortableErrorCodes(implementationFiles),
  agenticOperations: collectCanonicalAgenticOperations(),
}

const errors = []
const compatibility = readJson(`${root}/compatibility.json`)
const profiles = readJson(`${root}/profiles.json`)
const capabilities = readJson(`${root}/capabilities.json`)
const checksums = readJson(`${root}/checksums.json`)

validateCompatibility(compatibility, errors)
const profileIds = validateProfiles(profiles, context, errors)
validateCapabilities(capabilities, context, profileIds, errors)
validateClaims(capabilities, profiles, context, profileIds, errors)
validateChecksums(checksums, errors)
validateDrift(context, errors)

const fixtureExpectations = [
  ['duplicate profile fixture', `${root}/fixtures/invalid/duplicate-profile-id.json`, (value, fixtureErrors) => validateProfiles(value, context, fixtureErrors)],
  ['conformance-local capability fixture', `${root}/fixtures/invalid/conformance-local-capability.json`, (value, fixtureErrors) => validateCapabilities(value, context, profileIds, fixtureErrors)],
  ['unsupported format fixture', `${root}/fixtures/invalid/unsupported-format.json`, validateCompatibility],
  ['checksum algorithm fixture', `${root}/fixtures/invalid/checksum-algorithm.json`, validateChecksums],
]
for (const [label, path, validator] of fixtureExpectations) {
  if (!expectInvalidFixture(path, validator)) errors.push(`fixtures: ${label} unexpectedly passed`)
}

const validFixtureErrors = []
validateProfiles(readJson(`${root}/fixtures/valid/profile-money.json`), context, validFixtureErrors, { requireOperationProfiles: false })
if (validFixtureErrors.length > 0) errors.push(`fixtures: valid profile fixture failed: ${validFixtureErrors.join('; ')}`)

if (errors.length > 0) {
  console.error('Draft 0.6 metadata validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Draft 0.6 metadata validation passed.')
console.log(JSON.stringify({
  profiles: profiles.profiles.length,
  capabilities: capabilities.declarations.length,
  claims: capabilities.declarations.filter((declaration) => typeof declaration.conformanceClaim === 'string').length,
  checksumArtifacts: checksums.artifacts.length,
  vectors: vectors.length,
  vectorFiles: vectorFiles.length,
  portableErrors: context.specErrorCodes.size,
}, null, 2))
