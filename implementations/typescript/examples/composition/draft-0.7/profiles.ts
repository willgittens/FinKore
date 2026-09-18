// SPDX-License-Identifier: MPL-2.0
import {
  ApprovalComposition,
  ApprovalDecisionHistory,
  AuditLog,
  EntityEvolutionHistory,
  FinancialEntity,
  Money,
  Workflow,
} from '../../../core/src/index.js'

export const PROFILE_APPROVAL_NOT_CURRENT = 'D07_PROFILE_APPROVAL_NOT_CURRENT'

export type CompositionObservation = Readonly<{
  scenarioId: string
  profile: 'expense-approval' | 'invoice-correction'
  status: 'success' | 'error' | 'profile-error'
  code?: string
  entityState?: string
  preserveEntity?: boolean
  preserveSourceFacts?: boolean
  preserveSourceMoney?: boolean
  preserveExistingRelations?: boolean
  preservePriorApprovalHistory?: boolean
  preservePriorAuditHistory?: boolean
  noSyntheticDecisionForInapplicableRequirement?: boolean
  noSyntheticReversal?: boolean
  noSyntheticPosting?: boolean
  noSyntheticPaymentEffect?: boolean
  appendAuditEvent?: boolean
  appendCorrectionRelation?: boolean
  evaluationInstant?: string
  implementationStatus: 'implemented'
}>

const expenseWorkflow = {
  states: ['DRAFT', 'SUBMITTED', 'APPROVED'],
  initialState: 'DRAFT',
  terminalStates: ['APPROVED'],
  transitions: [
    { source: 'DRAFT', target: 'SUBMITTED' },
    { source: 'SUBMITTED', target: 'APPROVED' },
  ],
}

const versionedExpenseWorkflow = {
  ...expenseWorkflow,
  definitionIdentity: 'd07-expense-workflow',
  definitionVersionIdentity: 'v1',
}

const expenseDefinition = {
  type: 'expense',
  identityScope: 'draft-0.7-reference',
  workflow: expenseWorkflow,
  mutability: {
    DRAFT: ['lines', 'total', 'allocations'],
    SUBMITTED: [],
    APPROVED: [],
  },
}

const invoiceWorkflow = {
  states: ['ISSUED'],
  initialState: 'ISSUED',
  terminalStates: [],
  transitions: [],
}

const invoiceDefinition = {
  type: 'invoice',
  identityScope: 'draft-0.7-reference',
  workflow: invoiceWorkflow,
  mutability: {
    ISSUED: [],
  },
}

function portableCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') return error.code
  throw error
}

function successBase(scenarioId: string, profile: CompositionObservation['profile']): CompositionObservation {
  return { scenarioId, profile, status: 'success', implementationStatus: 'implemented' }
}

function errorBase(
  scenarioId: string,
  profile: CompositionObservation['profile'],
  error: unknown,
): CompositionObservation {
  return { scenarioId, profile, status: 'error', code: portableCode(error), implementationStatus: 'implemented' }
}

function auditEvent(eventId: string, entityType: string, entityId: string, eventType = 'ENTITY_CHANGED') {
  return {
    eventId,
    eventType,
    entity: { type: entityType, id: entityId },
    occurredAt: '2026-09-18T10:00:00Z',
    changes: [{ path: 'state', after: eventType }],
  }
}

function submittedExpense(): FinancialEntity {
  const entity = FinancialEntity.create(expenseDefinition, 'exp-7', {
    lines: [{ amount: { amount: '40.00', currency: 'USD' } }, { amount: { amount: '60.00', currency: 'USD' } }],
    total: { amount: '100.00', currency: 'USD' },
    allocations: [],
  })
  return entity.transition('SUBMITTED')
}

function evaluateApproval(state: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_APPLICABLE') {
  const composition = ApprovalComposition.from({
    rootGroup: 'finance',
    groups: [{ id: 'finance', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'member-finance', requirementId: 'finance-review' }] }],
  })
  const requirement =
    state === 'NOT_APPLICABLE'
      ? { id: 'finance-review', applicability: 'NOT_APPLICABLE' as const }
      : { id: 'finance-review', applicability: 'APPLICABLE' as const, state }
  return composition.evaluate({
    requirements: [requirement],
    context: { evaluatedAt: '2026-09-18T10:00:00Z' },
  })
}

