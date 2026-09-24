// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import {
  EntityEvolutionHistory,
  EntityStateConflictError,
  FinancialEntity,
  InvalidAuditEventError,
  InvalidEntityIdentityError,
  InvalidEntityMutationError,
} from '../../src/index.js'

const definition = {
  type: 'invoice',
  identityScope: 'tenant-a',
  workflow: {
    states: ['DRAFT', 'ISSUED'],
    initialState: 'DRAFT',
    terminalStates: [],
    transitions: [{ source: 'DRAFT', target: 'ISSUED' }],
  },
  mutability: {
    DRAFT: ['amount', 'memo'],
    ISSUED: ['memo'],
  },
}

const sourceData = {
  amount: { amount: '100.00', currency: 'EUR' },
  memo: 'original',
}

// Include the mutation tool's replacement literal: even that caller-supplied
// opaque scope must remain distinct from currentness without a scope.
it.each(['tenant-a:invoice-current', 'Stryker was here!'])(
  'keeps scoped supersession separate from unscoped currentness (%s)', (supersessionScope) => {
    const relation = {
      relationId: 'rel-scoped', kind: 'SUPERSESSION',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
      supersessionScope, sourceCurrent: false, relatedCurrent: true, auditEventId: 'evt-scoped',
    }
    const history = EntityEvolutionHistory.create([relation])
    const before = history.toJSON()
    const result = history.correct(correctionRequest({ expectedSourceCurrent: true }))
    expect(result.relation.sourceCurrent).toBe(true)
    expect(history.toJSON()).toEqual(before)
  },
)

const correctedData = {
  amount: { amount: '99.00', currency: 'EUR' },
  memo: 'corrected',
}

const reversingData = {
  amount: { amount: '-100.00', currency: 'EUR' },
  memo: 'reversal',
}

const sourceEntity = () =>
  FinancialEntity.from(definition, {
    type: 'invoice',
    id: 'inv-10',
    state: 'ISSUED',
    data: sourceData,
  })

const correctedEntity = () =>
  FinancialEntity.from(definition, {
    type: 'invoice',
    id: 'inv-10',
    state: 'ISSUED',
    data: correctedData,
  })

const reversalEntity = () =>
  FinancialEntity.from(definition, {
    type: 'invoice',
    id: 'rev-10',
    state: 'ISSUED',
    data: reversingData,
  })

const successorEntity = () =>
  FinancialEntity.from(definition, {
    type: 'invoice',
    id: 'inv-10-v2',
    state: 'ISSUED',
    data: correctedData,
  })

const originalAuditEvent = {
  eventId: 'evt-original',
  eventType: 'ENTITY_ISSUED',
  entity: { type: 'invoice', id: 'inv-10' },
  occurredAt: '2026-09-01T10:00:00Z',
  changes: [{ path: 'amount', after: sourceData.amount }],
}

function auditEvent(
  eventId: string,
  type: 'CORRECTS' | 'REVERSES' | 'VOIDS' | 'SUPERSEDES',
  entityEvolution: Record<string, unknown>,
) {
  return {
    eventId,
    eventType: 'ENTITY_EVOLUTION_RECORDED',
    entity: { type: 'invoice', id: 'inv-10' },
    occurredAt: '2026-09-01T11:00:00Z',
    metadata: { entityEvolution },
    relationships: [
      {
        relationshipId: `audit-${eventId}`,
        type,
        target: { eventId: 'evt-original', entity: { type: 'invoice', id: 'inv-10' } },
      },
    ],
  }
}

const correctionMetadata = (relationId = 'rel-correction-1') => ({
  kind: 'CORRECTION',
  relationId,
  source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
  related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
})

function correctionRequest(overrides: Record<string, unknown> = {}) {
  const relationId = typeof overrides.relationId === 'string' ? overrides.relationId : 'rel-correction-1'
  return {
    source: sourceEntity(),
    sourceRevision: 'rev-1',
    related: correctedEntity(),
    relatedRevision: 'rev-2',
    relationId,
    eligible: true,
    audit: {
      history: [originalAuditEvent],
      event: auditEvent('evt-correction', 'CORRECTS', correctionMetadata(relationId)),
    },
    ...overrides,
  }
}

