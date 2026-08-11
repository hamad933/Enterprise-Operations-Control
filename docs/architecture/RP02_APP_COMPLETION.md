# RP02 Application Completion — S03–S08

## Boundary

`RP02-APP-COMPLETION-001` extends the accepted S01/S02 browser-native application through S03–S08. The runtime remains HTML, CSS, and JavaScript ES modules with synthetic in-memory data only. No framework, application runtime package, build layer, backend, database, live API, production authentication, export service, or external integration is introduced.

## Page ownership and shared shell

- `app/index.html` — S01 Executive Attention Center; accepted behavior retained with navigation into the completed application.
- `app/work-queue.html` — S02 Work Queue / Focus Task; accepted behavior retained with navigation into the completed application.
- `app/operations.html?surface=sites` — S03 Sites & Assets.
- `app/operations.html?surface=performance` — S04 Performance & KPIs.
- `app/operations.html?surface=decisions` — S05 Deviations & Decisions.
- `app/operations.html?surface=reviews` — S06 Reviews & Approvals.
- `app/operations.html?surface=reports` — S07 Reports & Audit.
- `app/operations.html?surface=administration` — S08 Administration & Access, including contextual User Profile / Access Scope.

S03–S08 intentionally share one shell, navigation model, spacing system, status language, responsive behavior, and Authority Aperture treatment rather than duplicating six page-specific applications.

## Shared data and state boundaries

`completion-data.js` contains visibly synthetic sites, assets, KPI definitions, deviations, reviews, audit events, access profiles, and delegations. `completion-state.js` owns deterministic in-session selection and transition rules. `completion-render.js` owns presentation. `completion.js` wires browser interactions. Runtime changes remain in memory and reset on reload.

Cross-site visibility is independent from action authority. Exact-site, evidence, validation, decision, review-role, and access-class checks remain independent conditions; a positive result in one condition does not bypass another.

## KPI, deviation, decision, and corrective-action relationship

The governing sequence is preserved as:

`Measure → Detect deviation → Validate → Authority / decision → Corrective action → Monitor outcome`.

A KPI definition carries Source, Scope, Period, Owner, Target, Threshold, Current observation, and Evidence / lineage. Validating a KPI-linked deviation does not automatically create a decision or corrective action. Decision authority is evaluated separately and explicitly exposes denied, out-of-scope, conflict, missing-evidence, and pending paths.

## Review and approval separation

Requester, Executor, Reviewer / Verifier, Approver / Decision Authority, and Auditor / Observer remain distinct concepts. A closure request is not final closure. A rejected verification remains unresolved and preserves rework lineage. An Approver cannot skip a required Reviewer stage merely because the record is visible or the user has broad application access.

## Audit lineage

S07 presents chronological operational events and references to work, KPI, deviation, evidence, verification, decision, and rework identifiers without duplicating entire operational records. Denial, conflict, pending-decision, and rejected-verification events remain visible in the synthetic history.

## Administration and access boundary

Application access classes remain `GUEST`, `AUTHENTICATED_USER`, and `ADMIN`, separate from operational roles. `ADMIN` represents administration of access context only and does not grant automatic operational action or decision authority. Delegations remain scoped and time-bounded in the synthetic model.

## Synthetic-data and technology boundary

All organization names, actors, identifiers, metrics, evidence labels, and events in S03–S08 are synthetic review fixtures. There is no persistence or claim of live operational truth. Browser tests may install pinned Playwright tooling ephemerally inside CI; it is not an application runtime dependency.

A future backend, database, real identity provider, persistent evidence upload, export service, device feed, or external integration must be justified by a concrete accepted requirement and opened under a separately bounded workstream with its security, data, recovery, and authority implications defined.
