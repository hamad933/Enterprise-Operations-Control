# RP02 Automation Operator Runbook

## Current supported operation
Only GET-only Jules shadow inspection is supported by the candidate. No mutation, publication, merge, release, deploy, or Drive write is performed.

## Before a shadow run
1. Reconstruct the minimum current RP02 Drive authority.
2. Read GitHub `main` full SHA directly.
3. Confirm the requested logical task is read-only and does not collide with an active writer.
4. Confirm the foundation candidate has passed independent review and has been integrated before treating the workflow as trusted.
5. Confirm `JULES_API_KEY` exists as a repository secret; never print or copy it.

## Request fields
Use a fresh stable `request_id`, the exact `logical_task_id`, authorized `controller_id`, one read action, exact current `main` SHA, and exact Jules `session_id` when required.

## Evidence
The workflow uploads `normalized_request.json`, `provider_response.json`, and `postcondition.json`. A successful run must state `operation_kind=READ_ONLY`, `provider_mutation_performed=false`, `external_effects_dispatched=0`, and the exact checked-out SHA. Console text alone is not acceptance evidence.

## Failure handling
- `STALE_BASELINE`: re-read GitHub; do not weaken the SHA check.
- `SECRET_UNAVAILABLE`: provision the repository secret; do not place it in inputs.
- `READ_FAILED`: consume provider status; a bounded read retry may occur, but no mutation follows.
- `PROVIDER_PROTOCOL_FAILED`: stop and inspect provider response shape.
- Any evidence of provider mutation: classify as a security incident and disable the shadow workflow.
