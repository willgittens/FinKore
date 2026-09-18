# Draft 0.7 Composition Reference Fixtures

These fixtures are non-normative Draft 0.7 reference application scenarios.
They are intentionally outside `conformance/manifest.json` and do not define a
Core conformance profile.

The fixtures are governed by:

- [Draft 0.7 Composition Profiles](../../../docs/draft-0.7-composition-profiles.md)
- [Draft 0.7 Composition Scenario Matrix](../../../docs/draft-0.7-composition-scenario-matrix.md)
- [Draft 0.7 Composition Observation Contract](../../../docs/draft-0.7-composition-observation-contract.md)

Run the fixture contract check from the repository root:

```bash
npm run composition:check:draft0.7
```

Run the implemented reference scenarios in all three languages:

```bash
npm run composition:test:draft0.7
```

The TypeScript, Python, and Java Milestone C examples execute these scenarios
through real Core APIs. `implementationStatus` is `implemented` for the
reference application fixture set; this is not a Core conformance claim.
