// SPDX-License-Identifier: MPL-2.0
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ApprovalChain, ApprovalComposition, ApprovalDecision, ApprovalDecisionHistory,
  AuditLog, EntityEvolutionHistory, FinancialEntity, Money, Workflow,
} from '../../src/index.js'

interface Vector {
  id: string
  operation: string
  input: Record<string, unknown>
  expected: { status: 'success'; value: unknown } | { status: 'error'; error: { code: string } }
}
let root = import.meta.dirname
while (!existsSync(resolve(root, 'conformance/manifest.json'))) {
  const parent = resolve(root, '..')
  if (parent === root) throw new Error('Conformance manifest not found')
  root = parent
}
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as { suites: { vectorFiles: string[] }[] }
const vectors = manifest.suites.flatMap(s => s.vectorFiles).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: Vector[] }).vectors,
).filter(v => v.id.includes('.boundary096.'))
if (vectors.length === 0) throw new Error('No Core 0.9.6 vectors discovered')

// This dispatch translates representations only; financial validation belongs in core.
function invoke(vector: Vector): unknown {
  const i = vector.input
  switch (vector.operation) {
    case 'finkore.money.applyrate': {
      const value = Money.from(i.value as Parameters<typeof Money.from>[0])
      const before = value.toJSON()
      try { return value.applyRate(i.rate).toJSON() }
      finally { expect(value.toJSON()).toEqual(before) }
    }
    case 'workflow.import': return Workflow.import(i.definition, i.instance).toJSON()
    case 'finkore.workflow.transition': return Workflow.from(i.definition, i.instance).transition(i.target).toJSON()
    case 'audit.redact': {
      const log = AuditLog.create(i.history as readonly unknown[])
      const before = log.events()
      try {
        const result = log.redact({ policy: i.policy, redactionEvent: i.redactionEvent } as Parameters<AuditLog['redact']>[0])
        expect(log.events()).toEqual([...before, result.evidenceEvent])
        return result
      } catch (error) { expect(log.events()).toEqual(before); throw error }
    }
    case 'approval.composition.evaluate': return ApprovalComposition.from(i.composition).evaluate(i as unknown as Parameters<ApprovalComposition['evaluate']>[0])
    case 'approval.chain.evaluate': return ApprovalChain.from(i.chain).evaluate(i.states)
    case 'approval.requirement.evaluate': {
      const history = ApprovalDecisionHistory.create(i.decisions)
      const before = history.toJSON()
      try { return history.evaluateRequirement(i.requirement, {
        ...(Object.hasOwn(i, 'currentSubjectFacts') ? { currentSubjectFacts: i.currentSubjectFacts } : {}),
        ...(Object.hasOwn(i, 'evaluatedAt') ? { evaluatedAt: i.evaluatedAt } : {}),
        ...(Object.hasOwn(i, 'relevantFactPaths') ? { relevantFactPaths: i.relevantFactPaths as readonly string[] } : {}),
      }) } finally { expect(history.toJSON()).toEqual(before) }
    }
    case 'approval.decision.evaluate': return ApprovalDecision.evaluate(i.requirement, i.decision, i.currentSubjectFacts, i.relevantFactPaths as readonly string[] | undefined, i.evaluatedAt)
    case 'approval.decision.record': return ApprovalDecisionHistory.create(i.history).record(i.requirement, i.decision).toJSON()
    case 'entity.import': return FinancialEntity.import(i.definition, i.import)
    default: {
      if (!vector.operation.startsWith('finkore.entity.evolution.')) throw new Error('Missing native dispatch: ' + vector.operation)
      const history = EntityEvolutionHistory.create(i.evolutionHistory as readonly unknown[])
      const source = FinancialEntity.from(i.definition, i.source)
      const before = { history: history.toJSON(), source: source.toJSON() }
      const request = { ...i, source, audit: { history: i.auditHistory, event: i.auditEvent },
        ...(Object.hasOwn(i, 'related') ? { related: FinancialEntity.from(i.definition, i.related) } : {}),
        ...(Object.hasOwn(i, 'successor') ? { successor: FinancialEntity.from(i.definition, i.successor) } : {}),
      }
      try {
        switch (vector.operation) {
          case 'finkore.entity.evolution.correct': return history.correct(request as unknown as Parameters<EntityEvolutionHistory['correct']>[0])
          case 'finkore.entity.evolution.reverse': return history.reverse(request as unknown as Parameters<EntityEvolutionHistory['reverse']>[0])
          case 'finkore.entity.evolution.void': return history.void(request as unknown as Parameters<EntityEvolutionHistory['void']>[0])
          case 'finkore.entity.evolution.supersede': return history.supersede(request as unknown as Parameters<EntityEvolutionHistory['supersede']>[0])
          default: throw new Error('Missing evolution operation')
        }
      } finally { expect({ history: history.toJSON(), source: source.toJSON() }).toEqual(before) }
    }
  }
}

