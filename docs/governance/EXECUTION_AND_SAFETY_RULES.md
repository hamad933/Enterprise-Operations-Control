# RP02 Execution and Safety Rules

## 1. Purpose

This document contains repository-stable execution, safety, secret-handling, and prohibited-action rules. Task-specific scope belongs in the Workstream Contract.

## 2. Default state

The default authority is `NO_EXECUTION_AUTHORITY` until a bounded Workstream Contract names the repository, baseline, branch, scope, evidence, and Stop Gate.

Discovery material, historical notes, design exploration, a repository URL, or an open issue do not independently authorize implementation.

## 3. Protected boundaries

The following require explicit scope and acceptance criteria before modification:

- identity, authentication, authorization, delegation, and scoped access;
- separation of duties and independent verification;
- audit, evidence integrity, retention, and deletion;
- KPI source, lineage, thresholds, ownership, and decision linkage;
- tenant, site, branch, team, asset, and cross-site isolation;
- database schemas, migrations, destructive operations, and seed data;
- integrations, webhooks, device or IoT connections, and external APIs;
- secrets, credentials, environment configuration, deployment, and release;
- recovery, rollback, export, and backup behavior;
- final visual, IA, mobile-action, or accessibility contracts.

## 4. Prohibited actions

Unless a Workstream Contract explicitly authorizes them, do not:

- create application code, database schemas, prototypes, integrations, deployment configuration, or production infrastructure;
- use real enterprise, client, employee, asset, credential, or operational data;
- commit secrets or secret-like test values;
- weaken access checks, auditability, evidence immutability, or verification separation;
- grant action authority from cross-site visibility alone;
- treat missing or stale evidence as successful verification;
- implement automatic operational decisions without traceable authority and override rules;
- add broad ERP, HRMS, CMMS, process-designer, or IoT scope by implication;
- bypass review, CI, branch, or handoff requirements;
- rewrite shared history, delete evidence, or perform destructive migration without recovery authorization;
- merge, release, deploy, or update canonical Drive state as the executor.

## 5. Synthetic data and fixtures

- Synthetic data must be visibly synthetic and contain no copied client or production values.
- Test fixtures should use non-routable domains, obviously fictional names, and non-secret placeholder values.
- Synthetic metrics must not be presented as operational truth.
- Any future import of real or representative data requires a separate privacy, retention, and access review.

## 6. Authority and negative paths

When authority or scoped access is implemented, evidence must include both positive and negative paths, including as applicable:

- `AUTHORIZED`
- `AUTHORITY_DENIED`
- `OUT_OF_SCOPE`
- `CONFLICT`
- `EVIDENCE_MISSING`
- `VERIFICATION_REJECTED`
- `DECISION_PENDING`
- `CORRECTIVE_ACTION_OVERDUE`

Direct-object and API access must enforce the same scope as the visible UI. Hidden controls alone are not authorization.

## 7. Data and migration safety

Any authorized schema or migration work must define:

- data ownership and classification;
- forward and rollback behavior;
- backup or recovery point;
- idempotency and retry expectations;
- partial-failure handling;
- validation before and after migration;
- fixture and production-data boundaries;
- exact migration artifact and commit.

Without these items, stop with `BLOCKED_DATA_SAFETY`.

## 8. External services and dependencies

- New dependencies require a stated purpose, licensing check, security assessment, and maintenance rationale.
- External calls must define authentication, timeout, retry, rate-limit, failure, and audit behavior.
- No external integration is assumed from the RP02 product concept.
- Do not transmit repository or Drive content to unapproved services.

## 9. Unexpected findings

When an unexpected security, data, authority, scope, or architecture issue appears:

1. stop the affected change;
2. preserve minimal diagnostic evidence without exposing secrets;
3. describe the finding and impact in the handoff;
4. request a bounded contract update;
5. do not fix outside scope merely because the fix appears small.

## 10. Stop conditions

Stop and report rather than proceeding when:

- authority or scope is missing or conflicting;
- the baseline moved unexpectedly;
- required evidence cannot be tied to the exact head commit;
- a secret or real sensitive dataset is encountered;
- destructive or irreversible behavior is required but unauthorized;
- product, visual, IA, mobile, or integration decisions remain unresolved and materially affect the task;
- tests expose a material invariant violation outside the authorized correction scope.
