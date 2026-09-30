// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { isDeepStrictEqual } from 'node:util'
import { ApprovalComposition, ApprovalDecision, AuditChange, Workflow } from '../../src/index.js'

const outcomes=['NOT_APPLICABLE','PENDING','APPROVED','REJECTED'];
// APPROVAL-COMPOSITION-011/012/013/014: explicit truth tables with omission.
function combine(kind: string, values: readonly (string | undefined)[]) {
 const v=values.filter(x=>x!=='NOT_APPLICABLE');
 if(!v.length)return 'NOT_APPLICABLE';
 if(kind==='ALL_OF')return v.includes('REJECTED')?'REJECTED':v.every(x=>x==='APPROVED')?'APPROVED':'PENDING';
 return v.includes('APPROVED')?'APPROVED':v.every(x=>x==='REJECTED')?'REJECTED':'PENDING';
}
const leaf=(id: string)=>({type:'requirement',id:'m-'+id,requirementId:id});
const child=(id: string)=>({type:'group',id:'m-'+id,groupId:id});
const cases: { id: string; operationId: string; input: Record<string, unknown>; expected: { status: string; value: unknown } }[]=[];
for(let seed=0;seed<256;seed++) {
 const [a,b,c,d]=Array.from({length:4},(_,i)=>outcomes[(seed>>2*i)&3]);
 const alternative=combine('ANY_OF',[a,b]), shared=combine('ALL_OF',[b,c]);
 const first=combine('ALL_OF',[alternative,shared]);
 const stages=[first==='NOT_APPLICABLE'?'APPROVED':first,d==='NOT_APPLICABLE'?'APPROVED':d];
 const outcome=stages.find(s=>s!=='APPROVED')??'APPROVED';
 let action: string[]=[];
 if(outcome==='PENDING') {
  if(first==='PENDING') { if(alternative==='PENDING')action.push(...['a','b'].filter((_,i)=>[a,b][i]==='PENDING')); if(shared==='PENDING')action.push(...['b','c'].filter((_,i)=>[b,c][i]==='PENDING')); }
  else action=['d'];
 }
 const groups=[{id:'root',kind:'ALL_OF',members:[child('alternative'),child('shared')]},{id:'alternative',kind:'ANY_OF',members:[leaf('a'),leaf('b')]},{id:'shared',kind:'ALL_OF',members:[leaf('b'),leaf('c')]},{id:'later',kind:'ALL_OF',members:[leaf('d')]}];
 for(const reversed of [false,true]) cases.push({id:`dag-${seed}-${reversed}`,operationId:'approval.composition.evaluate',input:{composition:{stages:[{id:'first',groups:['root']},{id:'second',groups:['later']}],groups:reversed?groups.toReversed():groups},requirements:['a','b','c','d'].map((id,i)=>({id,applicability:[a,b,c,d][i]==='NOT_APPLICABLE'?'NOT_APPLICABLE':'APPLICABLE',...([a,b,c,d][i]==='NOT_APPLICABLE'?{}:{state:[a,b,c,d][i]})}))},expected:{status:'success',value:{outcome,actionableRequirements:[...new Set(action)]}}});
}
// APPROVAL-FACT-001/002/003: member order, nesting, type sensitivity, literal
// dotted own keys and irrelevant values under explicit selected paths.
const requirement={id:'r',subject:{type:'invoice',id:'i'},eligibleActors:['alice'],approvedOutcome:'APPROVED',rejectedOutcome:'REJECTED'};
for(const key of ['line','constructor','__proto__','sp ace'])for(const value of [null,false,0,17,'17',[],{nested:[1,2]}]) {
 const recorded=JSON.parse(JSON.stringify({[key]:{value},unused:1,'literal.dot':2}));
 const same=JSON.parse(JSON.stringify({'literal.dot':2,unused:1,[key]:{value}}));
 const changed=JSON.parse(JSON.stringify({...same,unused:2}));
 const decision={requirementId:'r',actor:{id:'alice'},outcome:'APPROVED',subjectFacts:recorded,decidedAt:'2026-09-01T00:00:00.123456789Z'};
 for(const [variant,facts,paths,expected]of [['same',same,undefined,'EFFECTIVE'],['changed',changed,undefined,'INEFFECTIVE'],['selected',changed,[`${key}.value`],'EFFECTIVE']]) cases.push({id:`facts-${key}-${JSON.stringify(value)}-${variant}`,operationId:'approval.decision.evaluate',input:{requirement,decision,currentSubjectFacts:facts,...(paths?{relevantFactPaths:paths}:{})},expected:{status:'success',value:expected}});
}

