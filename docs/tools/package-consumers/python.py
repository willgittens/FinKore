# SPDX-License-Identifier: MPL-2.0
# Exercises installed wheel/sdist public APIs in an isolated consumer. Creates
# only in-memory observations and defines no financial behavior.
from copy import deepcopy
from decimal import Context, Decimal, Inexact, Rounded, localcontext
from finkore import CORE_VERSION, FinKoreError, Money, WorkflowDefinition, WorkflowInstance
from finkore.workflow import create_workflow, import_workflow, transition_workflow, WorkflowTransition
from finkore.entities import create_entity, transition_entity, import_entity
from finkore.approvals import record_decision, evaluate_requirement, evaluate_decision, withdraw_decision, normalize_decision_set, evaluate_composition
from finkore.audit import append_event, redact_history


def error(code, action):
    try:
        action()
    except FinKoreError as failure:
        assert failure.code == code, (failure.code, code)
    else:
        raise AssertionError('Expected ' + code)


# Composition checks execute in every installed-artifact run.
quorum097 = {'rootGroup': 'q', 'groups': [{'id': 'q', 'kind': 'N_OF_M', 'threshold': 1, 'members': [{'id': 'seat', 'type': 'requirement', 'requirementId': 'review', 'voter': {'id': 'alice'}}]}]}
evidence097 = [{'id': 'review', 'applicability': 'APPLICABLE', 'eligibleActors': ['alice'], 'approvedOutcome': 'APPROVED', 'rejectedOutcome': 'REJECTED'}]
votes097 = [{'requirementId': 'review', 'actor': {'id': 'alice'}, 'effective': True, 'outcome': 'APPROVED'}]
assert evaluate_composition(quorum097, evidence097, votes097) == {'outcome': 'APPROVED', 'actionableRequirements': []}
for field in ('eligibleActors', 'approvedOutcome', 'rejectedOutcome'):
    incomplete097 = deepcopy(evidence097)
    del incomplete097[0][field]
    before097 = deepcopy(incomplete097)
    error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(quorum097, incomplete097, votes097))
    assert incomplete097 == before097
disconnected097 = deepcopy(quorum097)
disconnected097['groups'].append({'id': 'unused', 'kind': 'ALL_OF', 'members': [{'id': 'self', 'type': 'group', 'groupId': 'unused'}]})
error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(disconnected097, evidence097, votes097))
error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(quorum097, evidence097, None))
assert evaluate_composition(quorum097, evidence097) == {'outcome': 'PENDING', 'actionableRequirements': ['review']}
import sys
if '--composition' in sys.argv:
    print('Installed Python composition checks passed')
    sys.exit(0)

assert CORE_VERSION == '0.9-rc'
for amount in (Decimal('NaN'), Decimal('sNaN'), Decimal('Infinity'), Decimal('-Infinity'), '1', 1, 1.0, True, None, [], {}):
    error('FINKORE_MONEY_INVALID_AMOUNT', lambda: Money(amount, 'EUR'))
for currency in ('', 'eur', None, [], {}):
    error('FINKORE_MONEY_INVALID_CURRENCY', lambda: Money(Decimal('1'), currency))
with localcontext(Context(prec=3)) as context:
    context.traps[Inexact] = context.traps[Rounded] = True
    before_context = repr(context)
    for text, expected in [('1E+3', '1000'), ('-0.000', '0.000'), ('-1.2300', '-1.2300'),
                           ('12345678901234567890.123456789', '12345678901234567890.123456789')]:
        native = Money(Decimal(text), 'EUR')
        assert native.to_portable() == {'amount': expected, 'currency': 'EUR'}
        assert native.add(Money(Decimal('0'), 'EUR')).amount == Decimal(text)
        assert Money.from_portable(native.to_portable()).amount == Decimal(text)
    assert Money(Decimal('1.2300'), 'EUR', 2).to_portable()['amount'] == '1.23'
    assert repr(context) == before_context
money = Money.from_portable({'amount': '1.239', 'currency': 'EUR'})
for kind in ({}, [], None, '', True, 1, 'UNKNOWN'):
    error('FINKORE_MONEY_INVALID_AMOUNT', lambda: money.apply_rate({'kind': kind, 'value': '1'}))
assert money.apply_rate({'kind': 'DECIMAL', 'value': '2'}).to_portable()['amount'] == '2.478'
error('FINKORE_MONEY_ROUNDING_REQUIRED', lambda: money.to_portable(2))
assert money.to_portable(4) == {'amount': '1.2390', 'currency': 'EUR'}
assert money.to_portable() == {'amount': '1.239', 'currency': 'EUR'}
binding = {'definitionIdentity': 'invoice-flow', 'definitionVersionIdentity': '1'}
flow = {**binding, 'states': ['DRAFT', 'REVIEW', 'DONE'], 'initialState': 'DRAFT', 'terminalStates': ['DONE'],
        'transitions': [{'source': 'DRAFT', 'target': 'REVIEW'}, {'source': 'REVIEW', 'target': 'DONE'}]}
