# SPDX-License-Identifier: MPL-2.0
"""FinKore Workflow behavior for definitions, imports, and transitions."""

from __future__ import annotations

from dataclasses import dataclass
from copy import deepcopy
from math import isfinite
import re
from typing import Any

from .errors import FinKoreError

INVALID_DEFINITION = "FINKORE_WORKFLOW_INVALID_DEFINITION"
INVALID_INSTANCE = "FINKORE_WORKFLOW_INVALID_INSTANCE"
INVALID_STATE = "FINKORE_WORKFLOW_INVALID_STATE"
INVALID_TRANSITION = "FINKORE_WORKFLOW_INVALID_TRANSITION"
GUARD_REJECTED = "FINKORE_WORKFLOW_GUARD_REJECTED"
TERMINAL_STATE = "FINKORE_WORKFLOW_TERMINAL_STATE"
VERSION_MISMATCH = "FINKORE_WORKFLOW_VERSION_MISMATCH"
STATE_CONFLICT = "FINKORE_WORKFLOW_STATE_CONFLICT"
_OMITTED = object()


def _string_list(value: Any) -> list[str] | None:
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        return None
    return value


def _opaque(value: Any) -> bool:
    return isinstance(value, str) and len(value) > 0


def _version_sequence_valid(value: Any) -> bool:
    return isinstance(value, str) and re.fullmatch(r"[1-9][0-9]*", value) is not None


def _copy_json(value: Any, ancestors: set[int] | None = None) -> Any:
    """Own guard JSON with exact built-in numeric types (WORKFLOW-GUARD-007).

    Numeric subclasses and Decimal are unsupported. Failure precedes retention;
    acyclic shared containers remain valid and are independently copied.
    """
    if value is None or type(value) in (str, bool, int):
        return value
    if type(value) is float and isfinite(value):
        return value
    if ancestors is None:
        ancestors = set()
    if id(value) in ancestors:
        raise FinKoreError(INVALID_DEFINITION)
    ancestors.add(id(value))
    try:
        if isinstance(value, list):
            return [_copy_json(item, ancestors) for item in value]
        if isinstance(value, dict) and all(isinstance(key, str) for key in value):
            return {key: _copy_json(item, ancestors) for key, item in value.items()}
        raise FinKoreError(INVALID_DEFINITION)
    finally:
        ancestors.remove(id(value))


def _binding(value: Any) -> dict[str, str] | None:
    if not isinstance(value, dict):
        return None
    definition_identity = value.get("definitionIdentity")
    version_identity = value.get("definitionVersionIdentity")
    if not _opaque(definition_identity) or not _opaque(version_identity):
        return None
    return {"definitionIdentity": definition_identity, "definitionVersionIdentity": version_identity}


def _json_equal(left: Any, right: Any) -> bool:
    """Compare supported guard fixture values using recursive JSON equality."""

    if left is None or right is None:
        return left is None and right is None
    if isinstance(left, bool) or isinstance(right, bool):
        return isinstance(left, bool) and isinstance(right, bool) and left == right
    left_is_number = isinstance(left, (int, float)) and not isinstance(left, bool)
    right_is_number = isinstance(right, (int, float)) and not isinstance(right, bool)
    if left_is_number or right_is_number:
        return left_is_number and right_is_number and left == right
    if isinstance(left, str) or isinstance(right, str):
        return isinstance(left, str) and isinstance(right, str) and left == right
    if isinstance(left, list) or isinstance(right, list):
        return (
            isinstance(left, list)
            and isinstance(right, list)
            and len(left) == len(right)
            and all(_json_equal(left_item, right_item) for left_item, right_item in zip(left, right, strict=True))
        )
    if isinstance(left, dict) or isinstance(right, dict):
        return (
            isinstance(left, dict)
            and isinstance(right, dict)
            and left.keys() == right.keys()
            and all(_json_equal(left[key], right[key]) for key in left)
        )
    return False


