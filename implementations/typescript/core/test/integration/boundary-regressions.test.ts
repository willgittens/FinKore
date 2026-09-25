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

const binding = { definitionIdentity: 'invoice-flow', definitionVersionIdentity: '1' }
const data = { amount: { amount: '1.239', currency: 'EUR' } }
function definition(versioned = false) {
  return {
    type: 'invoice', identityScope: 'tenant',
    workflow: { ...(versioned ? binding : {}), states: ['DRAFT', 'REVIEW', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'],
      transitions: [{ source: 'DRAFT', target: 'REVIEW' }, { source: 'REVIEW', target: 'DONE' }] },
    mutability: { DRAFT: ['amount'], REVIEW: ['amount'], DONE: [] as string[] },
    validation: [{ id: 'POSITIVE', rule: 'positive-money', path: 'amount' }],
  }
}
function attemptMutation(action: () => void): void {
  try { action() } catch (error) { if (!(error instanceof TypeError)) throw error }
}
const portableError = (code: string) => expect.objectContaining({ code })

describe('Entity result reuse and retained declarations', () => {
  // ENTITY-LIFECYCLE-001/003, ENTITY-IMPORT-002 and WORKFLOW-VERSION-007/008.
  for (const versioned of [false, true]) it(`${versioned ? 'versioned' : 'unversioned control'} create → transition → observe/import → transition`, () => {
    const declarations = definition(versioned)
    const first = FinancialEntity.create(declarations, 'invoice-1', data)
    const before = first.toJSON()
    try {
      const second = first.transition('REVIEW')
      const reconstructed = FinancialEntity.from(declarations, second.toJSON())
      const imported = FinancialEntity.import(declarations, { entity: reconstructed.toJSON() })
      const last = FinancialEntity.from(declarations, imported.entity).transition('DONE')
      expect(last.toJSON()).toEqual({ type: 'invoice', id: 'invoice-1', state: 'DONE', data, ...(versioned ? { binding } : {}) })
      const exposed = last.toJSON()
      ;(exposed.data as typeof data).amount.amount = '999'
      expect(last.toJSON().data).toEqual(data)
    } finally {
      expect(first.toJSON()).toEqual(before)
    }
  })

  // ENTITY-DEFINITION-002: native references are not expressible as isolated JSON.
  for (const location of ['input', 'observation'] as const) {
    it(`rejects an undeclared transition after changing ${location} transitions`, () => {
      const declarations = definition()
      const entity = FinancialEntity.create(declarations, 'invoice-1', data)
      const before = entity.toJSON()
      expect(() => entity.transition('DONE')).toThrowError(portableError('FINKORE_WORKFLOW_INVALID_TRANSITION'))
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.workflow.transitions.push({ source: 'DRAFT', target: 'DONE' }))
      try {
        expect(() => entity.transition('DONE')).toThrowError(portableError('FINKORE_WORKFLOW_INVALID_TRANSITION'))
        expect(entity.transition('REVIEW').state).toBe('REVIEW')
      } finally { expect(entity.toJSON()).toEqual(before) }
    })

    it(`preserves accepted transition after changing ${location} state and terminal lists`, () => {
      const declarations = definition()
      const entity = FinancialEntity.create(declarations, 'invoice-1', data)
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.workflow.states.splice(0))
      attemptMutation(() => retained.workflow.terminalStates.push('DRAFT'))
      expect(entity.transition('REVIEW').toJSON()).toEqual({ type: 'invoice', id: 'invoice-1', state: 'REVIEW', data })
    })

    it(`preserves permitted mutations after changing ${location} mutability`, () => {
      const declarations = definition()
      const entity = FinancialEntity.create(declarations, 'invoice-1', data)
      const before = entity.toJSON()
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.mutability.DRAFT.splice(0))
      expect(entity.mutate({ amount: { amount: '2', currency: 'EUR' } }).toJSON().data).toEqual({ amount: { amount: '2', currency: 'EUR' } })
      expect(entity.toJSON()).toEqual(before)
    })

    it(`preserves rejected data after changing ${location} validators`, () => {
      const declarations = definition()
      const entity = FinancialEntity.create(declarations, 'invoice-1', data)
      const before = entity.toJSON()
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.validation.splice(0))
      try {
        expect(() => entity.mutate({ amount: { amount: '-1', currency: 'EUR' } })).toThrowError(portableError('FINKORE_ENTITY_VALIDATION_FAILED'))
      } finally { expect(entity.toJSON()).toEqual(before) }
    })

    it(`preserves nested guards from ${location} mutation`, () => {
      const declarations = definition()
      const guarded = { ...declarations, workflow: { ...declarations.workflow, transitions: [{ source: 'DRAFT', target: 'REVIEW',
        guard: { fact: 'approved', equals: { checks: [{ ok: true }] } } }] } }
      const entity = FinancialEntity.create(guarded, 'invoice-1', data)
      const original = structuredClone(entity.definition)
      const retained = location === 'input' ? guarded : entity.definition as unknown as typeof guarded
      attemptMutation(() => { retained.workflow.transitions[0]!.guard.equals.checks[0]!.ok = false })
      expect(entity.definition).toEqual(original)
      expect(() => entity.transition('REVIEW')).toThrowError(portableError('FINKORE_WORKFLOW_GUARD_REJECTED'))
    })
  }

  it('new independently declared Entity control uses its own transitions', () => {
    const initial = definition()
    const first = FinancialEntity.create(initial, 'invoice-1', data)
    const revised = definition()
    revised.workflow.transitions.push({ source: 'DRAFT', target: 'DONE' })
    const second = FinancialEntity.create(revised, 'invoice-2', data)
    expect(second.transition('DONE').state).toBe('DONE')
    expect(() => first.transition('DONE')).toThrowError(portableError('FINKORE_WORKFLOW_INVALID_TRANSITION'))
  })
})