definition = {'type': 'invoice', 'identityScope': 'tenant', 'workflow': flow, 'mutability': {'DRAFT': ['amount'], 'REVIEW': ['amount'], 'DONE': []}}
entity = create_entity(definition, 'invoice-1', {'amount': {'amount': '1.239', 'currency': 'EUR'}})
before = deepcopy(entity)
observed = transition_entity(definition, entity, 'REVIEW')
imported = import_entity(definition, {'entity': observed})['entity']
assert transition_entity(definition, imported, 'DONE')['binding'] == binding
assert entity == before
mapping = {'mappingId': ' map ', 'sourceSystem': ' legacy ', 'sourceId': ' 001 ', 'entity': {'type': entity['type'], 'id': entity['id']}}
mapped = import_entity(definition, {'entity': entity, 'identityMapping': mapping})
assert mapped['identityMapping'] == mapping and 'sourceIdentity' not in mapped
assert transition_entity(definition, mapped['entity'], 'REVIEW')['binding'] == binding
for source in (None, [], False, 1, '', {}, {'sourceSystem': ' legacy '}):
    error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: import_entity(definition, {'entity': entity, 'identityMapping': mapping, 'sourceIdentity': source}))
revision = {'type': entity['type'], 'id': entity['id'], 'revision': 'business-r1', 'current': True}
assert import_entity(definition, {'entity': entity, 'currentRevision': revision})['currentRevision'] == revision
for current in (False, None, 0, 1, 'true', [], {}):
    error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: import_entity(definition, {'entity': entity, 'currentRevision': {**revision, 'current': current}}))
error('FINKORE_ENTITY_STATE_CONFLICT', lambda: import_entity(definition, {'entity': entity, 'expectedState': None}))
error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: import_entity(definition, {'entity': entity, 'currentRevision': {'type': 'invoice', 'id': 'invoice-1', 'revision': 'r1', 'current': True}, 'conflictVersion': 'r1'}))
error('FINKORE_ENTITY_INVALID_MUTATION', lambda: create_entity({**definition, 'validation': [{'id': 'X', 'path': 'amount', 'rule': 'typo'}]}, 'invoice-2', entity['data']))
workflow_definition = WorkflowDefinition.from_portable(flow)
error('FINKORE_WORKFLOW_INVALID_DEFINITION', lambda: WorkflowDefinition(('DRAFT', 'DONE'), 'GHOST', ('DONE',), ()))
error('FINKORE_WORKFLOW_INVALID_DEFINITION', lambda: WorkflowDefinition(('DRAFT', 'DONE'), 'DRAFT', ('DONE',), (WorkflowTransition('DONE', 'DRAFT'),)))
native_definition = WorkflowDefinition(('DRAFT', 'DONE'), 'DRAFT', ('DONE',), (WorkflowTransition('DRAFT', 'DONE'),), 'native', 'v1')
native_instance = import_workflow(native_definition, create_workflow(native_definition))
assert transition_workflow(native_definition, native_instance, 'DONE').binding == native_instance.binding
error('FINKORE_WORKFLOW_INVALID_INSTANCE', lambda: WorkflowInstance('DRAFT', {}, 'r1'))
error('FINKORE_WORKFLOW_INVALID_INSTANCE', lambda: import_workflow(workflow_definition, WorkflowInstance.from_portable({'currentState': 'DRAFT', 'binding': {**binding, 'definitionVersionIdentity': 'wrong'}, 'revision': None})))
workflow = create_workflow(workflow_definition)
workflow.binding['definitionVersionIdentity'] = '2'
assert workflow.binding == binding
error('FINKORE_WORKFLOW_INVALID_STATE', lambda: transition_workflow(workflow_definition, workflow, 'REVIEW', expected_current_state=None))
composition = {'rootGroup': 'root', 'groups': [{'id': 'root', 'kind': 'ALL_OF', 'members': [{'type': 'requirement', 'id': 'member', 'requirementId': 'review'}]}]}
observations = [{'id': 'review', 'applicability': 'APPLICABLE', 'state': 'PENDING', 'requiresEvaluationContext': True}]
context = {'evaluatedAt': '2026-09-26T10:00:00Z'}
assert evaluate_composition(composition, observations, [], context) == {'outcome': 'PENDING', 'actionableRequirements': ['review']}
error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(composition, observations, {}, context))
error('FINKORE_APPROVAL_INVALID_CONTEXT', lambda: evaluate_composition(composition, observations, [], {'evaluatedAt': 'invalid'}))
error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(composition, [{'id': 'review', 'applicability': 'APPLICABLE'}]))
requirement = {'id': 'review', 'subject': {'type': 'invoice', 'id': 'invoice-1'}, 'eligibleActors': ['alice'], 'approvedOutcome': 'APPROVED', 'rejectedOutcome': 'REJECTED'}
decision = {'requirementId': 'review', 'subjectFacts': None, 'outcome': 'APPROVED', 'actor': {'id': 'alice'}, 'decidedAt': '2026-09-01T12:00:00Z'}
history = record_decision(requirement, decision, [])
assert evaluate_requirement(requirement, history) == 'APPROVED'
expires_at = '2026-09-26T10:00:00.123456789Z'
expiring = dict(decision, expiresAt=expires_at)
assert evaluate_decision(requirement, expiring, None, None, expires_at) == 'INEFFECTIVE'
error('FINKORE_APPROVAL_INVALID_CONTEXT', lambda: evaluate_decision(requirement, expiring))
error('FINKORE_APPROVAL_INVALID_DECISION', lambda: evaluate_decision(dict(requirement, id='other'), decision))
withdrawn = withdraw_decision(requirement, history, {'target': {'requirementId': 'review', 'actorId': 'alice', 'decidedAt': decision['decidedAt']}, 'actor': {'id': 'alice'}, 'recordedAt': expires_at})
assert evaluate_requirement(requirement, withdrawn) == 'PENDING'
invalid_history = deepcopy(withdrawn); invalid_history['lifecycle'][0]['type'] = 'UNKNOWN'
error('FINKORE_APPROVAL_INVALID_DECISION', lambda: normalize_decision_set(invalid_history))
assert evaluate_requirement(requirement, history) == 'APPROVED'
absent = dict(decision); del absent['subjectFacts']
error('FINKORE_APPROVAL_INVALID_DECISION', lambda: record_decision(requirement, absent, []))
event = {'eventId': 'event-1', 'eventType': 'ENTITY_CHANGED', 'entity': requirement['subject'], 'occurredAt': decision['decidedAt']}
cycle = {}; cycle['self'] = cycle
error('FINKORE_AUDIT_ACTOR_INVALID', lambda: append_event([], {**event, 'actor': {'id': 'alice', 'metadata': cycle}}))
assert append_event([], event)['history'] == [event]
audit_source = {**event, 'actor': {'id': 'alice', 'type': 'user', 'metadata': None},
                'changes': [{'path': 'secret', 'after': 'protected'}]}
