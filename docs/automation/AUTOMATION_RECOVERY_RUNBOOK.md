# RP02 Automation Recovery Runbook

## Foundation recovery posture
The current live-capable surface is read-only. Mutation is disabled by design. Therefore a failed shadow read must not change Jules, product code, PR #16, or governed Drive state.

## Disable procedure
1. Stop dispatching `RP02 Automation Shadow Inspect`.
2. If compromise is suspected, rotate/remove `JULES_API_KEY`.
3. Preserve the minimum run ID and sanitized evidence artifact.
4. Reconstruct GitHub workflow SHA and current Drive authority.
5. Correct through a new bounded branch/PR; never patch trusted automation directly on `main`.

## Unknown write outcome law
Future mutation code must persist WRITE_INTENT before an external write. If the response is lost, classify the effect by authoritative post-state as `APPLIED`, `NOT_APPLIED`, or `RECONCILIATION_REQUIRED`. Retry is allowed only after direct `NOT_APPLIED` proof.

## Stale branch
A stale `expected_sha` is a hard stop. Reconstruct current GitHub truth and issue a new request; do not weaken CAS/SHA checks.

## Malformed evidence
Treat incomplete or malformed evidence as `NOT_VERIFIED`; do not infer success from workflow conclusion or console prose alone.
