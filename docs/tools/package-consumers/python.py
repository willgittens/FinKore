# SPDX-License-Identifier: MPL-2.0
# Exercises installed wheel/sdist public APIs in an isolated consumer. Creates
# only in-memory observations and defines no financial behavior.
from copy import deepcopy
from finkore import CORE_VERSION, FinKoreError, Money, WorkflowDefinition
from finkore.workflow import create_workflow, transition_workflow
from finkore.entities import create_entity, transition_entity, import_entity
from finkore.approvals import record_decision, evaluate_requirement
from finkore.audit import append_event


def error(code, action):
    try:
        action()
    except FinKoreError as failure:
        assert failure.code == code, (failure.code, code)
    else:
        raise AssertionError('Expected ' + code)


assert CORE_VERSION == '0.9-rc'
money = Money.from_portable({'amount': '1.239', 'currency': 'EUR'})
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
error('FINKORE_ENTITY_STATE_CONFLICT', lambda: import_entity(definition, {'entity': entity, 'expectedState': None}))
error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: import_entity(definition, {'entity': entity, 'currentRevision': {'type': 'invoice', 'id': 'invoice-1', 'revision': 'r1', 'current': True}, 'conflictVersion': 'r1'}))
error('FINKORE_ENTITY_INVALID_MUTATION', lambda: create_entity({**definition, 'validation': [{'id': 'X', 'path': 'amount', 'rule': 'typo'}]}, 'invoice-2', entity['data']))
workflow_definition = WorkflowDefinition.from_portable(flow)
workflow = create_workflow(workflow_definition)
workflow.binding['definitionVersionIdentity'] = '2'
assert workflow.binding == binding
error('FINKORE_WORKFLOW_INVALID_STATE', lambda: transition_workflow(workflow_definition, workflow, 'REVIEW', expected_current_state=None))
requirement = {'id': 'review', 'subject': {'type': 'invoice', 'id': 'invoice-1'}, 'eligibleActors': ['alice'], 'approvedOutcome': 'APPROVED', 'rejectedOutcome': 'REJECTED'}
decision = {'requirementId': 'review', 'subjectFacts': None, 'outcome': 'APPROVED', 'actor': {'id': 'alice'}, 'decidedAt': '2026-09-01T12:00:00Z'}
history = record_decision(requirement, decision, [])
assert evaluate_requirement(requirement, history) == 'APPROVED'
absent = dict(decision); del absent['subjectFacts']
error('FINKORE_APPROVAL_INVALID_DECISION', lambda: record_decision(requirement, absent, []))
event = {'eventId': 'event-1', 'eventType': 'ENTITY_CHANGED', 'entity': requirement['subject'], 'occurredAt': decision['decidedAt']}
cycle = {}; cycle['self'] = cycle
error('FINKORE_AUDIT_ACTOR_INVALID', lambda: append_event([], {**event, 'actor': {'id': 'alice', 'metadata': cycle}}))
assert append_event([], event)['history'] == [event]
print('Installed Python consumer: lossless serialization, binding, import identity/null, validator, Approval and Audit boundaries pass')
