# SPDX-License-Identifier: MPL-2.0
"""Intentional Python package surface for FinKore Core 0.9 release candidate."""

from .errors import FinKoreError
from .audit import append_event, redact_history, remove_event, replace_event
from .approvals import (
    evaluate_chain,
    evaluate_composition,
    evaluate_condition,
    evaluate_decision,
    evaluate_requirement,
    record_decision,
    supersede_decision,
    supersede_requirement,
    withdraw_decision,
)
from .entities import create_entity, evolve_entity, import_entity, import_evolution_history, mutate_entity, transition_entity
from .money import Money
from .workflow import WorkflowDefinition, WorkflowInstance, create_workflow, import_workflow, transition_workflow

CORE_VERSION = "0.9-rc"

__all__ = [
    "CORE_VERSION",
    "FinKoreError",
    "Money",
    "append_event",
    "create_entity",
    "evaluate_chain",
    "evaluate_composition",
    "evaluate_condition",
    "evaluate_decision",
    "evaluate_requirement",
    "evolve_entity",
    "import_entity",
    "import_evolution_history",
    "redact_history",
    "record_decision",
    "remove_event",
    "replace_event",
    "supersede_decision",
    "supersede_requirement",
    "mutate_entity",
    "transition_entity",
    "withdraw_decision",
    "WorkflowDefinition",
    "WorkflowInstance",
    "create_workflow",
    "import_workflow",
    "transition_workflow",
]