audit_history = append_event([], audit_source)['history']
redaction_evidence = {**event, 'eventId': 'redacted', 'eventType': 'AUDIT_CONTENT_REDACTED'}
policy = {'authority': 'retention-policy', 'protectedPaths': ['actor.metadata', 'secret']}
before_redaction = deepcopy((audit_history, policy, redaction_evidence))
for invalid_policy in ({'protectedPaths': policy['protectedPaths']}, *({**policy, 'authority': value} for value in [None, '', 7, True, [], {}])):
    error('FINKORE_AUDIT_REDACTION_INVALID', lambda: redact_history(audit_history, invalid_policy, redaction_evidence))
assert (audit_history, policy, redaction_evidence) == before_redaction
redaction = redact_history(audit_history, policy, redaction_evidence)
assert redaction['history'] == [audit_source, redaction_evidence]
assert redaction['event']['actor'] == {'id': 'alice', 'type': 'user', 'metadata': {'presence': 'REDACTED'}}
assert redaction['event']['changes'] == [{'path': 'secret', 'after': {'presence': 'REDACTED'}}]
redaction['event']['actor']['id'] = 'edited-view'
assert (audit_history, policy, redaction_evidence) == before_redaction
# Core 0.9.7: reuse actual histories, with a distinct-instant passing control.
control097 = record_decision(requirement, dict(decision, decidedAt='2026-09-27T10:00:00Z'), withdrawn)
assert normalize_decision_set(control097) == (control097['history'], control097['lifecycle'])
before097 = deepcopy(withdrawn)
error('FINKORE_APPROVAL_INVALID_DECISION', lambda: record_decision(requirement, dict(decision, subjectFacts={'changed': True}), withdrawn))
assert withdrawn == before097
assert evaluate_requirement(requirement, history, {'changed': True}) == 'PENDING'
print('Installed Python consumer: native Money, Rate rejection, lossless serialization, binding, import identity/null, validator, Approval and Audit boundaries pass')