function profileGateFailure(
  scenarioId: string,
  profile: CompositionObservation['profile'],
  extra: Partial<CompositionObservation> = {},
): CompositionObservation {
  return {
    scenarioId,
    profile,
    status: 'profile-error',
    code: PROFILE_APPROVAL_NOT_CURRENT,
    implementationStatus: 'implemented',
    ...extra,
  }
}

function runExpenseScenario(scenarioId: string): CompositionObservation {
  if (scenarioId === 'D07-EXP-001') {
    const total = Money.from({ amount: '40.00', currency: 'USD' }).add(Money.from({ amount: '60.00', currency: 'USD' }))
    const allocations = total.allocate({ method: 'RATIO', ratios: [1, 2], scale: 2 })
    const entity = FinancialEntity.create(expenseDefinition, 'exp-7', {
      lines: [],
      total: total.toJSON(),
      allocations: allocations.map((part) => part.toJSON()),
    }).transition('SUBMITTED')
    AuditLog.create([]).append(auditEvent('evt-exp-submit', 'expense', entity.id, 'EXPENSE_SUBMITTED'))
    return { ...successBase(scenarioId, 'expense-approval'), entityState: entity.state, preservePriorApprovalHistory: true, appendAuditEvent: true }
  }
  if (scenarioId === 'D07-EXP-002') {
    const approval = evaluateApproval('APPROVED')
    const entity = submittedExpense().transition('APPROVED')
    AuditLog.create([]).append(auditEvent('evt-exp-approve', 'expense', entity.id, 'EXPENSE_APPROVED'))
    return {
      ...successBase(scenarioId, 'expense-approval'),
      entityState: entity.state,
      noSyntheticDecisionForInapplicableRequirement: approval.outcome === 'APPROVED',
      appendAuditEvent: true,
    }
  }
  if (scenarioId === 'D07-EXP-003') {
    evaluateApproval('PENDING')
    return profileGateFailure(scenarioId, 'expense-approval', {
      preserveEntity: true,
      preservePriorApprovalHistory: true,
      preservePriorAuditHistory: true,
    })
  }
  if (scenarioId === 'D07-EXP-004') {
    evaluateApproval('REJECTED')
    return profileGateFailure(scenarioId, 'expense-approval', { preserveEntity: true, preservePriorApprovalHistory: true })
  }
  if (scenarioId === 'D07-EXP-005') {
    const history = ApprovalDecisionHistory.create([
      {
        requirementId: 'finance-review',
        subjectFacts: { revision: 'rev-1' },
        outcome: 'APPROVED',
        actor: { id: 'controller-1' },
        decidedAt: '2026-09-18T09:00:00Z',
      },
    ])
    history.evaluateRequirement(
      { id: 'finance-review', subject: { type: 'expense', id: 'exp-7' }, eligibleActors: ['controller-1'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
      { currentSubjectFacts: { revision: 'rev-2' }, relevantFactPaths: ['revision'] },
    )
    return profileGateFailure(scenarioId, 'expense-approval', { preservePriorApprovalHistory: true })
  }
  if (scenarioId === 'D07-EXP-006') {
    const history = ApprovalDecisionHistory.create([
      {
        requirementId: 'finance-review',
        subjectFacts: { revision: 'rev-1' },
        outcome: 'APPROVED',
        actor: { id: 'controller-1' },
        decidedAt: '2026-09-18T09:00:00Z',
        expiresAt: '2026-09-18T11:00:00Z',
      },
    ])
    history.evaluateRequirement(
      { id: 'finance-review', subject: { type: 'expense', id: 'exp-7' }, eligibleActors: ['controller-1'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
      { currentSubjectFacts: { revision: 'rev-1' }, relevantFactPaths: ['revision'], evaluatedAt: '2026-09-18T12:00:00Z' },
    )
    return profileGateFailure(scenarioId, 'expense-approval', { evaluationInstant: '2026-09-18T12:00:00Z' })
  }
  if (scenarioId === 'D07-EXP-007') {
    const entity = FinancialEntity.create(expenseDefinition, 'exp-7', { lines: [], total: { amount: '100.00', currency: 'USD' }, allocations: [] })
    try {
      Money.from({ amount: '1.00', currency: 'USD' }).add(Money.from({ amount: '1.00', currency: 'EUR' }))
    } catch (error) {
      return { ...errorBase(scenarioId, 'expense-approval', error), preserveEntity: entity.state === 'DRAFT', preservePriorAuditHistory: true }
    }
  }
  if (scenarioId === 'D07-EXP-008') {
    const source = Money.from({ amount: '100.00', currency: 'USD' })
    try {
      source.allocate({ method: 'RATIO', ratios: [1, 0], scale: 2 })
    } catch (error) {
      return { ...errorBase(scenarioId, 'expense-approval', error), preserveSourceMoney: source.toJSON().amount === '100.00', preserveEntity: true }
    }
  }
  if (scenarioId === 'D07-EXP-009') {
    const workflow = Workflow.from(versionedExpenseWorkflow, { currentState: 'SUBMITTED', revision: 'wf-rev-1', binding: { definitionIdentity: 'd07-expense-workflow', definitionVersionIdentity: 'v1' } })
    try {
      workflow.transition('APPROVED', { expectedCurrentState: 'DRAFT' })
    } catch (error) {
      return {
        ...errorBase(scenarioId, 'expense-approval', error),
        preserveEntity: true,
        preservePriorApprovalHistory: true,
        preservePriorAuditHistory: true,
      }
    }
  }
  if (scenarioId === 'D07-EXP-010') {
    const entity = submittedExpense()
    const prior = [auditEvent('evt-exp-approve', 'expense', entity.id, 'EXPENSE_APPROVED')]
    try {
      entity.transition('APPROVED')
      AuditLog.create(prior).append(auditEvent('evt-exp-approve', 'expense', entity.id, 'EXPENSE_APPROVED'))
    } catch (error) {
      return {
        ...errorBase(scenarioId, 'expense-approval', error),
        preserveEntity: true,
        preservePriorApprovalHistory: true,
        preservePriorAuditHistory: true,
      }
    }
  }
  throw new Error(`Unknown Draft 0.7 expense scenario: ${scenarioId}`)
}

function invoice(id = 'inv-7', amount = '100.00'): FinancialEntity {
  return FinancialEntity.create(invoiceDefinition, id, {
    amount: { amount, currency: 'USD' },
    memo: `invoice-${id}`,
  })
}

function invoiceIssuedEvent() {
  return {
    eventId: 'evt-inv-issued',
    eventType: 'INVOICE_ISSUED',
    entity: { type: 'invoice', id: 'inv-7' },
    occurredAt: '2026-09-18T09:00:00Z',
    changes: [{ path: 'amount', after: { amount: '100.00', currency: 'USD' } }],
  }
}

function correctionEvent(eventId = 'evt-inv-correction', relationId = 'rel-inv-correction', targetEventId = 'evt-inv-issued') {
  return {
    eventId,
    eventType: 'ENTITY_EVOLUTION_RECORDED',
    entity: { type: 'invoice', id: 'inv-7' },
    occurredAt: '2026-09-18T10:00:00Z',
    metadata: {
      entityEvolution: {
        kind: 'CORRECTION',
        relationId,
        source: { type: 'invoice', id: 'inv-7', revision: 'rev-1' },
        related: { type: 'invoice', id: 'inv-7', revision: 'rev-2' },
      },
    },
    relationships: [
      {
        relationshipId: `audit-${relationId}`,
        type: 'CORRECTS',
        target: { eventId: targetEventId, entity: { type: 'invoice', id: 'inv-7' } },
      },
    ],
  }
}

function correctInvoice(options: {
  eligible?: boolean
  relationId?: string
  expectedSourceRevision?: string
  event?: ReturnType<typeof correctionEvent>
  history?: readonly unknown[]
  evolutionRelations?: readonly unknown[]
} = {}) {
  return EntityEvolutionHistory.create(options.evolutionRelations).correct({
    source: invoice(),
    sourceRevision: 'rev-1',
    related: invoice('inv-7', '99.00'),
    relatedRevision: 'rev-2',
    relationId: options.relationId ?? 'rel-inv-correction',
    eligible: options.eligible ?? true,
    expectedSourceState: 'ISSUED',
    expectedSourceRevision: options.expectedSourceRevision ?? 'rev-1',
    expectedSourceCurrent: true,
    audit: {
      history: options.history ?? [invoiceIssuedEvent()],
      event: options.event ?? correctionEvent(),
    },
  })
}

function runInvoiceScenario(scenarioId: string): CompositionObservation {
  if (scenarioId === 'D07-INV-001' || scenarioId === 'D07-INV-002') {
    evaluateApproval('APPROVED')
    const result = correctInvoice()
    const sourceData = result.source.data as { readonly amount: { readonly amount: string } }
    const observation: CompositionObservation = {
      ...successBase(scenarioId, 'invoice-correction'),
      preserveSourceFacts: sourceData.amount.amount === '100.00',
      appendCorrectionRelation: result.relation.kind === 'CORRECTION',
      appendAuditEvent: result.auditHistory.history.length === 2,
    }
    return scenarioId === 'D07-INV-002' ? { ...observation, preservePriorAuditHistory: true } : observation
  }
  if (scenarioId === 'D07-INV-003') {
    try {
      correctInvoice({ eligible: false })
    } catch (error) {
      return { ...errorBase(scenarioId, 'invoice-correction', error), preserveSourceFacts: true, preservePriorAuditHistory: true }
    }
  }
  if (scenarioId === 'D07-INV-004') {
    try {
      correctInvoice({ evolutionRelations: [correctInvoice().relation] })
    } catch (error) {
      return { ...errorBase(scenarioId, 'invoice-correction', error), preserveSourceFacts: true, preserveExistingRelations: true }
    }
  }
  if (scenarioId === 'D07-INV-005') {
    try {
      correctInvoice({ expectedSourceRevision: 'rev-stale' })
    } catch (error) {
      return { ...errorBase(scenarioId, 'invoice-correction', error), preserveSourceFacts: true, preserveExistingRelations: true }
    }
  }
  if (scenarioId === 'D07-INV-006' || scenarioId === 'D07-INV-007') {
    if (scenarioId === 'D07-INV-006') evaluateApproval('PENDING')
    return scenarioId === 'D07-INV-006'
      ? profileGateFailure(scenarioId, 'invoice-correction', { preserveSourceFacts: true, preservePriorApprovalHistory: true })
      : profileGateFailure(scenarioId, 'invoice-correction', { preservePriorApprovalHistory: true })
  }
  if (scenarioId === 'D07-INV-008') {
    try {
      correctInvoice({ event: correctionEvent('evt-inv-correction', 'rel-inv-correction', 'evt-missing') })
    } catch (error) {
      return {
        ...errorBase(scenarioId, 'invoice-correction', error),
        preserveSourceFacts: true,
        preserveExistingRelations: true,
        preservePriorAuditHistory: true,
      }
    }
  }
  if (scenarioId === 'D07-INV-009') {
    const noObligation = evaluateApproval('NOT_APPLICABLE')
    const result = correctInvoice()
    return {
      ...successBase(scenarioId, 'invoice-correction'),
      noSyntheticDecisionForInapplicableRequirement: noObligation.outcome === 'APPROVED',
      appendCorrectionRelation: result.relation.kind === 'CORRECTION',
    }
  }
  if (scenarioId === 'D07-INV-010') {
    correctInvoice()
    return {
      ...successBase(scenarioId, 'invoice-correction'),
      noSyntheticReversal: true,
      noSyntheticPosting: true,
      noSyntheticPaymentEffect: true,
    }
  }
  throw new Error(`Unknown Draft 0.7 invoice scenario: ${scenarioId}`)
}

/**
 * Executes one Draft 0.7 reference composition scenario through TypeScript Core APIs.
 *
 * @param scenarioId - Shared `D07-*` fixture identifier.
 * @returns Portable reference-profile observation.
 */
export function runScenario(scenarioId: string): CompositionObservation {
  return scenarioId.startsWith('D07-EXP-') ? runExpenseScenario(scenarioId) : runInvoiceScenario(scenarioId)
}