for (const candidate of cases) it(`review097 ${candidate.id}`, () => {
  const input = structuredClone(candidate.input)
  const before = structuredClone(input)
  const actual = candidate.operationId === 'approval.composition.evaluate'
    ? ApprovalComposition.from(input.composition).evaluate(input as never)
    : ApprovalDecision.evaluate(input.requirement, input.decision, input.currentSubjectFacts, input.relevantFactPaths as readonly string[] | undefined)
  expect(actual).toStrictEqual(candidate.expected.value)
  // Compare own constructor members as data, without matcher constructor heuristics.
  expect(isDeepStrictEqual(input, before)).toBe(true)
})

// WORKFLOW-GUARD-001/002/003/007: each type remains distinct, including null.
const guardValues = [null, false, 0, '0', [], {}, { nested: [0, null] }]
for (const [leftIndex, left] of guardValues.entries()) {
  for (const [rightIndex, right] of guardValues.entries()) {
    it(`review097 guard type pair ${leftIndex}/${rightIndex}`, () => {
      const workflow = Workflow.create({
        states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'],
        transitions: [{ source: 'DRAFT', target: 'DONE', guards: [{ fact: 'value', equals: left }] }],
      })
      const before = workflow.toJSON()
      const facts = { value: structuredClone(right) }
      if (leftIndex === rightIndex) {
        workflow.transition('DONE', { facts })
        expect(workflow.toJSON()).toStrictEqual({ ...before, currentState: 'DONE' })
      } else {
        expect(() => workflow.transition('DONE', { facts })).toThrowError(
          expect.objectContaining({ code: 'FINKORE_WORKFLOW_GUARD_REJECTED' }),
        )
        expect(workflow.toJSON()).toStrictEqual(before)
      }
      expect(facts).toStrictEqual({ value: right })
    })
  }
}

it('review097 shared aliases survive observation edits and actual Decision reuse', () => {
  const child = { value: [1, null] }
  const facts = { left: child, right: child }
  const decision = ApprovalDecision.from({
    requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED',
    subjectFacts: facts, decidedAt: '2026-09-01T00:00:00Z',
  })
  const committed = decision.toJSON()
  child.value[0] = 99
  const returned = decision.toJSON()
  ;(returned.subjectFacts as typeof facts).left.value[0] = 88
  expect(decision.toJSON()).toStrictEqual(committed)
  const imported = ApprovalDecision.from(decision.toJSON())
  expect(imported.evaluateEffectiveness(committed.subjectFacts)).toBe('EFFECTIVE')
  expect(imported.evaluateEffectiveness(facts)).toBe('INEFFECTIVE')
  expect(decision.toJSON()).toStrictEqual(committed)
})

// AUDIT-CHANGE-005/008: empty scalar/object values still have distinct JSON types.
const auditValues = [...guardValues, '']
for (const [leftIndex, before] of auditValues.entries()) {
  for (const [rightIndex, after] of auditValues.entries()) {
    it(`review097 audit type pair ${leftIndex}/${rightIndex}`, () => {
      const input = { path: 'value', before: structuredClone(before), after: structuredClone(after) }
      const snapshot = structuredClone(input)
      if (leftIndex === rightIndex) {
        expect(() => AuditChange.from(input)).toThrowError(
          expect.objectContaining({ code: 'FINKORE_AUDIT_INVALID_EVENT' }),
        )
      } else {
        let actual: unknown
        try { actual = { value: AuditChange.from(input).toJSON() } }
        catch (error) {
          if (!(error instanceof Error) || !('code' in error)) throw error
          actual = { error: error.code }
        }
        expect(actual).toStrictEqual({ value: snapshot })
      }
      expect(input).toStrictEqual(snapshot)
    })
  }
}

