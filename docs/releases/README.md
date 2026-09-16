# FinKore Release Notes

This directory records the user-facing scope and verification status of each
FinKore Core draft.

Release notes summarize what a draft contains. They are not a second
specification: `/spec` defines precise domain behavior, CoreDoc records durable
foundation rules and their evolution, `/conformance` records observable coverage,
and `/agentic` describes canonical operation semantics.

| Release | Status | Summary |
| --- | --- | --- |
| [Draft 0.1](draft-0.1.md) | Historical closed baseline | Established Money, Workflow, Audit, Approvals, and Entities. |
| [Draft 0.2](draft-0.2.md) | Closed | Added selected Money, Entity Evolution, Audit Relationship, and Approval Validity behavior. |
| [Draft 0.3](draft-0.3.md) | Closed | Added bounded Approval Composition, Workflow version/import/conflict behavior, and Entity revision/import behavior. |
| [Draft 0.4](draft-0.4.md) | Closed | Stabilized specifications and documentation for Python and Java implementation work in Draft 0.5. |
| [Draft 0.5](draft-0.5.md) | Closed | Cross-language proof release; Python passes the complete manifest scope and Java passes the complete Money scope, with Java non-Money domains explicitly unsupported. |
| [Draft 0.6](draft-0.6.md) | Closed | Portability and compatibility hardening; release evidence is reproducible, and immutable tag `core-draft-0.6` resolves to verified commit `f7c5a1857fad4f71e8cc7801cbbefde80c640bfb`. |

Draft 0.4 closure details are recorded in
[FinKore Core Draft 0.4 Closure Record](draft-0.4-closure.md).

Draft 0.5 portability details are recorded in
[FinKore Core Draft 0.5 Portability Review](draft-0.5-portability-review.md).

Developer plans are intentionally not retained as release history. Durable
normative accountability belongs with stable CoreDoc/specification identifiers;
release-level capability and verification facts belong in these notes.
