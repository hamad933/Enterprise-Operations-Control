# RP02 Automation Security Model

Status: `FOUNDATION_CANDIDATE`

## Security invariants
- Capability never implies authority.
- The foundation has no Jules POST/mutation method.
- All externally supplied request fields are parsed as data, not shell fragments.
- Unknown request fields fail closed.
- Repository, project, default branch, controller, and exact SHA are preconditions.
- `JULES_API_KEY` is read only from GitHub Actions secrets and is redacted from evidence.
- Read workflows use `contents: read` and `actions: read` only.
- Fork/PR-controlled events never receive the Jules secret because the live shadow workflow is `workflow_dispatch` and additionally requires repository owner + main.
- Unknown prior write outcome is never retryable without reconciliation.

## Threats and controls
| Threat | Foundation control | Residual / next gate |
|---|---|---|
| API-key exfiltration | secret-only runtime input, redaction tests, no echo | Live canary must verify logs/artifacts |
| GitHub token misuse | least-privilege permissions | Mutation/publication need separate minimum permissions |
| Malicious request payload | strict JSON schema, unknown-key rejection, no shell interpolation | Future issue bridge needs separate actor/schema gate |
| Prompt/instruction injection | no instruction execution in read gateway | Future mutation bridge must resolve governed opaque refs |
| Replay | stable request identity + idempotency semantics | Durable cross-run StateStore required before mutation |
| Stale SHA race | exact checkout vs `expected_sha` | Re-check immediately before future mutation/publication |
| Duplicate writer/effect | separate effect identity model | Durable effect lock required before mutation |
| Path-scope escape | foundation changes are contract-scoped | Publication worker must enforce allowed-path digest |
| Artifact leakage/tampering | redacted JSON + bounded retention | Trusted publication needs artifact identity/readback |
| Forged Controller | strict controller IDs + owner transport gate | Drive authority-reference verification remains future work |
| Dependency compromise | Python stdlib only in foundation | Pin/review any future external dependency |
| Unsafe workflow context | no `pull_request_target`; secret workflow is manual owner/main only | Maintain this invariant |

## Kill switch
Until mutation is explicitly implemented and accepted, the absence of any provider POST method is the primary mutation kill switch. If the read path is suspected, disable `rp02-automation-inspect.yml`; product code and PR #16 remain unaffected.
