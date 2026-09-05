import { describe, expect, it } from 'vitest'
import { AGENTIC_OPERATION_IDS, CONFORMANCE_OPERATION_IDS, parseTraceabilityMetadata } from '../src/metadata.js'

describe('metadata', () => {
  it('keeps canonical Agentic ids distinct from local conformance operations', () => {
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.add')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.negate')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.multiply')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.money.divide')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.audit.append')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.audit.replace')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('finkore.audit.remove')).toBe(true)
    expect(AGENTIC_OPERATION_IDS.has('money.deserialize')).toBe(false)
    expect(CONFORMANCE_OPERATION_IDS.has('money.deserialize')).toBe(true)
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
