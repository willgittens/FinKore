// SPDX-License-Identifier: MPL-2.0
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { ApprovalComposition, ApprovalCondition, ApprovalDecision, ApprovalDecisionHistory, EntityEvolutionHistory, FinancialEntity } from '../../src/index.js'

interface Vector {
  testBoundary?: string
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
const vectors = manifest.suites.flatMap(s => s.vectorFiles).filter(file => file.endsWith('/evidence-regressions.json')).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: Vector[] }).vectors,
).concat((JSON.parse(readFileSync(resolve(root, 'conformance/boundary097-cases.json'), 'utf8')) as { cases: Vector[] }).cases.filter(v => v.testBoundary === 'core-and-adapter')).filter(v => v.id.includes('.boundary097.'))
if (!vectors.length) throw new Error('No Core 0.9.7 regressions discovered')

// Fixture translation only. Assertions below also verify caller input ownership.
function invoke(v: Vector): unknown {
  const i = v.input
  switch (v.operation) {
    case 'approval.composition.evaluate': return ApprovalComposition.from(i.composition).evaluate(i as unknown as Parameters<ApprovalComposition['evaluate']>[0])
    case 'approval.condition.evaluate': return ApprovalCondition.from(i.condition).evaluate(i as unknown as Parameters<ApprovalCondition['evaluate']>[0])
    case 'approval.decision.evaluate': return ApprovalDecision.evaluate(i.requirement, i.decision, i.currentSubjectFacts, i.relevantFactPaths as readonly string[] | undefined, i.evaluatedAt)
    case 'approval.requirement.evaluate': {
      const history = ApprovalDecisionHistory.create(i.decisions)
      const before = history.toJSON()
      try { return history.evaluateRequirement(i.requirement, {
        ...(Object.hasOwn(i, 'currentSubjectFacts') ? { currentSubjectFacts: i.currentSubjectFacts } : {}),
        ...(Object.hasOwn(i, 'relevantFactPaths') ? { relevantFactPaths: i.relevantFactPaths as readonly string[] } : {}),
        ...(Object.hasOwn(i, 'evaluatedAt') ? { evaluatedAt: i.evaluatedAt } : {}),
      }) } finally { expect(history.toJSON()).toEqual(before) }
    }
    case 'approval.decision.record': {
      const history = ApprovalDecisionHistory.create(i.history)
      const before = history.toJSON()
      try { return history.record(i.requirement, i.decision).toJSON() }
      catch (error) { expect(history.toJSON()).toEqual(before); throw error }
    }
    case 'finkore.entity.create': return FinancialEntity.create(i.definition, i.id, i.data).toJSON()
    case 'entity.import': return FinancialEntity.import(i.definition, i.import)
    case 'finkore.entity.mutate': return FinancialEntity.from(i.definition, i.entity).mutate(i.changes).toJSON()
    case 'finkore.entity.transition': return FinancialEntity.from(i.definition, i.entity).transition(i.target).toJSON()
    default: {
      if (!v.operation.startsWith('finkore.entity.evolution.')) throw new Error('Missing core dispatch: ' + v.operation)
      const history = EntityEvolutionHistory.create(i.evolutionHistory as readonly unknown[])
      const source = FinancialEntity.from(i.definition, i.source)
      const before = { history: history.toJSON(), source: source.toJSON() }
      const request = { ...i, source, audit: { history: i.auditHistory, event: i.auditEvent },
        ...(Object.hasOwn(i, 'related') ? { related: FinancialEntity.from(i.definition, i.related) } : {}),
        ...(Object.hasOwn(i, 'successor') ? { successor: FinancialEntity.from(i.definition, i.successor) } : {}),
      }
      try {
        switch (v.operation) {
          case 'finkore.entity.evolution.correct': return history.correct(request as unknown as Parameters<EntityEvolutionHistory['correct']>[0])
          case 'finkore.entity.evolution.reverse': return history.reverse(request as unknown as Parameters<EntityEvolutionHistory['reverse']>[0])
          case 'finkore.entity.evolution.void': return history.void(request as unknown as Parameters<EntityEvolutionHistory['void']>[0])
          case 'finkore.entity.evolution.supersede': return history.supersede(request as unknown as Parameters<EntityEvolutionHistory['supersede']>[0])
          default: throw new Error('Unknown evolution operation')
        }
      } finally { expect({ history: history.toJSON(), source: source.toJSON() }).toEqual(before) }
    }
  }
}
for (const vector of vectors) it(vector.id, () => {
  const candidate = structuredClone(vector)
  const before = structuredClone(candidate.input)
  try {
    if (candidate.expected.status === 'success') expect(invoke(candidate)).toEqual(candidate.expected.value)
    else expect(() => invoke(candidate)).toThrowError(expect.objectContaining({ code: candidate.expected.error.code }))
  } finally { expect(candidate.input).toEqual(before) }
})

