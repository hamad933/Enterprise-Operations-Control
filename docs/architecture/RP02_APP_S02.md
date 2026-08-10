# RP02 Application S02 — Work Queue and Focus Task

## S02 boundary

`RP02-APP-S02-001` adds the real browser-native `RP02-S02 — Work Queue and Focus Task` surface under `app/`. It uses synthetic in-memory data only and remains within HTML, CSS, and native JavaScript ES modules.

## Extension of W01

S02 reuses the accepted W01 application shell, light operational canvas, inline SVG icon vocabulary, RTL baseline, visible-focus treatment, and explicit separation between operational visibility and exact-site action authority. S01 receives only the minimum routing behavior required to enter S02.

## Work Queue / Focus Task state separation

The queue owns search, filters, operational-scope visibility, selected action-site context, and exact task selection. The Focus Task reads the selected task and renders its scope, ownership, evidence, verification, closure, authority, lineage, and permitted next action without duplicating the complete task record into every queue row.

## Authority invariants

- Cross-site visibility does not grant cross-site action authority.
- Runtime authority evaluation distinguishes explicit task-level denial, action-site mismatch, decision restrictions, and authorized matching-site state.
- Explicit `AUTHORITY_DENIED` remains denied even when the selected action site matches the task site.
- An otherwise `AUTHORIZED` task loses action authority when the selected action site does not match and regains only its own task authority when the matching site is restored.
- No Admin bypass, self-approval, or final-closure authority is represented.

## Evidence and closure invariants

- `EVIDENCE_MISSING` blocks closure request and cannot appear successfully closed.
- A closure request transitions only to independent-verification pending state; it is not final closure.
- `VERIFICATION_REJECTED` remains unresolved and requires rework.
- Starting rework preserves rejection and closure-request lineage, changes the task to `REWORK_ACTIVE`, and invalidates pre-rejection evidence as proof of completed rework.
- S02 does not represent rework completion. While `REWORK_ACTIVE`, closure request remains disabled; actual rework completion and refreshed post-rework evidence occur outside this bounded S02 interaction before any later closure request and independent verification.

## Synthetic-data boundary

All work items, sites, actors, evidence labels, transitions, and history are synthetic. Actions mutate browser memory only. No upload persistence, backend storage, live enterprise data, external API, or integration is present.

## S03+ extension boundary

S03 and later surfaces are not implemented or pre-modeled here. Future work may extend only through a separately authorized workstream.

Backend services, databases, schemas, migrations, external integrations, live APIs, production authentication/authorization, deployment, and release remain outside this workstream.