@dataclass(frozen=True, init=False)
class WorkflowTransition:
    """Directed Workflow transition with optional deterministic fact guards.

    @see WORKFLOW-TRANSITION-001
    @see WORKFLOW-GUARD-001
    """

    source: str
    target: str
    _guards: tuple[dict[str, Any], ...]

    def __init__(self, source: str, target: str, guards: tuple[dict[str, Any], ...] = ()) -> None:
        """Validate endpoints and own guards; malformed input raises INVALID_DEFINITION.

        The positional/keyword constructor is unchanged. Guard observations are
        defensive JSON copies, including nested objects and arrays.
        @see WORKFLOW-VERSION-003
        """
        if not isinstance(source, str) or not isinstance(target, str) or not isinstance(guards, (tuple, list)):
            raise FinKoreError(INVALID_DEFINITION)
        retained = []
        for guard in guards:
            if not isinstance(guard, dict) or not _opaque(guard.get("fact")) or "equals" not in guard:
                raise FinKoreError(INVALID_DEFINITION)
            retained.append({"fact": guard["fact"], "equals": _copy_json(guard["equals"])})
        object.__setattr__(self, "source", source)
        object.__setattr__(self, "target", target)
        object.__setattr__(self, "_guards", tuple(retained))

    @property
    def guards(self) -> tuple[dict[str, Any], ...]:
        """Return defensive JSON observations; mutations cannot change guards."""
        return deepcopy(self._guards)

    @staticmethod
    def from_portable(value: Any, states: set[str], terminal_states: set[str]) -> "WorkflowTransition":
        """Parse a transition and validate declared source, target, and guards."""

        if not isinstance(value, dict):
            raise FinKoreError(INVALID_DEFINITION)
        source = value.get("source")
        target = value.get("target")
        if not isinstance(source, str) or not isinstance(target, str) or source not in states or target not in states:
            raise FinKoreError(INVALID_DEFINITION)
        if source in terminal_states:
            raise FinKoreError(INVALID_DEFINITION)
        guards = value.get("guards", [])
        if "guard" in value:
            if guards != []:
                raise FinKoreError(INVALID_DEFINITION)
            guards = [value["guard"]]
        if not isinstance(guards, list):
            raise FinKoreError(INVALID_DEFINITION)
        return WorkflowTransition(source=source, target=target, guards=tuple(guards))

    def guards_pass(self, facts: dict[str, Any]) -> bool:
        """Evaluate guards with presence-aware, type-sensitive JSON equality.

        @see WORKFLOW-GUARD-001
        @see WORKFLOW-GUARD-002
        @see WORKFLOW-GUARD-003
        """

        return all(
            guard["fact"] in facts and _json_equal(facts[guard["fact"]], guard["equals"])
            for guard in self._guards
        )


