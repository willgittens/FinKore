// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { AGENTIC_OPERATION_IDS, CONFORMANCE_OPERATION_IDS, parseTraceabilityMetadata } from '../src/metadata.js'

describe('metadata', () => {
  it('keeps canonical Agentic ids distinct from local conformance operations', () => {
    expect([...AGENTIC_OPERATION_IDS]).toStrictEqual([
      'finkore.money.add',
      'finkore.money.subtract',
      'finkore.money.negate',
      'finkore.money.multiply',
      'finkore.money.divide',
      'finkore.money.compare',
      'finkore.money.round',
      'finkore.money.applyrate',
      'finkore.money.allocate',
      'finkore.workflow.transition',
      'finkore.audit.append',
      'finkore.audit.replace',
      'finkore.audit.remove',
      'finkore.entity.create',
      'finkore.entity.mutate',
      'finkore.entity.transition',
      'finkore.entity.evolution.correct',
      'finkore.entity.evolution.reverse',
      'finkore.entity.evolution.supersede',
      'finkore.entity.evolution.void',
    ])
    expect([...CONFORMANCE_OPERATION_IDS]).toStrictEqual([
      ...AGENTIC_OPERATION_IDS,
      'money.deserialize',
      'money.serialize',
      'workflow.create',
      'workflow.import',
      'entity.import',
      'audit.redact',
      'approval.requirement.evaluate',
      'approval.requirement.supersede',
      'approval.decision.record',
      'approval.decision.evaluate',
      'approval.decision.supersede',
      'approval.decision.withdraw',
      'approval.condition.evaluate',
      'approval.chain.evaluate',
      'approval.composition.evaluate',
    ])
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.add')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.negate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.multiply')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.divide')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.applyrate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.allocate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.audit.append')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.audit.replace')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.audit.remove')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.create')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.mutate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.transition')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.evolution.correct')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.evolution.reverse')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.evolution.supersede')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.entity.evolution.void')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('money.deserialize')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.deserialize')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.decision.withdraw')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.decision.supersede')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.requirement.supersede')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.chain.evaluate')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.condition.evaluate')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.decision.evaluate')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.decision.record')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.requirement.evaluate')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('approval.composition.evaluate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('approval.composition.evaluate')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.chain.evaluate')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.condition.evaluate')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.decision.evaluate')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.decision.record')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.decision.withdraw')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.decision.supersede')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.requirement.evaluate')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('approval.requirement.supersede')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('workflow.create')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('workflow.import')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('entity.import')).toBe(true)
    expect(CONFORMANCE_OPERATION_IDS.has('audit.redact')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('workflow.create')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('workflow.import')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('entity.import')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('audit.redact')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('money.allocate')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('money.rate.apply')).toBe(false)
    expect(AGENTIC_OPERATION_IDS.has('entity.evolution.correct')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.allocate')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.rate.apply')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('entity.evolution.correct')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('audit.append')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.negate')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.multiply')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.divide')).toBe(false)
  })

  it('extracts requirement inventory and the named critical table only', () => {
    const parsed = parseTraceabilityMetadata([
      '| MONEY-A-001 | Money | MUST | COVERED | x |',
      '## Critical financial requirements',
      '| Requirement | behavior | mutant |',
      '| --- | --- | --- |',
      '| MONEY-A-001 | exact | broken |',
      '## Next',
      '| MONEY-B-001 | unrelated | x |',
    ].join('\n'))
    expect([...parsed.requirementIds]).toEqual(['MONEY-A-001', 'MONEY-B-001'])
    expect([...parsed.criticalRequirementIds]).toEqual(['MONEY-A-001'])
  })

  it('accepts compact valid rows and ignores malformed requirement-shaped rows', () => {
    const parsed = parseTraceabilityMetadata([
      '|MONEY-ARITHMETIC-001| compact |',
      'x| MONEY-LEADING-001 | prefixed |',
      '| money-LOWER-001 | lowercase |',
      '| X-A-01 | short digits |',
      '| X-A-001x | trailing identifier text |',
      '| 1-A-001 | invalid prefix |',
      '| MONEY-ARITHMETIC-0001 | long digits |',
    ].join('\n'))
    expect([...parsed.requirementIds]).toStrictEqual(['MONEY-ARITHMETIC-001'])
    expect([...parsed.criticalRequirementIds]).toStrictEqual([])
  })

  it('rejects metadata without requirement rows', () => {
    expect(() => parseTraceabilityMetadata('# empty')).toThrow('no requirement rows')
  })
})
