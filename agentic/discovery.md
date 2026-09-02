# Capability Discovery

A machine client should be able to obtain a collection of available operation
descriptors. Discovery is conceptual and transport-neutral in Draft 0.1. A
future adapter could expose it through MCP, OpenAPI, HTTP, a local API, a CLI, or
a tool runtime without changing operation semantics.

Illustrative, non-normative discovery data:

```json
{
  "operations": [
    {
      "id": "finflow.money.add",
      "domain": "money",
      "summary": "Adds two compatible Money values."
    },
    {
      "id": "finflow.money.round",
      "domain": "money",
      "summary": "Rounds Money using an explicit target scale and mode."
    }
  ]
}
```

At minimum, discovery communicates stable ID, domain, and purpose. A client can
then inspect the fuller contract described in [Operations](operations.md),
[Effects](effects.md), and [Errors](errors.md).

The returned collection MUST reflect the implementation's actual supported
subset. Collection order carries no meaning, and absence means the operation was
not advertised; it does not prove that an equivalent non-FinFlow API is absent.

Draft 0.1 creates no `operations.json`. A machine-readable manifest should be
added only after the descriptor model and its versioning policy are stable, with
Markdown retaining its explanatory role and one data artifact becoming the
portable registry rather than creating conflicting sources of truth.

