// SPDX-License-Identifier: MPL-2.0
/**
 * Accounts for the original and expanded 0.9.7 investigation leads using the
 * reviewed dispositions in plan-09.7.md. Reads exploration JSON and prints a
 * classification summary (optionally writes case dispositions). Changes no
 * implementation and defines no financial behavior; unknown leads fail closed.
 */
import fs from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {isDeepStrictEqual as equal} from 'node:util'
export function classify(c, lead, results, control) {
 const p=c.path.map(x=>typeof x==='number'?'[]':x).join('.'), op=c.operationId
 const finding=(family,code,requirements)=>({classification:'confirmed defect',family,code,requirements})
 if(lead.mutated) throw Error('Unclassified input mutation '+c.id)
 if(op==='audit.redact'&&p==='policy.id')return {classification:'contract gap',family:'D8',reason:'No normative policy identity obligation; maintainer explicitly left unresolved.'}
 if(op==='audit.redact'&&p==='history'&&c.mutation==='omit')return {classification:'permitted difference',family:'P2',reason:'Absent history and unavailable redaction target both invalidate this request; append-only priority does not specify redaction error selection.'}
 if(!lead.statusDifference&&!lead.exception){
  if(op==='approval.requirement.evaluate'&&p==='currentSubjectFacts')return finding('F7a','FINKORE_APPROVAL_INVALID_DECISION',['APPROVAL-FACT-001'])
  if(results.every(r=>r.status==='error')&&results.every(r=>equal({...r,observations:undefined},{...results[0],observations:undefined})))return {classification:'permitted difference',family:'P1',reason:'Same portable failure; optional diagnostics differ. No successful value differs; direct/native input snapshots independently test non-mutation.'}
  if(op==='entity.import'&&results.every(r=>r.status==='success')&&results.every(r=>equal({...r.value,historicalRevisions:undefined},{...results[0].value,historicalRevisions:undefined})&&(r.value.historicalRevisions===undefined||equal(r.value.historicalRevisions,[]))))return {classification:'permitted difference',family:'P3',reason:'No historical revisions supplied: absent or empty optional historicalRevisions observation, same Entity/mapping and no invented revisions.'}
 }
 if(op==='finkore.workflow.transition'&&p==='facts'&&lead.exception)return finding('F9a','FINKORE_WORKFLOW_INVALID_TRANSITION',['WORKFLOW-TRANSITION-001'])
 if(op.startsWith('finkore.entity.evolution.')&&p.startsWith('auditEvent.relationships.')&&p.endsWith('.type'))return finding('F9b','FINKORE_AUDIT_INVALID_EVENT',['AUDIT-ERROR-004','ENTITY-EVOLUTION-034'])
 if(op==='approval.condition.evaluate')return finding(p.startsWith('condition')?'F6a':'F7b',p==='facts'&&c.mutation==='omit'?'FINKORE_APPROVAL_CONDITION_UNRESOLVED':'FINKORE_APPROVAL_INVALID_DECISION',['APPROVAL-CONDITION-007','APPROVAL-FACT-002'])
 if(p==='currentSubjectFacts'||p==='relevantFactPaths')return finding('F7a','FINKORE_APPROVAL_INVALID_DECISION',['APPROVAL-FACT-001'])
 if(p==='chain.rejectionOutcome')return finding('F8a','FINKORE_APPROVAL_INVALID_CHAIN',['APPROVAL-CHAIN-007'])
 if(p.startsWith('requirement.')&&p.endsWith('Outcome'))return finding('F8a','FINKORE_APPROVAL_INVALID_DECISION',['APPROVAL-REQUIREMENT-004'])
 if(op.startsWith('approval.')&&(p.endsWith('actor.type')||p==='history'||p==='decisions'))return finding(op==='approval.composition.evaluate'?'F1':'F8a',op==='approval.composition.evaluate'?'FINKORE_APPROVAL_INVALID_CHAIN':'FINKORE_APPROVAL_INVALID_DECISION',[op==='approval.composition.evaluate'?'APPROVAL-COMPOSITION-010':p.endsWith('actor.type')?'APPROVAL-DECISION-011':'APPROVAL-DECISION-010'])
 if(p==='definition.terminalStates'||p==='definition.transitions'||p==='definition.workflow.terminalStates'||p==='definition.workflow.transitions')return finding('F8b','FINKORE_WORKFLOW_INVALID_DEFINITION',['WORKFLOW-STATES-008'])
 if(p==='instance')return finding('F8b','FINKORE_WORKFLOW_INVALID_INSTANCE',['WORKFLOW-ERROR-007'])
 if(op.includes('entity')){
  if(p==='definition.identityScope')return finding('F8c','FINKORE_ENTITY_INVALID_IDENTITY',['ENTITY-IDENTITY-007'])
  if(p.startsWith('definition.mutability'))return finding('F6b','FINKORE_ENTITY_INVALID_MUTATION',['ENTITY-MUTABILITY-008'])
  if(p==='data'||p.endsWith('.data'))return finding('F8c','FINKORE_ENTITY_VALIDATION_FAILED',['ENTITY-VALIDATION-010'])
  if(p.endsWith('.state'))return finding('F8c','FINKORE_WORKFLOW_INVALID_INSTANCE',['ENTITY-LIFECYCLE-007'])
  if(p==='changes'||p==='changes.amount')return finding('F8c','FINKORE_ENTITY_INVALID_MUTATION',['ENTITY-MUTABILITY-009'])
  if(p==='target')return finding('F8b','FINKORE_WORKFLOW_INVALID_STATE',['WORKFLOW-ERROR-007','ENTITY-ERROR-004'])
  if(p==='evolutionHistory'||p==='relationId'||p==='supersessionScope')return finding('F8c','FINKORE_ENTITY_INVALID_MUTATION',['ENTITY-EVOLUTION-024'])
  if(p==='auditHistory')return finding('F6c','FINKORE_AUDIT_INVALID_EVENT',['ENTITY-EVOLUTION-034','AUDIT-ERROR-004'])
  if(p.startsWith('entity.data.amount'))return finding('F9c','FINKORE_ENTITY_VALIDATION_FAILED',['ENTITY-VALIDATION-001','ENTITY-VALIDATION-004'])
  if(control.expected.status==='error'&&p.startsWith('definition.workflow'))return {classification:'invalid probe',family:'P4',reason:'Already-invalid Entity validator plus malformed Workflow: no total priority across unrelated Entity declarations. Isolated controls govern each defect; no new combined-error oracle.'}
 }
 throw Error('Unclassified '+c.id+' '+JSON.stringify(results.map(r=>[r.status,r.error?.code])))
}

export function classifyReport(report) {
 const cases = new Map(report.cases.map(c => [c.id, c]))
 const observations = Object.values(report.observations).map(values => new Map(values.map(v => [v.id, v.result])))
 return report.leads.map(lead => {
  const candidate = cases.get(lead.id)
  return {id: candidate.id, ...classify(candidate, lead, observations.map(o => o.get(lead.id)), cases.get(candidate.seed + '/control'))}
 })
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
 const args = process.argv.slice(2)
 const outputIndex = args.indexOf('--output')
 const output = outputIndex < 0 ? undefined : args.splice(outputIndex, 2)[1]
 if (!args.length) throw Error('Supply one or more explore-boundaries JSON reports')
 const reports = args.map(file => {
  const report = JSON.parse(fs.readFileSync(file, 'utf8'))
  const dispositions = classifyReport(report)
  const counts = {}
  for (const row of dispositions) counts[row.family] = (counts[row.family] ?? 0) + 1
  console.log(JSON.stringify({mode: report.mode, cases: report.cases.length, classified: dispositions.length, counts}))
  return {mode: report.mode, dispositions}
 })
 if (output) fs.writeFileSync(output, JSON.stringify(reports, null, 2) + '\n')
}