@dataclass(frozen=True)
class WorkflowDefinition:
    """A FinKore Workflow definition with optional immutable version identity.

    @see WORKFLOW-STATES-001
    @see WORKFLOW-VERSION-001
    """

    states: tuple[str, ...]
    initial_state: str
    terminal_states: tuple[str, ...]
    transitions: tuple[WorkflowTransition, ...]
    definition_identity: str | None = None
    definition_version_identity: str | None = None

    def __post_init__(self) -> None:
        """Validate and own native declarations before exposing a definition.

        Lists and tuples are supported declaration containers. Invalid States,
        endpoints, terminal declarations, or version pairs raise INVALID_DEFINITION.
        Native None/None identities declare an unversioned definition; portable
        null identities remain malformed supplied metadata.
        @see WORKFLOW-STATES-001
        @see WORKFLOW-STATES-002
        @see WORKFLOW-TERMINAL-002
        @see WORKFLOW-VERSION-001
        """
        if not isinstance(self.states, (tuple, list)) or not self.states or any(not isinstance(state, str) for state in self.states):
            raise FinKoreError(INVALID_DEFINITION)
        if len(set(self.states)) != len(self.states) or not isinstance(self.initial_state, str) or self.initial_state not in self.states:
            raise FinKoreError(INVALID_DEFINITION)
        if not isinstance(self.terminal_states, (tuple, list)) or any(not isinstance(state, str) or state not in self.states for state in self.terminal_states):
            raise FinKoreError(INVALID_DEFINITION)
        if len(set(self.terminal_states)) != len(self.terminal_states):
            raise FinKoreError(INVALID_DEFINITION)
        if not isinstance(self.transitions, (tuple, list)) or any(not isinstance(transition, WorkflowTransition) for transition in self.transitions):
            raise FinKoreError(INVALID_DEFINITION)
        for transition in self.transitions:
            if transition.source not in self.states or transition.target not in self.states or transition.source in self.terminal_states:
                raise FinKoreError(INVALID_DEFINITION)
        if self.definition_identity is not None or self.definition_version_identity is not None:
            if not _opaque(self.definition_identity) or not _opaque(self.definition_version_identity):
                raise FinKoreError(INVALID_DEFINITION)
        object.__setattr__(self, "states", tuple(self.states))
        object.__setattr__(self, "terminal_states", tuple(self.terminal_states))
        object.__setattr__(self, "transitions", tuple(self.transitions))

    @staticmethod
    def from_portable(value: Any) -> "WorkflowDefinition":
        """Validate and retain an independent Workflow definition.

        Portable terminalStates and transitions arrays are required (WORKFLOW-STATES-008).

        ``versionSequence: "DEFAULT"`` selects positive ASCII integer validation
        of the version identity; otherwise identities stay opaque. Malformed
        guards or version metadata raise FINKORE_WORKFLOW_INVALID_DEFINITION.
        @see WORKFLOW-VERSION-003
        @see WORKFLOW-VERSION-005
        @see WORKFLOW-VERSION-006
        """

        if not isinstance(value, dict):
            raise FinKoreError(INVALID_DEFINITION)
        states = _string_list(value.get("states"))
        if states is None or len(states) == 0 or len(set(states)) != len(states):
            raise FinKoreError(INVALID_DEFINITION)
        state_set = set(states)
        initial_state = value.get("initialState")
        if not isinstance(initial_state, str) or initial_state not in state_set:
            raise FinKoreError(INVALID_DEFINITION)
        if "initialStates" in value:
            raise FinKoreError(INVALID_DEFINITION)
        terminal_states = _string_list(value.get("terminalStates"))
        if terminal_states is None or any(state not in state_set for state in terminal_states):
            raise FinKoreError(INVALID_DEFINITION)
        terminal_set = set(terminal_states)
        if len(terminal_set) != len(terminal_states):
            raise FinKoreError(INVALID_DEFINITION)

        definition_identity = value.get("definitionIdentity")
        version_identity = value.get("definitionVersionIdentity")
        if ("definitionIdentity" in value) != ("definitionVersionIdentity" in value):
            raise FinKoreError(INVALID_DEFINITION)
        if "definitionIdentity" in value and (not _opaque(definition_identity) or not _opaque(version_identity)):
            raise FinKoreError(INVALID_DEFINITION)
        if "versionSequence" in value and (value["versionSequence"] != "DEFAULT" or not _opaque(definition_identity) or not _version_sequence_valid(version_identity)):
            raise FinKoreError(INVALID_DEFINITION)

        raw_transitions = value.get("transitions")
        if not isinstance(raw_transitions, list):
            raise FinKoreError(INVALID_DEFINITION)
        transitions = tuple(WorkflowTransition.from_portable(item, state_set, terminal_set) for item in raw_transitions)
        return WorkflowDefinition(
            states=tuple(states),
            initial_state=initial_state,
            terminal_states=tuple(terminal_states),
            transitions=transitions,
            definition_identity=definition_identity,
            definition_version_identity=version_identity,
        )

    def is_versioned(self) -> bool:
        """Return whether this definition declares an immutable version binding."""

        return self.definition_identity is not None

    def binding(self) -> dict[str, str] | None:
        """Return the portable bound definition version for versioned definitions."""

        if self.definition_identity is None or self.definition_version_identity is None:
            return None
        return {"definitionIdentity": self.definition_identity, "definitionVersionIdentity": self.definition_version_identity}

    def transition(self, source: str, target: str) -> WorkflowTransition | None:
        """Find a declared directed transition from source to target."""

        for transition in self.transitions:
            if transition.source == source and transition.target == target:
                return transition
        return None


@dataclass(frozen=True, init=False)
class WorkflowInstance:
    """A FinKore Workflow instance with an owned definition-version binding.

    @see WORKFLOW-STATES-007
    @see WORKFLOW-IMPORT-004
    @see WORKFLOW-VERSION-008
    """

    current_state: str
    _bound_version: dict[str, str] | None
    revision: str | None = None

    def __init__(self, current_state: str, binding: dict[str, str] | None = None, revision: str | None = None) -> None:
        """Validate structure and own binding, preserving the positional/keyword API.

        Original input and public observations cannot change the instance's
        governing version. No binding is inferred from a later definition.
        Native None means no optional binding/revision. Malformed supplied values
        raise INVALID_INSTANCE; declared-State membership is checked at import
        or transition, after binding validation under WORKFLOW-ERROR-007.
        @see WORKFLOW-VERSION-007
        @see WORKFLOW-VERSION-008
        """
        if not isinstance(current_state, str) or (revision is not None and not _opaque(revision)):
            raise FinKoreError(INVALID_INSTANCE)
        if binding is not None and _binding(binding) is None:
            raise FinKoreError(INVALID_INSTANCE)
        object.__setattr__(self, "current_state", current_state)
        object.__setattr__(self, "_bound_version", deepcopy(binding))
        object.__setattr__(self, "revision", revision)

    @property
    def binding(self) -> dict[str, str] | None:
        """Return an independent binding observation, or None when unversioned.

        Mutating the returned dictionary does not rebind this instance.
        @see WORKFLOW-VERSION-008
        """
        return deepcopy(self._bound_version)

    @staticmethod
    def from_portable(value: Any) -> "WorkflowInstance":
        """Parse an observation; supplied null revision/binding is INVALID_INSTANCE.

        Instance structure is validated before version matching or State
        membership. Omitted revision/binding remains distinct from supplied null.
        @see WORKFLOW-ERROR-005
        @see WORKFLOW-ERROR-007
        """

        if not isinstance(value, dict) or "currentStates" in value:
            raise FinKoreError(INVALID_INSTANCE)
        current_state = value.get("currentState")
        if not isinstance(current_state, str):
            raise FinKoreError(INVALID_INSTANCE)
        revision = value.get("revision")
        if "revision" in value and not _opaque(revision):
            raise FinKoreError(INVALID_INSTANCE)
        raw_binding = value.get("binding")
        binding = None if raw_binding is None else _binding(raw_binding)
        if "binding" in value and binding is None:
            raise FinKoreError(INVALID_INSTANCE)
        return WorkflowInstance(current_state=current_state, binding=binding, revision=revision)

    def to_portable(self) -> dict[str, Any]:
        """Return the portable observation for this instance."""

        value: dict[str, Any] = {"currentState": self.current_state}
        if self.binding is not None:
            value["binding"] = dict(self.binding)
        if self.revision is not None:
            value["revision"] = self.revision
        return value


