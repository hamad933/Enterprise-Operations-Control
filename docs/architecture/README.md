# RP02 Architecture Entry Point

## Status

`NO IMPLEMENTATION ARCHITECTURE APPROVED`

This directory is the canonical repository location for durable architecture contracts after they are proposed and accepted through governed pull requests.

## Current product-level constraints

The following are stable product constraints, not an approved technical architecture:

- multi-site facilities operations and control;
- traceability from measurement or request through authority, decision, controlled action, evidence, verification, and outcome;
- explicit site, asset, team, and action scope;
- separation of duties proportionate to risk;
- KPI source and evidence lineage;
- visible denied, conflict, missing-evidence, stale-data, and rejected-verification states;
- synthetic organizational context unless a later approved contract states otherwise.

## What belongs here

When authorized, this directory may contain accepted or proposed documents covering:

- system context and trust boundaries;
- domain and bounded-context boundaries;
- authorization and scoped-access architecture;
- audit and evidence integrity;
- data ownership and lifecycle;
- integration boundaries;
- deployment and recovery topology;
- stable visual or accessibility contracts when technically relevant.

## What does not belong here

- unresolved owner decisions presented as settled architecture;
- task-specific instructions that belong in a Workstream Contract;
- copied Drive state or accepted-decision registers;
- implementation guesses based on historical snapshots;
- synthetic examples represented as client or production truth.

## Approval rule

A document in this directory is not effective merely because it is committed. Its status must be explicit, and acceptance requires the RP02 Central Controller's review plus any owner decision required by the active gate.

Use `docs/adr/` for individual architecture decisions. Reference the exact ADR status and commit from architecture documents.
