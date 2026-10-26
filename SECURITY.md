# Security Policy

FinKore publishes a financial behavior specification, portable conformance
artifacts, an Agentic Contract, and repository-maintenance tools. It is not a
hosted financial platform. Both executable tooling defects and financial
specification defects may warrant private security reporting.

## Supported Versions

The [release notes](docs/releases/README.md) identify published Core versions;
[the specification conventions](spec/conventions.md#compatibility-policy) define
compatibility. The private maintenance package's version and conformance format
versions are separate from Core versions.

Report issues against the current published Core and repository tooling. If an
issue also affects a previous release, identify those versions and any affected
consumer behavior. Reports affecting older releases are welcome for assessment,
but FinKore has not established a security support window, long-term support
branches, or guaranteed backports. Compatibility policy does not promise a
maintenance period for previous versions.

## Reporting a Vulnerability

Use [GitHub Private Vulnerability Reporting](https://github.com/willgittens/FinKore/security/advisories/new)
as the preferred private channel. On the repository's **Security → Advisories**
page, select **Report a vulnerability**. This channel requires the maintainer to
keep Private Vulnerability Reporting enabled.

If the private form is unavailable, the maintainer must enable reporting under
**Settings → Advanced Security → Private vulnerability reporting**, or publish
an alternative private contact method here, before this channel can be
considered operational. No alternative private contact is currently documented.
Do not put vulnerability details in public Issues or Discussions as a fallback.

Include, where applicable:

- Affected Core version, repository commit, specifications, requirement IDs,
  canonical operations, tools, or dependencies.
- A minimal reproducible example, explicit inputs and context, expected
  behavior, observed behavior, and steps to reproduce.
- Relevant manifest-listed conformance vector IDs and a minimal proposed case
  if existing vectors do not expose the problem.
- Potential financial or control impact, exploit conditions, affected downstream
  behavior, and any suggested correction or mitigation.

Use synthetic examples and remove credentials, personal data, and confidential
financial records before submitting a report. Consumer implementation defects
should also be reported privately to the affected implementation's maintainer.

## Scope

### Technical vulnerabilities

Repository tooling, dependencies, CI workflows, automation, scripts, and other
executable components are in scope when they could compromise repository
integrity or affect people running the tools.

### Financial specification vulnerabilities

Report defects involving monetary precision or rounding, approval integrity,
workflow state transitions, audit trail correctness, financial entity lifecycle
rules, atomicity or failure behavior, and inconsistent conformance expectations.

A specification defect can cause serious downstream financial or control
failures even when it is not a conventional software security vulnerability.
The specification is authoritative; inconsistent vectors expose a problem to
investigate rather than establishing a new financial rule.

## Disclosure Policy

Potentially exploitable vulnerabilities should be reported privately first,
rather than through public Issues or Discussions. Coordinate public disclosure
with the maintainer so the impact, affected artifacts, and available corrections
can be explained accurately and affected consumers can prepare.

Ordinary questions and non-sensitive improvements may use public contribution
channels. When exploitability or financial impact is uncertain, use the private
reporting channel for initial assessment. This policy promises no response time,
service-level agreement, or remediation deadline.

## Security Limitations

- FinKore does not certify the security of consumer implementations.
- Passing conformance tests is not equivalent to a security audit. Repository
  verification validates artifacts and does not execute consumer implementations.
- Application-level security, including authorization, secrets, storage,
  deployment, and operational controls, remains the responsibility of adopters.
- FinKore provides normative financial behavior, not a complete security
  architecture.
