# RP02 Automation — Drive Contract

## Ownership
Google Drive remains the canonical owner of RP02 governed current state, decisions, gates, accepted evidence, continuity, and release records. GitHub automation must never create a second Current State.

## Preferred interaction
`Controller / authorized Drive connector → read minimum governed state/instruction → dispatch bounded RP02 automation request → receive machine-readable evidence → Controller review → Drive update only for a meaningful Control Event.`

## Instruction references
Future mutation requests should use an opaque governed reference such as `drive:<file_id>` plus an exact digest when a trusted authenticated resolver exists. The full governed instruction must not be copied into public issue bodies merely to transport it.

## Current foundation boundary
The candidate performs no Drive API read or write. This avoids introducing Drive credentials into GitHub Actions before an explicit credential/security design is accepted.

## Future direct Drive integration gate
Any GitHub Actions → Drive API path requires explicit authority, least-privilege credentials, rotation procedure, exfiltration threat model, exact readback verification, and a rule preventing transient runtime chatter from becoming governed state.
