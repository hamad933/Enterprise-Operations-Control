# RP02 Application S02 — Work Queue and Focus Task

## S02 boundary

`RP02-APP-S02-001` adds the real browser-native `RP02-S02 — Work Queue and Focus Task` surface under `app/`. It uses synthetic in-memory data only and remains within HTML, CSS, and native JavaScript ES modules.

## Extension of W01

S02 reuses the accepted W01 application shell, light operational canvas, inline SVG icon vocabulary, RTL baseline, visible-focus treatment, and explicit separation between operational visibility and exact-site action authority. S01 receives only the minimum routing behavior required to enter S02.

## Work Queue / Focus Task state separation

The queue owns search, filters, operational-scope visibility, selected action-site context, and exact task selection. The Focus Task reads the selected task and renders its scope, ownership, evidence, verification, closure, authority, lineage, and permitted next action without duplicating the complete task record into every queue row.

## Authority invariants

- Cross-site visibility does not grant cross-site action authority.
- `AUTHORIZED` requires both task authority and exact action-site match.
- `AUTHORITY_DENIED` and `DECISION_PENDING` remain explicit and non-bypassable in the UI.
- No Admin bypass, self-approval, or final-closure authority is represented.

## Evidence and closure invariants

- `EVIDENCE_MISSING` blocks closure request and cannot appear successfully closed.
- A closure request transitions only to independent-verification pending state; it is not final closure.
- `VERIFICATION_REJECTED` remains unresolved until rework starts.
- Rework preserves the previous rejection and lineage history.

## Synthetic-data boundary

All work items, sites, actors, evidence labels, transitions, and history are synthetic. Actions mutate browser memory only. No upload persistence, backend storage, live enterprise data, external API, or integration is present.

## S03+ extension boundary

S03 and later surfaces are not implemented or pre-modeled here. Future work may extend only through a separately authorized workstream.

Backend services, databases, schemas, migrations, external integrations, live APIs, production authentication/authorization, deployment, and release remain outside this workstream.