def create_workflow(definition: WorkflowDefinition) -> WorkflowInstance:
    """Create an instance in the definition's declared initial State.

    @see WORKFLOW-STATES-003
    @see WORKFLOW-VERSION-007
    """

    return WorkflowInstance(current_state=definition.initial_state, binding=definition.binding())


def import_workflow(definition: WorkflowDefinition, instance: WorkflowInstance) -> WorkflowInstance:
    """Validate and preserve an existing Workflow instance observation.

    @see WORKFLOW-IMPORT-001
    @see WORKFLOW-IMPORT-005
    """

    _validate_binding(definition, instance)
    if instance.current_state not in definition.states:
        raise FinKoreError(INVALID_STATE)
    return instance


def transition_workflow(
    definition: WorkflowDefinition,
    instance: WorkflowInstance,
    target: Any,
    facts: Any | None = None,
    expected_current_state: Any = _OMITTED,
    expected_revision: Any = _OMITTED,
) -> WorkflowInstance:
    """Request a declared Workflow transition without mutating the input instance.

    Omit an expected argument to skip that precondition. Explicit None is
    supplied input: expected_current_state=None raises INVALID_STATE and
    expected_revision=None raises STATE_CONFLICT. Definition/instance/version
    checks precede all State checks, then conflicts, terminal State, declared
    Transition, and guards. Failure preserves State, binding, and revision;
    success returns a new instance with the same owned binding and revision.

    @throws FinKoreError with the applicable FINKORE_WORKFLOW_* portable code.
    @see WORKFLOW-ERROR-007
    @see WORKFLOW-TRANSITION-006
    @see WORKFLOW-CONFLICT-001
    @see WORKFLOW-CONFLICT-004
    @see WORKFLOW-CONFLICT-007
    """

    _validate_binding(definition, instance)
    if instance.current_state not in definition.states:
        raise FinKoreError(INVALID_STATE)
    if not isinstance(target, str) or target not in definition.states:
        raise FinKoreError(INVALID_STATE)
    if expected_current_state is not _OMITTED:
        if not isinstance(expected_current_state, str) or expected_current_state not in definition.states:
            raise FinKoreError(INVALID_STATE)
        if expected_current_state != instance.current_state:
            raise FinKoreError(STATE_CONFLICT)
    if expected_revision is not _OMITTED:
        if not _opaque(expected_revision) or instance.revision != expected_revision:
            raise FinKoreError(STATE_CONFLICT)
    if instance.current_state in definition.terminal_states:
        raise FinKoreError(TERMINAL_STATE)
    transition = definition.transition(instance.current_state, target)
    if transition is None:
        raise FinKoreError(INVALID_TRANSITION)
    request_facts = facts if isinstance(facts, dict) else {}
    if not transition.guards_pass(request_facts):
        raise FinKoreError(GUARD_REJECTED)
    return WorkflowInstance(current_state=target, binding=instance.binding, revision=instance.revision)


def _validate_binding(definition: WorkflowDefinition, instance: WorkflowInstance) -> None:
    if definition.is_versioned():
        if instance.binding is None:
            raise FinKoreError(INVALID_INSTANCE)
        if instance.binding != definition.binding():
            raise FinKoreError(VERSION_MISMATCH)
    elif instance.binding is not None:
        raise FinKoreError(VERSION_MISMATCH)
