// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { AGENTIC_OPERATION_IDS, CONFORMANCE_OPERATION_IDS, parseTraceabilityMetadata } from '../src/metadata.js'

describe('metadata', () => {
  it('keeps canonical Agentic ids distinct from local conformance operations', () => {
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
    expect(CONFORMANCE_OPERATION_IDS.has('approval.composition.evaluate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('approval.composition.evaluate')).toBe(false)
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

  it('rejects metadata without requirement rows', () => {
    expect(() => parseTraceabilityMetadata('# empty')).toThrow('no requirement rows')
  })
})
