# Portable Errors

Agentic consumers rely on the portable error codes defined by the
[FinKore Specification](../spec/conventions.md#error-codes), not Java exception
classes, TypeScript error names, localized messages, or stack traces.

Operation descriptors enumerate normatively associated portable errors where
practical. Unless explicitly stated, a listed set is not exhaustive: component
validation may fail before the operation-specific rule is evaluated, and the
specification's error catalogs are themselves not complete. Additional safe
context may be attached under `SPEC-ERROR-003` through `SPEC-ERROR-005` without
changing code meaning.

Portable error-code compatibility is governed by the
[Specification compatibility policy](../spec/conventions.md#compatibility-policy).
Codes are stable domain-failure categories, not exception class names or
localized messages.

Core 2.0 adds `FINKORE_WORKFLOW_INVALID_CONTEXT` for a supplied non-object
`facts` value at `finkore.entity.transition`. It follows the Workflow priority
through invalid Transition and precedes guard rejection. This is the documented
major-version supersession of the Core 1.x operation contract, not an alias or
a transport error.

The following shape is illustrative and non-normative:

```json
{
  "code": "FINKORE_MONEY_CURRENCY_MISMATCH"
}
```

## Retry reasoning

The Agentic Contract defines no transport retry system. A portable error may
nevertheless show that retrying the exact request unchanged is unlikely to help.
For example, `FINKORE_MONEY_CURRENCY_MISMATCH` is a deterministic domain failure
for unchanged operands. The client must change the inputs or choose another
specified operation; repetition does not authorize implicit currency conversion.

Transient network, rate-limit, process, and service errors belong to consumer
integrations or transports and are not FinKore portable domain errors.
