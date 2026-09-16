// SPDX-License-Identifier: MPL-2.0
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { RunnerMetadata } from '../src/metadata.js'
import type { ConformanceVector } from '../src/types/vector.js'

export const metadata: RunnerMetadata = {
  operationIds: new Set(['finkore.money.add', 'finkore.money.round', 'local.inspect']),
  agenticOperationIds: new Set(['finkore.money.add', 'finkore.money.round']),
  requirementIds: new Set(['MONEY-ARITHMETIC-001', 'MONEY-ROUNDING-003', 'TEST-LOCAL-001']),
  criticalRequirementIds: new Set(['MONEY-ROUNDING-003']),
}

export const validVector: ConformanceVector = {
  id: 'money.add.basic-001',
  spec: 'money/arithmetic',
  requirements: ['MONEY-ARITHMETIC-001'],
  description: 'Fixture behavior',
  operation: 'finkore.money.add',
  input: { token: 'basic' },
  expected: { status: 'success', value: { answer: 'ok' } },
  tags: ['positive'],
}

export const profileCatalog = {
  finkoreProfiles: '0.1' as const,
  profiles: [
    {
      id: 'finkore.core.draft0_6.domain.money',
      kind: 'domain' as const,
      coreVersion: 'draft-0.6',
      selection: { suites: ['money'] },
      capabilityFloor: 'spec/draft-0.6-portability-capability-contract.md',
    },
  ],
}

export async function createFixtureConformance(
  vectors: readonly unknown[] = [validVector],
  manifestOverride?: unknown,
): Promise<{ root: string; manifestPath: string }> {
  const root = await mkdtemp(join(tmpdir(), 'finkore-runner-'))
  await mkdir(join(root, 'suite'))
  await writeFile(join(root, 'schema.json'), '{}')
  await writeFile(join(root, 'traceability.md'), '| MONEY-ARITHMETIC-001 | Money | MUST | COVERED | x |')
  await writeFile(join(root, 'suite', 'vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors }))
  const manifest = manifestOverride ?? {
    finkoreConformance: '0.1',
    vectorSchema: './schema.json',
    suites: [{ id: 'money', vectorFiles: ['./suite/vectors.json'] }],
  }
  const manifestPath = join(root, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest))
  return { root, manifestPath }
}
