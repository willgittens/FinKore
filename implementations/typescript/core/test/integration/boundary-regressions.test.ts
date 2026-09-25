// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ApprovalDecision, ApprovalDecisionHistory, FinancialEntity, Workflow } from '../../src/index.js'

interface Vector {
  id: string
  operation: string
  input: Record<string, unknown>
  expected: { status: 'success'; value: unknown } | { status: 'error'; error: { code: string } }
}
const root = resolve(import.meta.dirname, '../../../../..')
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as { suites: { vectorFiles: string[] }[] }
const prefixes = ['approval.association.', 'workflow.presence.', 'entity.import.presence-', 'entity.import.equal-revision-', 'entity.import.distinct-token-', 'entity.binding.', 'entity.declaration.']
const vectors = manifest.suites.flatMap(suite => suite.vectorFiles).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: Vector[] }).vectors,
).filter(vector => prefixes.some(prefix => vector.id.startsWith(prefix)))
if (vectors.length === 0) throw new Error('No Core 0.9.5 native vectors discovered')

// Execute owning native cores directly, independently of conformance adapters.
function invoke(vector: Vector): unknown {
  const i = vector.input
  switch (vector.operation) {
    case 'approval.decision.record': return ApprovalDecisionHistory.create(i.history).record(i.requirement, i.decision).toJSON()
    case 'approval.requirement.evaluate': return ApprovalDecisionHistory.create(i.decisions).evaluateRequirement(i.requirement)
    case 'approval.decision.evaluate': return ApprovalDecision.from(i.decision).evaluateEffectiveness(i.currentSubjectFacts)
    case 'finkore.workflow.transition': return Workflow.from(i.definition, i.instance).transition(i.target, {
      ...(Object.hasOwn(i, 'expectedCurrentState') ? { expectedCurrentState: i.expectedCurrentState } : {}),
      ...(Object.hasOwn(i, 'expectedRevision') ? { expectedRevision: i.expectedRevision } : {}),
    }).toJSON()
    case 'finkore.entity.create': return FinancialEntity.create(i.definition, i.id, i.data).toJSON()
    case 'finkore.entity.transition': return FinancialEntity.from(i.definition, i.entity).transition(i.target).toJSON()
    case 'finkore.entity.mutate': return FinancialEntity.from(i.definition, i.entity).mutate(i.changes).toJSON()
    case 'entity.import': return FinancialEntity.import(i.definition, i.import)
    default: throw new Error('Missing native dispatch: ' + vector.operation)
  }
}

describe('Core 0.9.5 portable cases at native boundaries', () => {
  for (const vector of vectors) it(vector.id, () => {
    const candidate = structuredClone(vector)
    const before = structuredClone(candidate.input)
    try {
      if (candidate.expected.status === 'success') expect(invoke(candidate)).toEqual(candidate.expected.value)
      else {
        const code = candidate.expected.error.code
        expect(() => invoke(candidate)).toThrowError(expect.objectContaining({ code }))
      }
    } finally {
      expect(candidate.input).toEqual(before)
    }
  })
})

describe('Approval concrete record and evaluate sequence', () => {
  for (const rejectMissing of [false, true]) it(rejectMissing ? 'missing association preserves committed history' : 'recorded null association control', () => {
    const requirement = { id: 'review', subject: { type: 'invoice', id: 'invoice-1' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
    const decision = { requirementId: 'review', subjectFacts: null, outcome: 'APPROVED', actor: { id: 'alice' }, decidedAt: '2026-09-01T12:00:00Z' }
    const recorded = ApprovalDecisionHistory.create().record(requirement, decision)
    const history = ApprovalDecisionHistory.create(recorded.toJSON())
    expect(history.evaluateRequirement(requirement)).toBe('APPROVED')
    if (rejectMissing) {
      const missing: Record<string, unknown> = { ...decision, decidedAt: '2026-09-02T12:00:00Z' }
      delete missing.subjectFacts
      const before = history.toJSON()
      try { expect(() => history.record(requirement, missing)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' })) }
      finally {
        expect(history.toJSON()).toEqual(before)
        expect(history.evaluateRequirement(requirement)).toBe('APPROVED')
      }
    }
  })
})
