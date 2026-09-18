// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  ApprovalDecisionHistory,
  EntityEvolutionHistory,
  FinancialEntity,
  InvalidEntityMutationError,
  Money,
  Workflow,
  WorkflowGuardRejectedError,
} from '../../src/index.js'

const invoiceWorkflow = {
  states: ['DRAFT', 'ISSUED', 'POSTED'],
  initialState: 'DRAFT',
  terminalStates: ['POSTED'],
  transitions: [
    { source: 'DRAFT', target: 'ISSUED' },
    { source: 'ISSUED', target: 'POSTED', guards: [{ fact: 'approvalState', equals: 'APPROVED' }] },
  ],
}

const invoiceDefinition = {
  type: 'invoice',
  identityScope: 'tenant-a',
  workflow: invoiceWorkflow,
  mutability: {
    DRAFT: ['amount', 'memo'],
    ISSUED: ['memo'],
    POSTED: [],
  },
}

const originalAmount = Money.from({ amount: '100.00', currency: 'EUR' }).toJSON()
const correctedAmount = Money.from({ amount: '99.00', currency: 'EUR' }).toJSON()
const reversalAmount = Money.from({ amount: '-100.00', currency: 'EUR' }).toJSON()

const originalAuditEvent = {
  eventId: 'evt-invoice-issued',
  eventType: 'ENTITY_ISSUED',
  entity: { type: 'invoice', id: 'inv-42' },
  occurredAt: '2026-09-01T10:00:00Z',
  changes: [{ path: 'amount', after: originalAmount }],
}

const approvalRequirement = {
  id: 'finance-review',
  subject: { type: 'invoice', id: 'inv-42' },
  eligibleActors: ['controller-1'],
  approvedOutcome: 'APPROVED',
  rejectedOutcome: 'REJECTED',
}

function invoice(id: string, state: 'ISSUED' | 'POSTED', amount = originalAmount): FinancialEntity {
  return FinancialEntity.from(invoiceDefinition, {
    type: 'invoice',
    id,
    state,
    data: { amount, memo: `memo-${id}` },
  })
}

function approvalForRevision(revision: string, amount = originalAmount) {
  return {
    requirementId: 'finance-review',
    subjectFacts: { revision, amount },
    outcome: 'APPROVED',
    actor: { type: 'user', id: 'controller-1' },
    decidedAt: `2026-09-01T1${revision}:00:00Z`,
  }
}

function evolutionMetadata(
  kind: 'CORRECTION' | 'REVERSAL' | 'VOID' | 'SUPERSESSION',
  relationId: string,
  related?: { readonly type: string; readonly id: string; readonly revision: string },
  supersessionScope?: string,
) {
  return {
    kind,
    relationId,
    source: { type: 'invoice', id: 'inv-42', revision: 'rev-1' },
    ...(related === undefined ? {} : { related }),
    ...(supersessionScope === undefined ? {} : { supersessionScope }),
  }
}

function evolutionAuditEvent(
  eventId: string,
  relationshipType: 'CORRECTS' | 'REVERSES' | 'VOIDS' | 'SUPERSEDES',
  metadata: Record<string, unknown>,
) {
  return {
    eventId,
    eventType: 'ENTITY_EVOLUTION_RECORDED',
    entity: { type: 'invoice', id: 'inv-42' },
    occurredAt: '2026-09-02T10:00:00Z',
    metadata: { entityEvolution: metadata },
    relationships: [
      {
        relationshipId: `rel-audit-${eventId}`,
        type: relationshipType,
        target: { eventId: 'evt-invoice-issued', entity: { type: 'invoice', id: 'inv-42' } },
      },
    ],
  }
}