describe('Core 0.9.6 native core boundaries', () => {
  for (const vector of vectors) it(vector.id, () => {
    const candidate = structuredClone(vector)
    const before = structuredClone(candidate.input)
    try {
      if (candidate.expected.status === 'success') expect(invoke(candidate)).toEqual(candidate.expected.value)
      else expect(() => invoke(candidate)).toThrowError(expect.objectContaining({ code: candidate.expected.error.code }))
    } finally { expect(candidate.input).toEqual(before) }
  })
})

const requirement = { id: 'review', subject: { type: 'invoice', id: 'i' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const decision = { requirementId: 'review', actor: { id: 'alice' }, subjectFacts: null, outcome: 'APPROVED', decidedAt: '2026-09-01T10:00:00Z' }
function approvalSequence(): ApprovalDecisionHistory {
  const first = ApprovalDecisionHistory.create().record(requirement, decision)
  expect(first.toJSON()).toEqual({ history: [decision] })
  expect(first.evaluateRequirement(requirement)).toBe('APPROVED')
  const next = ApprovalDecisionHistory.create(first.toJSON()).withdraw(requirement, {
    target: { requirementId: 'review', actorId: 'alice', decidedAt: decision.decidedAt },
    actor: { id: 'alice' }, recordedAt: '2026-09-02T10:00:00Z', type: 'IGNORED_REQUEST_MEMBER',
  })
  expect(next.evaluateRequirement(requirement)).toBe('PENDING')
  const withdrawn = next.toJSON()
  const second = { ...decision, decidedAt: '2026-09-03T10:00:00Z' }
  const rerecorded = ApprovalDecisionHistory.create(withdrawn).record(requirement, second)
  expect(rerecorded.toJSON()).toEqual({ history: [decision, second], lifecycle: withdrawn.lifecycle })
  expect(rerecorded.evaluateRequirement(requirement)).toBe('APPROVED')
  expect(first.toJSON()).toEqual({ history: [decision] })
  return rerecorded
}

it('approval returned history control: record -> withdraw -> reconstruct -> record -> evaluate', () => { approvalSequence() })
it('unknown committed kind rejects native reconstruction and preserves valid returned history', () => {
  const valid = approvalSequence()
  const before = valid.toJSON()
  const malformed = structuredClone(before) as unknown as { lifecycle: { type: string }[] }
  malformed.lifecycle[0]!.type = 'UNKNOWN'
  expect(() => ApprovalDecisionHistory.create(malformed)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
  expect(valid.toJSON()).toEqual(before)
  expect(valid.evaluateRequirement(requirement)).toBe('APPROVED')
})
it('native facts-only helper control retains its separately documented scope', () => {
  const value = ApprovalDecision.from({ ...decision, expiresAt: '2026-09-02T10:00:00Z' })
  expect(value.evaluateEffectiveness(null)).toBe('EFFECTIVE')
  expect(value.evaluateEffectiveness({ changed: true })).toBe('INEFFECTIVE')
})

for (const invalid of [false, true]) it(invalid ? 'evolution returned history null precondition' : 'evolution returned history control', () => {
  const vector = vectors.find(v => v.id === 'entity.boundary096.evolution-correct-control-001')!
  const i = structuredClone(vector.input)
  const source = FinancialEntity.from(i.definition, i.source)
  const related = FinancialEntity.from(i.definition, i.related)
  const history = EntityEvolutionHistory.create([])
  const request = { ...i, source, related, audit: { history: i.auditHistory, event: i.auditEvent } } as unknown as Parameters<EntityEvolutionHistory['correct']>[0]
  const first = history.correct(request)
  const nextHistory = EntityEvolutionHistory.create(first.evolutionHistory.relations)
  const event = structuredClone(i.auditEvent) as { eventId: string; metadata: { entityEvolution: { relationId: string } }; relationships: { relationshipId: string }[] }
  event.eventId = 'second-audit'
  event.metadata.entityEvolution.relationId = 'second-correction'
  event.relationships[0]!.relationshipId = 'second-audit-relation'
  const next = { ...request, relationId: 'second-correction', audit: { history: first.auditHistory.history, event }, ...(invalid ? { expectedSourceRevision: null } : {}) }
  const before = { history: nextHistory.toJSON(), source: source.toJSON(), related: related.toJSON(), first: structuredClone(first) }
  try {
    if (invalid) expect(() => nextHistory.correct(next)).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_STATE_CONFLICT' }))
    else {
      const result = nextHistory.correct(next)
      expect(result.evolutionHistory.relations).toEqual([first.relation, result.relation])
      expect(result.auditHistory.history).toEqual([...first.auditHistory.history, event])
      expect(result.source).toEqual(first.source)
    }
  } finally { expect({ history: nextHistory.toJSON(), source: source.toJSON(), related: related.toJSON(), first }).toEqual(before) }
})
