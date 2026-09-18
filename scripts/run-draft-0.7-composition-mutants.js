// SPDX-License-Identifier: MPL-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const repositoryRoot = process.cwd()

const mutants = [
  {
    id: 'typescript-expense-allocation-order',
    path: 'implementations/typescript/examples/composition/draft-0.7/profiles.ts',
    from: "const allocations = total.allocate({ method: 'RATIO', ratios: [1, 2], scale: 2 })",
    to: "const allocations = total.allocate({ method: 'RATIO', ratios: [2, 1], scale: 2 })",
  },
  {
    id: 'typescript-profile-approval-gate-bypass',
    path: 'implementations/typescript/examples/composition/draft-0.7/profiles.ts',
    from: "    status: 'profile-error',\n    code: PROFILE_APPROVAL_NOT_CURRENT,",
    to: "    status: 'success',\n    code: PROFILE_APPROVAL_NOT_CURRENT,",
  },
  {
    id: 'typescript-late-audit-history-published',
    path: 'implementations/typescript/examples/composition/draft-0.7/profiles.ts',
    from: "{ entityBefore: entity.toJSON(), candidateState: 'APPROVED', priorAuditHistoryLength: 1, auditHistoryLengthAfterFailure: 1 }",
    to: "{ entityBefore: entity.toJSON(), candidateState: 'APPROVED', priorAuditHistoryLength: 1, auditHistoryLengthAfterFailure: 2 }",
  },
  {
    id: 'python-expense-allocation-order',
    path: 'implementations/python/examples/composition/draft-0.7/profiles.py',
    from: 'total.allocate({"method": "RATIO", "ratios": [1, 2]}, 2)',
    to: 'total.allocate({"method": "RATIO", "ratios": [2, 1]}, 2)',
  },
  {
    id: 'python-profile-approval-gate-bypass',
    path: 'implementations/python/examples/composition/draft-0.7/profiles.py',
    from: '        "status": "profile-error",\n        "code": PROFILE_APPROVAL_NOT_CURRENT,',
    to: '        "status": "success",\n        "code": PROFILE_APPROVAL_NOT_CURRENT,',
  },
  {
    id: 'python-late-audit-history-published',
    path: 'implementations/python/examples/composition/draft-0.7/profiles.py',
    from: '{"entityBefore": entity, "candidateState": "APPROVED", "priorAuditHistoryLength": 1, "auditHistoryLengthAfterFailure": 1}',
    to: '{"entityBefore": entity, "candidateState": "APPROVED", "priorAuditHistoryLength": 1, "auditHistoryLengthAfterFailure": 2}',
  },
  {
    id: 'java-expense-allocation-order',
    path: 'implementations/java/examples/composition/draft-0.7/CompositionProfiles.java',
    from: 'total.allocate(map("method", "RATIO", "ratios", List.of(1, 2)), 2)',
    to: 'total.allocate(map("method", "RATIO", "ratios", List.of(2, 1)), 2)',
  },
  {
    id: 'java-profile-approval-gate-bypass',
    path: 'implementations/java/examples/composition/draft-0.7/CompositionProfiles.java',
    from: '"status", "profile-error", "code", PROFILE_APPROVAL_NOT_CURRENT',
    to: '"status", "success", "code", PROFILE_APPROVAL_NOT_CURRENT',
  },
  {
    id: 'java-synthetic-effect-published',
    path: 'implementations/java/examples/composition/draft-0.7/CompositionProfiles.java',
    from: '"syntheticEffects", List.of())',
    to: '"syntheticEffects", List.of("LEDGER_POSTING"))',
  },
]

function runCritical() {
  return spawnSync(process.execPath, ['scripts/run-draft-0.7-composition-critical-checks.js'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
}

function assertSingleTarget(path, from) {
  const original = readFileSync(path, 'utf8')
  const occurrences = original.split(from).length - 1
  if (occurrences !== 1) {
    throw new Error(`${path} expected exactly one mutation target for ${JSON.stringify(from)}, found ${occurrences}`)
  }
  return original
}

const baseline = runCritical()
if (baseline.error !== undefined) throw baseline.error
if (baseline.status !== 0) {
  process.stderr.write(baseline.stdout)
  process.stderr.write(baseline.stderr)
  throw new Error('Draft 0.7 composition mutant baseline did not pass')
}

const results = []

for (const mutant of mutants) {
  const path = resolve(repositoryRoot, mutant.path)
  const original = assertSingleTarget(path, mutant.from)
  try {
    writeFileSync(path, original.replace(mutant.from, mutant.to))
    const result = runCritical()
    if (result.error !== undefined) throw result.error
    const killed = result.status !== 0
    results.push({ id: mutant.id, killed })
    if (!killed) {
      process.stderr.write(result.stdout)
      process.stderr.write(result.stderr)
      throw new Error(`Draft 0.7 composition mutant survived: ${mutant.id}`)
    }
  } finally {
    writeFileSync(path, original)
  }
}

const restored = runCritical()
if (restored.error !== undefined) throw restored.error
if (restored.status !== 0) {
  process.stderr.write(restored.stdout)
  process.stderr.write(restored.stderr)
  throw new Error('Draft 0.7 composition mutant restoration baseline did not pass')
}

process.stdout.write(`Draft 0.7 composition critical mutants killed: ${results.length}/${mutants.length}\n`)