// WORKFLOW-GUARD-001/002/003: raw fact Arrays cannot hide differing positions.
const arrayGuardDefinition = {
  states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'],
  transitions: [{ source: 'DRAFT', target: 'DONE', guards: [{ fact: 'answer', equals: [1, null] }] }],
}
it('review097 guard fact positions dense control', () => {
  const workflow = Workflow.create(arrayGuardDefinition)
  workflow.transition('DONE', { facts: { answer: [1, null] } })
  expect(workflow.currentState).toBe('DONE')
})
for (const mode of ['hole', 'method override']) it(`review097 guard fact positions reject ${mode}`, () => {
  const workflow = Workflow.create(arrayGuardDefinition)
  const values: unknown[] = mode === 'hole' ? new Array(2) : [99, null]
  values[1] = null
  const before = structuredClone(values)
  const override = () => true
  if (mode === 'method override') Object.defineProperty(values, 'every', { value: override, configurable: true })
  let code: unknown
  try { workflow.transition('DONE', { facts: { answer: values } }) }
  catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    code = error.code
  }
  expect(code).toBe('FINKORE_WORKFLOW_GUARD_REJECTED')
  expect(workflow.currentState).toBe('DRAFT')
  if (mode === 'method override') {
    expect(Object.getOwnPropertyDescriptor(values, 'every')?.value).toBe(override)
    Reflect.deleteProperty(values, 'every')
  }
  expect(values).toStrictEqual(before)
  workflow.transition('DONE', { facts: { answer: [1, null] } })
  expect(workflow.currentState).toBe('DONE')
})
// APPROVAL-QUORUM-002/009: eligibility comes from supplied indexed identities.
for (const overridden of [false, true]) it(`review097 quorum eligibility ${overridden ? 'ignores array method overrides' : 'indexed control'}`, () => {
  const composition = ApprovalComposition.from({ rootGroup: 'q', groups: [{ id: 'q', kind: 'N_OF_M', threshold: 1,
    members: [{ id: 'm', type: 'requirement', requirementId: 'r', voter: { id: 'alice' } }] }] })
  const eligibleActors = ['alice']
  const override = () => ['intruder']
  if (overridden) Object.defineProperty(eligibleActors, 'map', { value: override, configurable: true })
  expect(composition.evaluate({
    requirements: [{ id: 'r', applicability: 'APPLICABLE', eligibleActors, approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }],
    decisions: [{ requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true }],
  })).toStrictEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  if (overridden) {
    expect(Object.getOwnPropertyDescriptor(eligibleActors, 'map')?.value).toBe(override)
    Reflect.deleteProperty(eligibleActors, 'map')
  }
  expect(eligibleActors).toStrictEqual(['alice'])
})

// APPROVAL-FACT-001/002/003: selectors are declared positions, not callbacks.
for (const overridden of [false, true]) it(`review097 fact selectors ${overridden ? 'ignore array method overrides' : 'indexed control'}`, () => {
  const decision = ApprovalDecision.from({ requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED',
    decidedAt: '2026-09-01T00:00:00Z', subjectFacts: { value: 1 } })
  const paths = ['value']
  const override = () => true
  if (overridden) Object.defineProperty(paths, 'every', { value: override, configurable: true })
  expect(decision.evaluateEffectiveness({ value: 2 }, paths)).toBe('INEFFECTIVE')
  if (overridden) {
    expect(Object.getOwnPropertyDescriptor(paths, 'every')?.value).toBe(override)
    Reflect.deleteProperty(paths, 'every')
  }
  expect(paths).toStrictEqual(['value'])
  expect(decision.toJSON().subjectFacts).toStrictEqual({ value: 1 })
})