describe('Entity Evolution history', () => {
  it('records a correction with related revision and audit evidence while preserving original facts', () => {
    const history = EntityEvolutionHistory.create()
    const source = sourceEntity()
    const related = correctedEntity()
    const before = history.toJSON()
    const event = auditEvent('evt-correction', 'CORRECTS', {
      kind: 'CORRECTION',
      relationId: 'rel-correction-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
    })

    const result = history.correct({
      source,
      sourceRevision: 'rev-1',
      related,
      relatedRevision: 'rev-2',
      relationId: 'rel-correction-1',
      eligible: true,
      expectedSourceState: 'ISSUED',
      expectedSourceRevision: 'rev-1',
      expectedSourceCurrent: true,
      audit: { history: [originalAuditEvent], event },
    })

    expect(result.source.data).toEqual(sourceData)
    expect(result.related?.data).toEqual(correctedData)
    expect(result.relation).toEqual({
      relationId: 'rel-correction-1',
      kind: 'CORRECTION',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
      sourceCurrent: true,
      relatedCurrent: true,
      auditEventId: 'evt-correction',
    })
    expect(Object.hasOwn(result.relation, 'supersessionScope')).toBe(false)
    expect(result.auditHistory.history).toEqual([originalAuditEvent, event])
    expect(history.toJSON()).toEqual(before)
    expect(source.toJSON().data).toEqual(sourceData)
  })

  it('does not treat corrections as source-current invalidation for later evolution', () => {
    const correction = EntityEvolutionHistory.create().correct(correctionRequest())
    const next = EntityEvolutionHistory.create(correction.evolutionHistory.relations)

    expect(
      next.void({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        relationId: 'rel-void-after-correction',
        eligible: true,
        expectedSourceCurrent: true,
        audit: {
          history: correction.auditHistory.history,
          event: auditEvent('evt-void-after-correction', 'VOIDS', {
            kind: 'VOID',
            relationId: 'rel-void-after-correction',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          }),
        },
      }).relation,
    ).toMatchObject({ kind: 'VOID', sourceCurrent: false })
  })

  it('records reversal once for a source revision and rejects a duplicate without partial state', () => {
    const source = sourceEntity()
    const related = reversalEntity()
    const event = auditEvent('evt-reversal', 'REVERSES', {
      kind: 'REVERSAL',
      relationId: 'rel-reversal-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'rev-10', revision: 'rev-1' },
    })
    const result = EntityEvolutionHistory.create().reverse({
      source,
      sourceRevision: 'rev-1',
      related,
      relatedRevision: 'rev-1',
      relationId: 'rel-reversal-1',
      eligible: true,
      audit: { history: [originalAuditEvent], event },
    })
    const next = EntityEvolutionHistory.create(result.evolutionHistory.relations)
    const before = next.toJSON()

    expect(() =>
      next.reverse({
        source,
        sourceRevision: 'rev-1',
        related,
        relatedRevision: 'rev-2',
        relationId: 'rel-reversal-2',
        eligible: true,
        audit: {
          history: result.auditHistory.history,
          event: auditEvent('evt-reversal-2', 'REVERSES', {
            kind: 'REVERSAL',
            relationId: 'rel-reversal-2',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
            related: { type: 'invoice', id: 'rev-10', revision: 'rev-2' },
          }),
        },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(next.toJSON()).toEqual(before)
  })

  it('records void as non-current nullification without deleting the source entity or prior history', () => {
    const source = sourceEntity()
    const event = auditEvent('evt-void', 'VOIDS', {
      kind: 'VOID',
      relationId: 'rel-void-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
    })

    const result = EntityEvolutionHistory.create().void({
      source,
      sourceRevision: 'rev-1',
      relationId: 'rel-void-1',
      eligible: true,
      audit: { history: [originalAuditEvent], event },
    })

    expect(result.source).toEqual(source.toJSON())
    expect(result.relation.sourceCurrent).toBe(false)
    expect(Object.hasOwn(result.relation, 'related')).toBe(false)
    expect(Object.hasOwn(result.relation, 'relatedCurrent')).toBe(false)
    expect(Object.hasOwn(result.relation, 'supersessionScope')).toBe(false)
    expect(result.evolutionHistory.relations).toHaveLength(1)
    expect(result.auditHistory.history).toEqual([originalAuditEvent, event])
  })

  it('rejects ineligible void requests before recording audit or evolution history', () => {
    const history = EntityEvolutionHistory.create()
    const event = auditEvent('evt-void', 'VOIDS', {
      kind: 'VOID',
      relationId: 'rel-void-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
    })

    expect(() =>
      history.void({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        relationId: 'rel-void-1',
        eligible: false,
        audit: { history: [originalAuditEvent], event },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(history.toJSON()).toEqual({ relations: [] })
  })

  it('records supersession currentness inside the declared scope without rewriting either identity', () => {
    const source = sourceEntity()
    const successor = successorEntity()
    const event = auditEvent('evt-supersession', 'SUPERSEDES', {
      kind: 'SUPERSESSION',
      relationId: 'rel-supersession-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
      supersessionScope: 'tenant-a:invoice-current',
    })

    const result = EntityEvolutionHistory.create().supersede({
      source,
      sourceRevision: 'rev-1',
      successor,
      successorRevision: 'rev-1',
      supersessionScope: 'tenant-a:invoice-current',
      relationId: 'rel-supersession-1',
      eligible: true,
      expectedSourceCurrent: true,
      audit: { history: [originalAuditEvent], event },
    })

    expect(result.source.id).toBe('inv-10')
    expect(result.related?.id).toBe('inv-10-v2')
    expect(result.relation).toMatchObject({
      kind: 'SUPERSESSION',
      sourceCurrent: false,
      relatedCurrent: true,
      supersessionScope: 'tenant-a:invoice-current',
    })

    const next = EntityEvolutionHistory.create(result.evolutionHistory.relations)
    expect(() =>
      next.supersede({
        source,
        sourceRevision: 'rev-1',
        successor,
        successorRevision: 'rev-2',
        supersessionScope: 'tenant-a:invoice-current',
        relationId: 'rel-supersession-2',
        eligible: true,
        expectedSourceCurrent: true,
        audit: {
          history: result.auditHistory.history,
          event: auditEvent('evt-supersession-2', 'SUPERSEDES', {
            kind: 'SUPERSESSION',
            relationId: 'rel-supersession-2',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
            related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-2' },
            supersessionScope: 'tenant-a:invoice-current',
          }),
        },
      }),
    ).toThrow(EntityStateConflictError)
  })

  it('rejects stale state, stale revision, ineligible, malformed relation, and conflicting identity requests safely', () => {
    const history = EntityEvolutionHistory.create()
    const source = sourceEntity()
    const related = correctedEntity()
    const base = {
      source,
      sourceRevision: 'rev-1',
      related,
      relatedRevision: 'rev-2',
      relationId: 'rel-correction-1',
      eligible: true,
      audit: {
        history: [originalAuditEvent],
        event: auditEvent('evt-correction', 'CORRECTS', {
          kind: 'CORRECTION',
          relationId: 'rel-correction-1',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
        }),
      },
    }

    expect(() => history.correct({ ...base, expectedSourceState: 'DRAFT' })).toThrow(EntityStateConflictError)
    expect(() => history.correct({ ...base, expectedSourceRevision: 'rev-old' })).toThrow(EntityStateConflictError)
    expect(() => history.correct({ ...base, eligible: false })).toThrow(InvalidEntityMutationError)
    expect(() => history.correct({ ...base, relationId: '' })).toThrow(InvalidEntityIdentityError)
    expect(() => history.correct({ ...base, relatedRevision: 'inv-10' })).toThrow(InvalidEntityIdentityError)
    expect(() => history.correct({ ...base, expectedSourceCurrent: 'true' })).toThrow(InvalidEntityMutationError)
    expect(history.toJSON()).toEqual({ relations: [] })
  })

  it('rejects relation identifiers that collide with source or related revision identities', () => {
    const history = EntityEvolutionHistory.create()

    expect(() => history.correct(correctionRequest({ relationId: 'inv-10' }))).toThrow(InvalidEntityIdentityError)
    expect(() => history.correct(correctionRequest({ relationId: 'rev-1' }))).toThrow(InvalidEntityIdentityError)
    expect(() => history.correct(correctionRequest({ relationId: 'rev-2' }))).toThrow(InvalidEntityIdentityError)
    expect(() =>
      history.reverse({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        related: reversalEntity(),
        relatedRevision: 'rev-1',
        relationId: 'rev-10',
        eligible: true,
        audit: {
          history: [originalAuditEvent],
          event: auditEvent('evt-reversal', 'REVERSES', {
            kind: 'REVERSAL',
            relationId: 'rev-10',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
            related: { type: 'invoice', id: 'rev-10', revision: 'rev-1' },
          }),
        },
      }),
    ).toThrow(InvalidEntityIdentityError)
    expect(() =>
      history.void({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        relationId: 'inv-10',
        eligible: true,
        audit: {
          history: [originalAuditEvent],
          event: auditEvent('evt-void', 'VOIDS', {
            kind: 'VOID',
            relationId: 'inv-10',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          }),
        },
      }),
    ).toThrow(InvalidEntityIdentityError)
  })

  it('rejects malformed imported evolution relations without accepting unsupported concepts', () => {
    expect(() => EntityEvolutionHistory.create('not-history' as never)).toThrow(InvalidEntityMutationError)
    expect(() => EntityEvolutionHistory.create([null])).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'REPLACEMENT',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          sourceCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'REPLACEMENT',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          sourceCurrent: true,
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'VOID',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          sourceCurrent: false,
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'CORRECTION',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'SUPERSESSION',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
          sourceCurrent: false,
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'CORRECTION',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          sourceCurrent: true,
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'CORRECTION',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          sourceCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'VOID',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          sourceCurrent: false,
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 1,
          kind: 'VOID',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          sourceCurrent: false,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityIdentityError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'VOID',
          source: { type: 'invoice', id: 'inv-10', revision: 'inv-10' },
          sourceCurrent: false,
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityIdentityError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'VOID',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          sourceCurrent: 'false',
          auditEventId: 'evt-1',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      EntityEvolutionHistory.create([
        {
          relationId: 'rel-1',
          kind: 'CORRECTION',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          sourceCurrent: true,
          relatedCurrent: true,
          auditEventId: 'evt-1',
        },
        {
          relationId: 'rel-1',
          kind: 'REVERSAL',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'rev-10', revision: 'rev-1' },
          sourceCurrent: true,
          relatedCurrent: true,
          auditEventId: 'evt-2',
        },
      ]),
    ).toThrow(InvalidEntityMutationError)
  })

  it('rejects duplicate new relation identifiers against imported history', () => {
    const imported = EntityEvolutionHistory.create([
      {
        relationId: 'rel-correction-1',
        kind: 'CORRECTION',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
        sourceCurrent: true,
        relatedCurrent: true,
        auditEventId: 'evt-correction',
      },
    ])

    expect(() => imported.correct(correctionRequest())).toThrow(InvalidEntityMutationError)

    const voided = EntityEvolutionHistory.create([
      {
        relationId: 'rel-void-1',
        kind: 'VOID',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        sourceCurrent: false,
        auditEventId: 'evt-void',
      },
    ])
    expect(() =>
      voided.void({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        relationId: 'rel-void-1',
        eligible: true,
        audit: {
          history: [originalAuditEvent],
          event: auditEvent('evt-void-2', 'VOIDS', {
            kind: 'VOID',
            relationId: 'rel-void-1',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          }),
        },
      }),
    ).toThrow(InvalidEntityMutationError)

    const superseded = EntityEvolutionHistory.create([
      {
        relationId: 'rel-supersession-1',
        kind: 'SUPERSESSION',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
        supersessionScope: 'tenant-a:invoice-current',
        sourceCurrent: false,
        relatedCurrent: true,
        auditEventId: 'evt-supersession',
      },
    ])
    expect(() =>
      superseded.supersede({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        successor: successorEntity(),
        successorRevision: 'rev-2',
        supersessionScope: 'tenant-a:other-current',
        relationId: 'rel-supersession-1',
        eligible: true,
        audit: {
          history: [originalAuditEvent],
          event: auditEvent('evt-supersession-2', 'SUPERSEDES', {
            kind: 'SUPERSESSION',
            relationId: 'rel-supersession-1',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
            related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-2' },
            supersessionScope: 'tenant-a:other-current',
          }),
        },
      }),
    ).toThrow(InvalidEntityMutationError)
  })

  it('requires matching safe audit metadata and preserves the primary Audit error on rejected evidence', () => {
    const history = EntityEvolutionHistory.create()
    const source = sourceEntity()
    const related = correctedEntity()
    const malformedMetadata = auditEvent('evt-correction', 'CORRECTS', {
      kind: 'REVERSAL',
      relationId: 'rel-correction-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
    })
    const unknownTarget = auditEvent('evt-correction', 'CORRECTS', {
      kind: 'CORRECTION',
      relationId: 'rel-correction-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
    })

    expect(() =>
      history.correct({
        source,
        sourceRevision: 'rev-1',
        related,
        relatedRevision: 'rev-2',
        relationId: 'rel-correction-1',
        eligible: true,
        audit: { history: [originalAuditEvent], event: malformedMetadata },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.correct({
        source,
        sourceRevision: 'rev-1',
        related,
        relatedRevision: 'rev-2',
        relationId: 'rel-correction-1',
        eligible: true,
        audit: {
          history: [originalAuditEvent],
          event: auditEvent('evt-correction', 'CORRECTS', {
            kind: 'CORRECTION',
            relationId: 'wrong-relation',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
            related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          }),
        },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.correct({
        source,
        sourceRevision: 'rev-1',
        related,
        relatedRevision: 'rev-2',
        relationId: 'rel-correction-1',
        eligible: true,
        audit: {
          history: [],
          event: unknownTarget,
        },
      }),
    ).toThrow(InvalidAuditEventError)
    expect(history.toJSON()).toEqual({ relations: [] })
  })

  it('requires audit metadata to match source and related revision identity exactly', () => {
    const source = sourceEntity()
    const related = correctedEntity()

    for (const changed of [
      { source: { type: 'credit-note', id: 'inv-10', revision: 'rev-1' } },
      { source: { type: 'invoice', id: 'other', revision: 'rev-1' } },
      { source: { type: 'invoice', id: 'inv-10', revision: 'rev-old' } },
      { related: { type: 'credit-note', id: 'inv-10', revision: 'rev-2' } },
      { related: { type: 'invoice', id: 'other', revision: 'rev-2' } },
      { related: { type: 'invoice', id: 'inv-10', revision: 'rev-old' } },
    ]) {
      expect(() =>
        EntityEvolutionHistory.create().correct({
          source,
          sourceRevision: 'rev-1',
          related,
          relatedRevision: 'rev-2',
          relationId: 'rel-correction-1',
          eligible: true,
          audit: {
            history: [originalAuditEvent],
            event: auditEvent('evt-correction', 'CORRECTS', {
              ...correctionMetadata(),
              ...changed,
            }),
          },
        }),
      ).toThrow(InvalidEntityMutationError)
    }
  })

  it('rejects relation-specific audit metadata that is missing, extra, or malformed', () => {
    // ENTITY-EVOLUTION-034: Audit representation errors precede correspondence.
    const history = EntityEvolutionHistory.create()

    expect(() =>
      history.correct(
        correctionRequest({
          audit: {
            history: [originalAuditEvent],
            event: auditEvent('evt-correction', 'CORRECTS', { ...correctionMetadata(), supersessionScope: 'scope' }),
          },
        }),
      ),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.correct(
        correctionRequest({
          audit: {
            history: [originalAuditEvent],
            event: auditEvent('evt-correction', 'CORRECTS', { ...correctionMetadata(), related: undefined }),
          },
        }),
      ),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.void({
        source: sourceEntity(),
        sourceRevision: 'rev-1',
        relationId: 'rel-void-1',
        eligible: true,
        audit: {
          history: [originalAuditEvent],
          event: auditEvent('evt-void', 'VOIDS', {
            kind: 'VOID',
            relationId: 'rel-void-1',
            source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
            related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
          }),
        },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.correct({
        ...correctionRequest(),
        audit: (() => undefined) as never,
      }),
    ).toThrow(InvalidAuditEventError)
    expect(() =>
      history.correct({
        ...correctionRequest(),
        audit: Object.assign([], {
          history: [originalAuditEvent],
          event: auditEvent('evt-correction', 'CORRECTS', correctionMetadata()),
        }) as never,
      }),
    ).toThrow(InvalidAuditEventError)
    expect(() =>
      history.correct(
        correctionRequest({
          audit: {
            history: [originalAuditEvent],
            event: Object.assign([], auditEvent('evt-correction', 'CORRECTS', correctionMetadata())),
          },
        }),
      ),
    ).toThrow(InvalidAuditEventError)
    expect(() =>
      history.correct(
        correctionRequest({
          audit: {
            history: [originalAuditEvent],
            event: {
              ...auditEvent('evt-correction', 'CORRECTS', correctionMetadata()),
              metadata: Object.assign([], { entityEvolution: correctionMetadata() }),
            },
          },
        }),
      ),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.correct(
        correctionRequest({
          audit: {
            history: [originalAuditEvent],
            event: {
              ...auditEvent('evt-correction', 'CORRECTS', correctionMetadata()),
              relationships: [
                {
                  relationshipId: 'audit-wrong-type',
                  type: 'REVERSES',
                  target: { eventId: 'evt-original', entity: { type: 'invoice', id: 'inv-10' } },
                },
              ],
            },
          },
        }),
      ),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.correct(
        correctionRequest({
          audit: {
            history: [originalAuditEvent],
            event: {
              ...auditEvent('evt-correction', 'CORRECTS', correctionMetadata()),
              relationships: [null],
            },
          },
        }),
      ),
    ).toThrow(InvalidAuditEventError)
  })

  it('accepts audit evidence when the required relationship is one of several valid relationships', () => {
    const event = auditEvent('evt-correction', 'CORRECTS', correctionMetadata())
    const result = EntityEvolutionHistory.create().correct(
      correctionRequest({
        audit: {
          history: [originalAuditEvent],
          event: {
            ...event,
            relationships: [
              event.relationships[0],
              {
                relationshipId: 'audit-extra',
                type: 'REVERSES',
                target: { eventId: 'evt-original', entity: { type: 'invoice', id: 'inv-10' } },
              },
            ],
          },
        },
      }),
    )

    expect(result.relation.auditEventId).toBe('evt-correction')
  })

  it('reports the appended audit event rather than an earlier audit event', () => {
    const priorCorrection = auditEvent('evt-prior-correction', 'CORRECTS', {
      kind: 'CORRECTION',
      relationId: 'rel-prior',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-old' },
      related: { type: 'invoice', id: 'inv-10', revision: 'rev-prior' },
    })

    const result = EntityEvolutionHistory.create().correct(
      correctionRequest({
        audit: {
          history: [originalAuditEvent, priorCorrection],
          event: auditEvent('evt-correction', 'CORRECTS', correctionMetadata()),
        },
      }),
    )

    expect(result.auditEvent.eventId).toBe('evt-correction')
    expect(result.relation.auditEventId).toBe('evt-correction')
  })

  it('rejects missing audit relationships, mismatched audit entities, and bad supersession evidence without recording evolution', () => {
    const history = EntityEvolutionHistory.create()
    const source = sourceEntity()
    const successor = successorEntity()
    const missingRelationship = {
      eventId: 'evt-supersession',
      eventType: 'ENTITY_EVOLUTION_RECORDED',
      entity: { type: 'invoice', id: 'inv-10' },
      occurredAt: '2026-09-01T11:00:00Z',
      metadata: {
        entityEvolution: {
          kind: 'SUPERSESSION',
          relationId: 'rel-supersession-1',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
          supersessionScope: 'tenant-a:invoice-current',
        },
      },
    }
    const wrongEntity = {
      ...auditEvent('evt-supersession', 'SUPERSEDES', {
        kind: 'SUPERSESSION',
        relationId: 'rel-supersession-1',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
        supersessionScope: 'tenant-a:invoice-current',
      }),
      entity: { type: 'invoice', id: 'other' },
    }
    const wrongEntityType = {
      ...auditEvent('evt-supersession', 'SUPERSEDES', {
        kind: 'SUPERSESSION',
        relationId: 'rel-supersession-1',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
        supersessionScope: 'tenant-a:invoice-current',
      }),
      entity: { type: 'credit-note', id: 'inv-10' },
    }
    const wrongScope = auditEvent('evt-supersession', 'SUPERSEDES', {
      kind: 'SUPERSESSION',
      relationId: 'rel-supersession-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
      supersessionScope: 'wrong-scope',
    })

    for (const event of [missingRelationship, wrongScope]) {
      expect(() =>
        history.supersede({
          source,
          sourceRevision: 'rev-1',
          successor,
          successorRevision: 'rev-1',
          supersessionScope: 'tenant-a:invoice-current',
          relationId: 'rel-supersession-1',
          eligible: true,
          audit: { history: [originalAuditEvent], event },
        }),
      ).toThrow(InvalidEntityMutationError)
    }
    expect(() =>
      history.supersede({
        source,
        sourceRevision: 'rev-1',
        successor,
        successorRevision: 'rev-1',
        supersessionScope: 'tenant-a:invoice-current',
        relationId: 'rel-supersession-1',
        eligible: true,
        audit: { history: [originalAuditEvent], event: wrongEntity },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      history.supersede({
        source,
        sourceRevision: 'rev-1',
        successor,
        successorRevision: 'rev-1',
        supersessionScope: 'tenant-a:invoice-current',
        relationId: 'rel-supersession-1',
        eligible: true,
        audit: { history: [originalAuditEvent], event: wrongEntityType },
      }),
    ).toThrow(InvalidEntityMutationError)
    expect(history.toJSON()).toEqual({ relations: [] })
  })

  it('preserves currentness semantics across correction, reversal, void, and scoped supersession histories', () => {
    const correctionResult = EntityEvolutionHistory.create().correct(correctionRequest())
    const correctedHistory = EntityEvolutionHistory.create(correctionResult.evolutionHistory.relations)

    const reversalResult = correctedHistory.reverse({
      source: sourceEntity(),
      sourceRevision: 'rev-1',
      related: reversalEntity(),
      relatedRevision: 'rev-1',
      relationId: 'rel-reversal-1',
      eligible: true,
      expectedSourceCurrent: true,
      audit: {
        history: correctionResult.auditHistory.history,
        event: auditEvent('evt-reversal', 'REVERSES', {
          kind: 'REVERSAL',
          relationId: 'rel-reversal-1',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'rev-10', revision: 'rev-1' },
        }),
      },
    })
    expect(reversalResult.relation.sourceCurrent).toBe(true)

    const reversedHistory = EntityEvolutionHistory.create(reversalResult.evolutionHistory.relations)
    const secondCorrection = reversedHistory.correct(
      correctionRequest({
        relationId: 'rel-correction-2',
        audit: {
          history: reversalResult.auditHistory.history,
          event: auditEvent('evt-correction-2', 'CORRECTS', correctionMetadata('rel-correction-2')),
        },
      }),
    )
    expect(secondCorrection.relation.sourceCurrent).toBe(true)

    const voidResult = EntityEvolutionHistory.create().void({
      source: sourceEntity(),
      sourceRevision: 'rev-1',
      relationId: 'rel-void-1',
      eligible: true,
      audit: {
        history: [originalAuditEvent],
        event: auditEvent('evt-void', 'VOIDS', {
          kind: 'VOID',
          relationId: 'rel-void-1',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        }),
      },
    })
    const voidedHistory = EntityEvolutionHistory.create(voidResult.evolutionHistory.relations)
    expect(() =>
      voidedHistory.correct(
        correctionRequest({
          relationId: 'rel-after-void',
          expectedSourceCurrent: true,
          audit: {
            history: voidResult.auditHistory.history,
            event: auditEvent('evt-after-void', 'CORRECTS', correctionMetadata('rel-after-void')),
          },
        }),
      ),
    ).toThrow(EntityStateConflictError)

    const supersessionResult = EntityEvolutionHistory.create().supersede({
      source: sourceEntity(),
      sourceRevision: 'rev-1',
      successor: successorEntity(),
      successorRevision: 'rev-1',
      supersessionScope: 'tenant-a:external-current',
      relationId: 'rel-supersession-1',
      eligible: true,
      expectedSourceCurrent: true,
      audit: {
        history: [originalAuditEvent],
        event: auditEvent('evt-supersession', 'SUPERSEDES', {
          kind: 'SUPERSESSION',
          relationId: 'rel-supersession-1',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
          supersessionScope: 'tenant-a:external-current',
        }),
      },
    })
    const scopedHistory = EntityEvolutionHistory.create(supersessionResult.evolutionHistory.relations)
    const secondScope = scopedHistory.supersede({
      source: sourceEntity(),
      sourceRevision: 'rev-1',
      successor: successorEntity(),
      successorRevision: 'rev-2',
      supersessionScope: 'tenant-a:public-current',
      relationId: 'rel-supersession-2',
      eligible: true,
      expectedSourceCurrent: true,
      audit: {
        history: supersessionResult.auditHistory.history,
        event: auditEvent('evt-supersession-2', 'SUPERSEDES', {
          kind: 'SUPERSESSION',
          relationId: 'rel-supersession-2',
          source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
          related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-2' },
          supersessionScope: 'tenant-a:public-current',
        }),
      },
    })

    expect(secondScope.relation.supersessionScope).toBe('tenant-a:public-current')
  })

  it('preserves relation observation shape when importing valid histories', () => {
    const history = EntityEvolutionHistory.create([
      {
        relationId: 'rel-void-1',
        kind: 'VOID',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        sourceCurrent: false,
        auditEventId: 'evt-void',
      },
      {
        relationId: 'rel-correction-1',
        kind: 'CORRECTION',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
        related: { type: 'invoice', id: 'inv-10', revision: 'rev-3' },
        sourceCurrent: true,
        relatedCurrent: true,
        auditEventId: 'evt-correction',
      },
      {
        relationId: 'rel-supersession-1',
        kind: 'SUPERSESSION',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-3' },
        related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
        supersessionScope: 'tenant-a:invoice-current',
        sourceCurrent: false,
        relatedCurrent: true,
        auditEventId: 'evt-supersession',
      },
    ])

    expect(history.toJSON().relations).toStrictEqual([
      {
        relationId: 'rel-void-1',
        kind: 'VOID',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
        sourceCurrent: false,
        auditEventId: 'evt-void',
      },
      {
        relationId: 'rel-correction-1',
        kind: 'CORRECTION',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
        related: { type: 'invoice', id: 'inv-10', revision: 'rev-3' },
        sourceCurrent: true,
        relatedCurrent: true,
        auditEventId: 'evt-correction',
      },
      {
        relationId: 'rel-supersession-1',
        kind: 'SUPERSESSION',
        source: { type: 'invoice', id: 'inv-10', revision: 'rev-3' },
        related: { type: 'invoice', id: 'inv-10-v2', revision: 'rev-1' },
        supersessionScope: 'tenant-a:invoice-current',
        sourceCurrent: false,
        relatedCurrent: true,
        auditEventId: 'evt-supersession',
      },
    ])
  })

  it('rejects evolution observations when the platform cannot clone portable structured data', () => {
    const originalStructuredClone = globalThis.structuredClone
    globalThis.structuredClone = (() => {
      throw new DOMException('clone failed', 'DataCloneError')
    }) as typeof structuredClone

    try {
      expect(() => EntityEvolutionHistory.create()).toThrow(InvalidEntityMutationError)
      expect(() => EntityEvolutionHistory.create()).toThrow('portable structured data')
    } finally {
      globalThis.structuredClone = originalStructuredClone
    }
  })

  it('returns defensive evolution snapshots', () => {
    const history = EntityEvolutionHistory.create()
    const source = sourceEntity()
    const related = correctedEntity()
    const event = auditEvent('evt-correction', 'CORRECTS', {
      kind: 'CORRECTION',
      relationId: 'rel-correction-1',
      source: { type: 'invoice', id: 'inv-10', revision: 'rev-1' },
      related: { type: 'invoice', id: 'inv-10', revision: 'rev-2' },
    })
    const result = history.correct({
      source,
      sourceRevision: 'rev-1',
      related,
      relatedRevision: 'rev-2',
      relationId: 'rel-correction-1',
      eligible: true,
      audit: { history: [originalAuditEvent], event },
    })
    const persisted = EntityEvolutionHistory.create(result.evolutionHistory.relations)
    const snapshot = persisted.toJSON() as { relations: Array<{ source: { id: string } }> }

    snapshot.relations[0]!.source.id = 'changed'

    expect(persisted.toJSON().relations[0]?.source.id).toBe('inv-10')
  })
})

interface Vector {
  readonly id: string
  readonly operation: string
  readonly input: Record<string, unknown>
  readonly expected: { readonly status: string; readonly value?: unknown; readonly error?: { readonly code: string } }
}

// Locate shared vectors from both native runs and isolated mutation sandboxes.
let repositoryRoot = new URL('.', import.meta.url)
while (!existsSync(new URL('conformance/manifest.json', repositoryRoot))) {
  const parent = new URL('../', repositoryRoot)
  if (parent.href === repositoryRoot.href) throw new Error('Conformance manifest not found')
  repositoryRoot = parent
}
const vectors = ['evolution', 'readiness-regressions'].flatMap((name) =>
  (JSON.parse(readFileSync(new URL(`conformance/entities/${name}.json`, repositoryRoot), 'utf8')) as { vectors: Vector[] }).vectors,
)

function execute(operation: string, input: Record<string, unknown>) {
  const history = EntityEvolutionHistory.create(input.evolutionHistory as readonly unknown[])
  const source = FinancialEntity.from(input.definition, input.source)
  const request = {
    source, sourceRevision: input.sourceRevision, relationId: input.relationId, eligible: input.eligible,
    ...(Object.hasOwn(input, 'expectedSourceState') ? { expectedSourceState: input.expectedSourceState } : {}),
    ...(Object.hasOwn(input, 'expectedSourceRevision') ? { expectedSourceRevision: input.expectedSourceRevision } : {}),
    ...(Object.hasOwn(input, 'expectedSourceCurrent') ? { expectedSourceCurrent: input.expectedSourceCurrent } : {}),
    audit: { history: input.auditHistory as readonly unknown[], event: input.auditEvent },
  }
  if (operation.endsWith('.void')) return history.void(request)
  if (operation.endsWith('.supersede')) return history.supersede({ ...request, successor: FinancialEntity.from(input.definition, input.successor), successorRevision: input.successorRevision, supersessionScope: input.supersessionScope })
  const related = { ...request, related: FinancialEntity.from(input.definition, input.related), relatedRevision: input.relatedRevision }
  return operation.endsWith('.correct') ? history.correct(related) : history.reverse(related)
}

describe('Entity evolution normative regressions through native APIs', () => {
  it('rejects incompatible required Supersession effects even when assertions agree', () => {
    const reference = { type: 'invoice', id: 'invoice-1', revision: 'revision-1' }
    for (const current of [true, false]) {
      const relation = { kind: 'SUPERSESSION', relationId: 'same-key', source: reference, related: reference, sourceCurrent: current, relatedCurrent: current, supersessionScope: 'current', auditEventId: 'audit-same-key' }
      const before = structuredClone(relation)
      expect(() => EntityEvolutionHistory.create([relation])).toThrow(InvalidEntityMutationError)
      expect(relation).toStrictEqual(before)
    }
  })

  it('rejects contradictory same-step Correction and Reversal assertions', () => {
    const reference = { type: 'invoice', id: 'invoice-1', revision: 'revision-1' }
    for (const kind of ['CORRECTION', 'REVERSAL']) for (const current of [false, true]) {
      const relation = { kind, relationId: 'same-key', source: reference, related: reference, sourceCurrent: current, relatedCurrent: !current, auditEventId: 'audit-same-key' }
      expect(() => EntityEvolutionHistory.create([relation])).toThrow(InvalidEntityMutationError)
    }
  })

  it('accepts a later explicit successor-current effect and consistent same-step assertions', () => {
    const reference = (id: string) => ({ type: 'invoice', id, revision: 'revision' })
    const supersession = (id: string, source: string, related: string) => ({
      kind: 'SUPERSESSION', relationId: id, source: reference(source), related: reference(related),
      sourceCurrent: false, relatedCurrent: true, supersessionScope: 'current', auditEventId: `audit-${id}`,
    })
    const relations = [supersession('a-b', 'a', 'b'), supersession('b-c', 'b', 'c'), supersession('c-b', 'c', 'b')]
    expect(EntityEvolutionHistory.create(relations).toJSON()).toStrictEqual({ relations })
    const repeated = [{ kind: 'CORRECTION', relationId: 'same', source: reference('a'), related: reference('a'), sourceCurrent: true, relatedCurrent: true, auditEventId: 'audit-same' }]
    expect(EntityEvolutionHistory.create(repeated).toJSON()).toStrictEqual({ relations: repeated })
  })

  it('keeps opaque reference components distinct and rejects malformed reference objects', () => {
    const first = { type: 'invoice', id: 'id\u0000part', revision: 'r' }
    const second = { type: 'invoice\u0000id', id: 'part', revision: 'r' }
    const relations = [
      { kind: 'VOID', relationId: 'void', source: first, sourceCurrent: false, auditEventId: 'audit-void' },
      { kind: 'CORRECTION', relationId: 'correction', source: second, related: { ...second, revision: 'r2' }, sourceCurrent: true, relatedCurrent: true, auditEventId: 'audit-correction' },
    ]
    expect(EntityEvolutionHistory.create(relations).toJSON()).toStrictEqual({ relations })
    for (const source of [null, [], false, 1, 'reference']) {
      expect(() => EntityEvolutionHistory.create([{ ...relations[0], source }])).toThrow(InvalidEntityIdentityError)
    }
  })

  for (const vector of vectors) it(vector.id, () => {
    const input = structuredClone(vector.input)
    try {
      if (vector.expected.status === 'error') {
        expect(() => execute(vector.operation, input)).toThrowError(expect.objectContaining(vector.expected.error))
      } else expect(execute(vector.operation, input)).toEqual(vector.expected.value)
    } finally { expect(input).toEqual(vector.input) }
  })
})

describe('Entity evolution complete cross-field validation', () => {
  for (const kind of ['correct', 'reverse', 'void', 'supersede']) {
    const template = vectors.find((vector) => vector.id === `entity.evolution.${kind}.evidence-valid-control-001`)!
    for (const key of kind === 'void' ? ['source'] : ['source', kind === 'supersede' ? 'successor' : 'related']) {
      for (const valid of [false, true]) it(`${kind} ${key} within limit=${valid}`, () => {
        const input = structuredClone(template.input)
        ;(input.definition as Record<string, unknown>).validation = [{ id: 'WITHIN_LIMIT', path: 'amount', otherPath: 'limit', rule: 'money-not-greater-than' }]
        for (const name of ['source', 'related', 'successor']) {
          const entity = input[name] as { data: Record<string, unknown> } | undefined
          if (entity !== undefined) entity.data.limit = entity.data.amount
        }
        const entity = input[key] as { data: Record<string, unknown> }
        entity.data.amount = { amount: '20.00', currency: 'EUR' }
        entity.data.limit = { amount: valid ? '20.0' : '19.99', currency: 'EUR' }
        const before = structuredClone(input)
        if (valid) expect(execute(template.operation, input).source).toEqual(input.source)
        else expect(() => execute(template.operation, input)).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_VALIDATION_FAILED' }))
        expect(input).toEqual(before)
      })
    }
  }
})
