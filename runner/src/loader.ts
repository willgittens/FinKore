// SPDX-License-Identifier: MPL-2.0
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { RunnerInfrastructureError } from './errors/runner-errors.js'
import { validateManifest, type ConformanceManifest } from './manifest.js'
import { createRunnerMetadata, type RunnerMetadata } from './metadata.js'
import type { LoadedVector } from './types/vector.js'
import { assertUniqueVectorIds, validateVectorFile } from './validator.js'

export interface LoadedConformance {
  readonly manifest: ConformanceManifest
  readonly vectors: readonly LoadedVector[]
  readonly metadata: RunnerMetadata
}

async function readJson(path: string, kind: 'MANIFEST' | 'VECTOR'): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown
  } catch (error) {
    throw new RunnerInfrastructureError(kind, `Cannot read valid JSON from ${path}`, path, error)
  }
}

function resolveWithin(root: string, declaredPath: string, label: string): string {
  const resolved = resolve(root, declaredPath)
  const relation = relative(root, resolved)
  if (relation === '..' || relation.startsWith(`..${sep}`) || resolve(resolved) === resolve(root)) {
    throw new RunnerInfrastructureError('MANIFEST', `${label} escapes or resolves to the conformance root: ${declaredPath}`, declaredPath)
  }
  return resolved
}

async function loadDefaultMetadata(conformanceRoot: string): Promise<RunnerMetadata> {
  const traceabilityPath = resolveWithin(conformanceRoot, './traceability.md', 'Traceability path')
  try {
    return createRunnerMetadata(await readFile(traceabilityPath, 'utf8'))
  } catch (error) {
    if (error instanceof RunnerInfrastructureError) throw error
    throw new RunnerInfrastructureError('METADATA', `Cannot read traceability metadata from ${traceabilityPath}`, traceabilityPath, error)
  }
}

export async function loadConformance(
  manifestPath: string,
  suppliedMetadata?: RunnerMetadata,
): Promise<LoadedConformance> {
  const absoluteManifest = resolve(manifestPath)
  const conformanceRoot = dirname(absoluteManifest)
  const manifest = validateManifest(await readJson(absoluteManifest, 'MANIFEST'), absoluteManifest)
  const metadata = suppliedMetadata ?? await loadDefaultMetadata(conformanceRoot)

  const schemaPath = resolveWithin(conformanceRoot, manifest.vectorSchema, 'Vector schema path')
  await readJson(schemaPath, 'MANIFEST')

  const vectors: LoadedVector[] = []
  for (const suite of manifest.suites) {
    const suiteVectors: LoadedVector[] = []
    for (const declaredPath of suite.vectorFiles) {
      const vectorPath = resolveWithin(conformanceRoot, declaredPath, `Vector path for suite ${suite.id}`)
      const file = validateVectorFile(await readJson(vectorPath, 'VECTOR'), metadata, vectorPath)
      suiteVectors.push(...file.vectors.map((vector) => ({ ...vector, suiteId: suite.id, sourceFile: vectorPath })))
    }
    suiteVectors.sort((left, right) => left.id.localeCompare(right.id, 'en'))
    vectors.push(...suiteVectors)
  }
  assertUniqueVectorIds(vectors, absoluteManifest)
  return { manifest, vectors, metadata }
}