const requirement = { id: 'review', subject: { type: 'invoice', id: 'i' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const first = { requirementId: 'review', actor: { id: 'alice' }, subjectFacts: { amount: '10' }, outcome: 'APPROVED', decidedAt: '2026-09-01T10:00:00Z' }
const reference = (timestamp: string) => ({ requirementId: 'review', actorId: 'alice', decidedAt: timestamp })

for (const lifecycle of ['withdraw', 'target', 'successor', 'requirement'] as const) {
  for (const variant of ['control', 'collision', 'offset'] as const) it(`approval097 native ${lifecycle} result reuse ${variant}`, () => {
    const one = ApprovalDecisionHistory.create().record(requirement, first)
    const second = { ...first, subjectFacts: { amount: '20' }, decidedAt: '2026-09-02T10:00:00Z' }
    const two = ApprovalDecisionHistory.create(one.toJSON()).record(requirement, second)
    const event = { actor: { id: 'alice' }, recordedAt: '2026-09-03T10:00:00Z' }
    const lifecycleHistory = ApprovalDecisionHistory.create(two.toJSON())
    const retained = lifecycle === 'withdraw' ? lifecycleHistory.withdraw(requirement, { ...event, target: reference(first.decidedAt) })
      : lifecycle === 'requirement' ? lifecycleHistory.supersedeRequirement({ ...event, targetRequirementId: 'review', successorRequirementId: 'next' })
      : lifecycleHistory.supersedeDecision({ ...event, target: reference(first.decidedAt), successor: reference(second.decidedAt) })
    const before = retained.toJSON()
    const target = lifecycle === 'successor' ? second : first
    const timestamp = variant === 'control' ? '2026-09-04T10:00:00Z' : variant === 'offset' ? target.decidedAt.replace('10:00:00Z', '12:00:00+02:00') : target.decidedAt
    const candidate = { ...first, decidedAt: timestamp, subjectFacts: { amount: '30' } }
    const imported = ApprovalDecisionHistory.create(retained.toJSON())
    try {
      if (variant !== 'control' && lifecycle !== 'requirement') {
        expect(() => imported.record(requirement, candidate)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
      } else {
        const result = imported.record(requirement, candidate)
        expect(result.toJSON()).toEqual({ history: [first, second, candidate], lifecycle: before.lifecycle })
        expect(ApprovalDecisionHistory.create(result.toJSON()).evaluateRequirement(requirement, { currentSubjectFacts: candidate.subjectFacts, relevantFactPaths: ['amount'] })).toBe(lifecycle === 'requirement' ? 'PENDING' : 'APPROVED')
      }
    } finally {
      expect(retained.toJSON()).toEqual(before)
      if (variant !== 'control' && lifecycle !== 'requirement') expect(imported.toJSON()).toEqual(before)
      expect(one.toJSON()).toEqual({ history: [first] })
      expect(two.toJSON()).toEqual({ history: [first, second] })
    }
  })
}

for (const state of ['DRAFT', '__proto__', 'constructor', 'prototype']) it(`entity097 own declaration reuse ${state}`, () => {
  const definition = { type: 'invoice', identityScope: 'scope', workflow: { states: [state, 'DONE'], initialState: state, terminalStates: ['DONE'], transitions: [{ source: state, target: 'DONE' }] }, mutability: { [state]: ['memo'], DONE: [] } }
  const originalPrototype = Object.getPrototypeOf({})
  const entity = FinancialEntity.create(definition, 'i', { memo: 'old' })
  expect(Object.hasOwn(entity.definition.mutability, state)).toBe(true)
  expect(entity.definition.mutability[state]).toEqual(['memo'])
  const retained = structuredClone(entity.definition)
  definition.mutability[state]!.push('forbidden')
  const observation = entity.definition as unknown as { mutability: Record<string, string[]> }
  observation.mutability[state]!.push('exposed')
  expect(entity.definition).toEqual(retained)
  const imported = FinancialEntity.from(entity.definition, entity.toJSON())
  const before = imported.toJSON()
  expect(() => imported.mutate({ forbidden: true })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_IMMUTABLE' }))
  expect(imported.toJSON()).toEqual(before)
  const changed = imported.mutate({ memo: 'new' })
  expect(changed.toJSON()).toEqual({ ...before, data: { memo: 'new' } })
  expect(FinancialEntity.from(changed.definition, changed.toJSON()).transition('DONE').toJSON()).toEqual({ ...before, state: 'DONE', data: { memo: 'new' } })
  expect(entity.toJSON()).toEqual(before)
  expect(Object.getPrototypeOf({})).toBe(originalPrototype)
})

it('approval097 owned facts control retains original and observed values independently', () => {
  const input = { ...first, subjectFacts: { nested: { value: 1 }, array: [2, 3] } }
  const history = ApprovalDecisionHistory.create().record(requirement, input)
  const before = structuredClone(history.toJSON())
  input.subjectFacts.nested.value = 999
  const exposed = history.toJSON() as unknown as { history: { subjectFacts: { nested: { value: number } } }[] }
  exposed.history[0]!.subjectFacts.nested.value = 555
  expect(history.toJSON()).toEqual(before)
  expect(history.evaluateRequirement(requirement, { currentSubjectFacts: { nested: { value: 1 }, array: [2, 3] } })).toBe('APPROVED')
})

it('approval097 condition rejects inherited facts while own special keys remain facts', () => {
  const condition = ApprovalCondition.from({ id: 'c', requiredFacts: ['invoice.amount'], evaluation: 'external' })
  expect(() => condition.evaluate({ facts: { invoice: Object.create({ amount: 10 }) }, result: 'APPLICABLE' })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_CONDITION_UNRESOLVED' }))
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    const own = ApprovalCondition.from({ id: 'c', requiredFacts: [key + '.amount'], evaluation: 'external' })
    expect(own.evaluate({ facts: { [key]: { amount: null } }, result: 'APPLICABLE' })).toBe('APPLICABLE')
  }
})

for (const [name, value] of Object.entries({ boxed: new Number(1), bigint: 1n, nan: NaN, infinity: Infinity, date: new Date(0) })) it(`approval097 unsupported native ${name} rejects before retention`, () => {
  const history = ApprovalDecisionHistory.create().record(requirement, first)
  const before = history.toJSON()
  expect(() => history.record(requirement, { ...first, subjectFacts: { value } })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
  expect(history.toJSON()).toEqual(before)
})
