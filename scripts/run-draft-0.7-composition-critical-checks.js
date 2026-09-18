// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'

function runComparison() {
  const child = spawnSync(process.execPath, ['scripts/run-draft-0.7-composition-comparison.js', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
  if (child.error !== undefined) throw child.error
  if (child.status !== 0) {
    process.stderr.write(child.stdout)
    process.stderr.write(child.stderr)
    process.exit(child.status ?? 1)
  }
  return JSON.parse(child.stdout)
}

function assert(condition, message) {
  if (!condition) throw new Error(`Draft 0.7 critical composition check failed: ${message}`)
}

function scenario(results, id) {
  const value = results.find((candidate) => candidate.scenarioId === id)
  assert(value !== undefined, `${id} result missing`)
  return value
}

const payload = runComparison()
const results = payload.results.typescript

const exp001 = scenario(results, 'D07-EXP-001')
assert(exp001.evidence.total.amount === '100.00', 'expense total changed')
assert(exp001.evidence.allocations[0].amount === '33.34', 'expense first allocation remainder changed')
assert(exp001.evidence.allocations[1].amount === '66.66', 'expense second allocation changed')

for (const id of ['D07-EXP-003', 'D07-EXP-004', 'D07-EXP-005', 'D07-EXP-006', 'D07-INV-006', 'D07-INV-007']) {
  const value = scenario(results, id)
  assert(value.status === 'profile-error', `${id} must be profile-gated`)
  assert(value.code === 'D07_PROFILE_APPROVAL_NOT_CURRENT', `${id} must use profile-local approval code`)
}

const exp009 = scenario(results, 'D07-EXP-009')
assert(exp009.code === 'FINKORE_WORKFLOW_STATE_CONFLICT', 'stale workflow precondition must expose Workflow conflict')
assert(exp009.evidence.workflowAfter.currentState === 'SUBMITTED', 'stale workflow failure changed state')

const exp010 = scenario(results, 'D07-EXP-010')
assert(exp010.code === 'FINKORE_AUDIT_DUPLICATE_EVENT', 'late expense audit failure must expose duplicate event')
assert(exp010.evidence.auditHistoryLengthAfterFailure === exp010.evidence.priorAuditHistoryLength, 'late expense audit failure changed committed history')

const inv001 = scenario(results, 'D07-INV-001')
assert(inv001.evidence.source.data.amount.amount === '100.00', 'invoice correction rewrote source amount')
assert(inv001.evidence.related.data.amount.amount === '99.00', 'invoice correction related amount changed')
assert(inv001.evidence.relation.kind === 'CORRECTION', 'invoice correction relation kind changed')

for (const id of ['D07-INV-003', 'D07-INV-004', 'D07-INV-005', 'D07-INV-008']) {
  const value = scenario(results, id)
  assert(value.status === 'error', `${id} must remain a Core error`)
  assert(value.preserveSourceFacts === true, `${id} must preserve source facts`)
}

const inv008 = scenario(results, 'D07-INV-008')
assert(inv008.code === 'FINKORE_AUDIT_INVALID_EVENT', 'invalid correction audit relationship must expose Audit error')
assert(inv008.evidence.relationCountAfterFailure === 0, 'invalid correction audit relationship published relation')

const inv010 = scenario(results, 'D07-INV-010')
assert(inv010.evidence.relationKind === 'CORRECTION', 'correction scenario changed evolution kind')
assert(inv010.evidence.syntheticEffects.length === 0, 'correction scenario synthesized out-of-scope effects')

process.stdout.write(`Draft 0.7 critical composition checks passed for ${payload.scenarioCount} compared scenarios.\n`)
