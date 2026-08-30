# RP02 Project-Native Automation Architecture

Status: `FOUNDATION_CANDIDATE`

## Purpose
RP02 owns its automation runtime inside `hamad933/Enterprise-Operations-Control`. UES and CEP are reference systems only; RP02 must remain independently operable. Drive remains governed state/control truth, GitHub remains technical truth, and the automation layer returns evidence rather than becoming a second Current State.

## Foundation layers
1. **Request normalization** — strict schema, unknown-key rejection, exact project/repository/default-branch/SHA binding.
2. **Authority gate** — action-specific controller rules plus repository-owner transport gate.
3. **Identity model** — separate stable request identity, canonical intent identity, and effect/write-domain identity.
4. **Idempotency model** — exact replay is safe; changed intent under the same request ID fails closed.
5. **Reconciliation model** — `APPLIED`, `NOT_APPLIED`, or `RECONCILIATION_REQUIRED`; retry is permitted only after authoritative `NOT_APPLIED` proof.
6. **Provider adapter** — `JulesReadOnlyClient` exposes GET operations only in this stage and has bounded read budget, timeout, pagination, and bounded transient read retry.
7. **Evidence layer** — redacted JSON evidence and postconditions.
8. **GitHub transport** — owner + `refs/heads/main` gate, least-privilege permissions, request serialization, exact SHA precondition, artifact upload.

## Current rollout stage
- Stage 0 Audit: completed for the minimum directly required repository/reference sources.
- Stage 1 Foundation: implemented by this candidate.
- Stage 2 Shadow Read: code path present but live execution is gated by review and `JULES_API_KEY`.
- Stages 3–9: not activated.

## Planned next layers
After independent acceptance of the foundation: durable request/effect StateStore, explicit WRITE_INTENT/RECEIPT persistence, mutation worker, authoritative reconciliation worker, trusted publication worker, bounded issue bridge only if needed, Drive reference resolver, and Controller-cycle integration. These must be separate reviewable increments rather than hidden extensions of the read path.

## Concurrency law
- Request serialization key = stable request identity.
- Effect serialization key = repository + write domain + logical task identity.
- Same request cannot execute concurrently.
- Same effect domain must serialize.
- Independent effect domains remain parallel after independence is proven.