describe('cross-domain invariants', () => {
  it('composes approval fact invalidation with workflow lifecycle gates and entity evolution evidence', () => {
    const approvalHistory = ApprovalDecisionHistory.create([approvalForRevision('1')])
    const currentApprovalState = approvalHistory.evaluateRequirement(approvalRequirement, {
      currentSubjectFacts: { revision: '1', amount: originalAmount },
      relevantFactPaths: ['revision', 'amount'],
    })
    const workflow = Workflow.from(invoiceWorkflow, { currentState: 'ISSUED' })

    expect(workflow.transition('POSTED', { facts: { approvalState: currentApprovalState } }).toJSON()).toEqual({
      currentState: 'POSTED',
    })

    const staleApprovalState = approvalHistory.evaluateRequirement(approvalRequirement, {
      currentSubjectFacts: { revision: '2', amount: correctedAmount },
      relevantFactPaths: ['revision', 'amount'],
    })
    const staleWorkflow = Workflow.from(invoiceWorkflow, { currentState: 'ISSUED' })
    const staleWorkflowBefore = staleWorkflow.toJSON()

    expect(staleApprovalState).toBe('PENDING')
    expect(() => staleWorkflow.transition('POSTED', { facts: { approvalState: staleApprovalState } })).toThrow(
      WorkflowGuardRejectedError,
    )
    expect(staleWorkflow.toJSON()).toEqual(staleWorkflowBefore)

    const source = invoice('inv-42', 'ISSUED')
    const corrected = invoice('inv-42', 'ISSUED', correctedAmount)
    const correction = EntityEvolutionHistory.create().correct({
      source,
      sourceRevision: 'rev-1',
      related: corrected,
      relatedRevision: 'rev-2',
      relationId: 'evo-correction-1',
      eligible: true,
      expectedSourceState: 'ISSUED',
      expectedSourceRevision: 'rev-1',
      expectedSourceCurrent: true,
      audit: {
        history: [originalAuditEvent],
        event: evolutionAuditEvent(
          'evt-correction',
          'CORRECTS',
          evolutionMetadata('CORRECTION', 'evo-correction-1', { type: 'invoice', id: 'inv-42', revision: 'rev-2' }),
        ),
      },
    })

    expect(correction.source.data.amount).toEqual(originalAmount)
    expect(correction.related?.data.amount).toEqual(correctedAmount)
    expect(correction.relation.kind).toBe('CORRECTION')
    expect(correction.auditHistory.history).toHaveLength(2)
    expect(correction.auditEvent.relationships?.[0]?.type).toBe('CORRECTS')
  })

  it('preserves domain observations across reversal, void, supersession, and joint failures', () => {
    const source = invoice('inv-42', 'ISSUED')
    const reversing = invoice('inv-42-reversal', 'ISSUED', reversalAmount)
    const successor = invoice('inv-42-v2', 'ISSUED', correctedAmount)

    const reversal = EntityEvolutionHistory.create().reverse({
      source,
      sourceRevision: 'rev-1',
      related: reversing,
      relatedRevision: 'rev-r1',
      relationId: 'evo-reversal-1',
      eligible: true,
      audit: {
        history: [originalAuditEvent],
        event: evolutionAuditEvent(
          'evt-reversal',
          'REVERSES',
          evolutionMetadata('REVERSAL', 'evo-reversal-1', { type: 'invoice', id: 'inv-42-reversal', revision: 'rev-r1' }),
        ),
      },
    })
    const afterVoid = EntityEvolutionHistory.create(reversal.evolutionHistory.relations).void({
      source,
      sourceRevision: 'rev-1',
      relationId: 'evo-void-1',
      eligible: true,
      audit: {
        history: reversal.auditHistory.history,
        event: evolutionAuditEvent('evt-void', 'VOIDS', evolutionMetadata('VOID', 'evo-void-1')),
      },
    })
    const supersession = EntityEvolutionHistory.create().supersede({
      source,
      sourceRevision: 'rev-1',
      successor,
      successorRevision: 'rev-s1',
      supersessionScope: 'tenant-a:invoice-current',
      relationId: 'evo-supersession-1',
      eligible: true,
      expectedSourceCurrent: true,
      audit: {
        history: [originalAuditEvent],
        event: evolutionAuditEvent(
          'evt-supersession',
          'SUPERSEDES',
          evolutionMetadata(
            'SUPERSESSION',
            'evo-supersession-1',
            { type: 'invoice', id: 'inv-42-v2', revision: 'rev-s1' },
            'tenant-a:invoice-current',
          ),
        ),
      },
    })

    expect(reversal.source.data.amount).toEqual(originalAmount)
    expect(reversal.related?.data.amount).toEqual(reversalAmount)
    expect(afterVoid.relation).toMatchObject({ kind: 'VOID', sourceCurrent: false })
    expect(afterVoid.auditHistory.history.map((event) => event.eventId)).toEqual([
      'evt-invoice-issued',
      'evt-reversal',
      'evt-void',
    ])
    expect(supersession.relation).toMatchObject({
      kind: 'SUPERSESSION',
      sourceCurrent: false,
      relatedCurrent: true,
      supersessionScope: 'tenant-a:invoice-current',
    })

    const evolutionHistory = EntityEvolutionHistory.create(afterVoid.evolutionHistory.relations)
    const evolutionBefore = evolutionHistory.toJSON()
    const auditBefore = afterVoid.auditHistory
    const sourceBefore = source.toJSON()
    const approvalHistory = ApprovalDecisionHistory.create([approvalForRevision('1')])
    const approvalBefore = approvalHistory.toJSON()

    expect(() =>
      evolutionHistory.correct({
        source,
        sourceRevision: 'rev-1',
        related: successor,
        relatedRevision: 'rev-s1',
        relationId: 'evo-correction-invalid',
        eligible: true,
        audit: {
          history: afterVoid.auditHistory.history,
          event: evolutionAuditEvent(
            'evt-invalid-correction',
            'REVERSES',
            evolutionMetadata('CORRECTION', 'evo-correction-invalid', { type: 'invoice', id: 'inv-42-v2', revision: 'rev-s1' }),
          ),
        },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(evolutionHistory.toJSON()).toEqual(evolutionBefore)
    expect(afterVoid.auditHistory).toEqual(auditBefore)
    expect(source.toJSON()).toEqual(sourceBefore)

    expect(() =>
      approvalHistory.withdraw(approvalRequirement, {
        target: { requirementId: 'finance-review', actorId: 'controller-1', decidedAt: '2026-09-01T11:00:00Z' },
        actor: { type: 'user', id: 'not-eligible' },
        recordedAt: '2026-09-02T12:00:00Z',
      }),
    ).toThrow()
    expect(approvalHistory.toJSON()).toEqual(approvalBefore)
  })
})
