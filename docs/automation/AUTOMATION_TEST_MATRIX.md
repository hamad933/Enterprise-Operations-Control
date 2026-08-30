# RP02 Automation Test Matrix

Status: `FOUNDATION`

| Area | Cases implemented now | Later acceptance gate |
|---|---|---|
| Schema | valid read, source inspection, unknown field, irrelevant action field, malformed SHA, missing session ID, wrong repository | mutation/publication action-specific fields |
| Authority | owner transport, non-owner rejection, reviewer mutation denial | Drive authority refs, lane/write-domain registry |
| Identity | request identity, intent digest, separate effect identity | durable cross-run registry |
| Idempotency | exact replay, changed replay conflict | concurrent duplicate with durable StateStore |
| Reconciliation | applied, proven not-applied, unknown | live lost-response canary |
| Secrets | key-name redaction, value redaction, source scan | live log/artifact leak canary |
| Jules read safety | no mutation API surface, malformed provider JSON, incomplete pagination, repeated page token, malformed/cross-session activity identity | timeout/rate-limit fixtures, live read canary, provider source-binding proof |
| Publication | not implemented | changed-path digest, stale branch, duplicate publication, exact remote readback |
| Concurrency | deterministic request/effect keys | workflow-level same-effect serialization and independent-domain parallelism |
| Recovery | mutation absent/kill-by-design, failed reads emit fail-closed classification/evidence path | interrupted mutation, StateStore recovery, publication recovery |

## Required commands
`python -m compileall -q tools/rp02_automation tests/rp02_automation`

`python -m unittest discover -s tests/rp02_automation -p 'test_*.py' -v`
