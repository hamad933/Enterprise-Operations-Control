# RP02 — Enterprise Operations Control

Private repository for `RP02 — Enterprise Operations`, a reference product for multi-site facilities operations and control.

## Current repository state

This repository contains a proposed repository-governance baseline only. It does not contain an authorized application, database schema, prototype, enterprise integration, deployment, release, or production dataset.

The product context is synthetic unless a later owner-approved contract states otherwise.

## Authority boundaries

- The Owner approves product, business, visual, risk-acceptance, and other decisions reserved by the active Google Drive gate. Owner approval is not inferred from repository activity.
- Google Drive owns governed live project-control state, approved decisions, gates, accepted evidence, release records, and continuity.
- GitHub owns repository-native instructions, branches, commits, pull requests, CI, technical artifacts, and implementation history.
- The RP02 Central Controller owns planning, bounded workstream authorization, repository-governance sufficiency, primary review, verdict reconciliation, and gate coordination.
- Executors perform only bounded authorized work and may not self-approve, merge, release, deploy, or update canonical Drive state.
- Independent reviewers provide read-only assurance against a frozen base and head when required. They may issue an assurance outcome and findings, but may not edit, merge, approve product decisions, release, deploy, or update canonical Drive state.

A repository file, independent-review outcome, CI result, or historical note does not independently authorize product implementation or merge.

## Start here

Read in this order before making changes:

1. [`AGENTS.md`](AGENTS.md) as the repository entry point.
2. The exact active Workstream Contract supplied by the RP02 Central Controller.
3. [`CONTRIBUTING.md`](CONTRIBUTING.md).
4. [`docs/governance/EXECUTION_AND_SAFETY_RULES.md`](docs/governance/EXECUTION_AND_SAFETY_RULES.md).
5. [`docs/governance/EVIDENCE_AND_HANDOFF.md`](docs/governance/EVIDENCE_AND_HANDOFF.md).
6. Only architecture, ADR, design-contract, or other repository paths explicitly named by the Workstream Contract.

Architecture entry points:

- [`docs/architecture/README.md`](docs/architecture/README.md)
- [`docs/adr/README.md`](docs/adr/README.md)

These entry points are not mandatory task context unless the active Workstream Contract names them.

## Product invariants

Future authorized work must preserve, when in scope:

```text
Measure or receive request
→ detect deviation or issue
→ validate data and evidence
→ confirm authority and scope
→ decide
→ execute controlled action
→ verify independently when required
→ preserve audit evidence
→ monitor outcome
```

Cross-site visibility does not automatically grant cross-site action authority. KPI values require source and evidence lineage. Sensitive work must not be self-closed by the executor when independent verification is required.

## Scope boundary

RP02 is not automatically a full ERP, HRMS, CMMS, generic process designer, or IoT platform. Expanding into those areas requires a separate approved product decision, ownership model, security/privacy review, integration contract, and updated evidence requirements.

## Governance bootstrap

The one-time initial `main` commit exists only because an empty Git repository has no base reference from which to create a pull-request branch. All subsequent changes must follow the branch and PR policy in `CONTRIBUTING.md`.

Workstream: `RP02-GOV-INIT-001`.
