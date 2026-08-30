# RP02 Automation Workstream Contract — RP02-AUTO-FOUNDATION-001

Status: `AUTHORIZED_BOUNDED_IMPLEMENTATION`

## Identity
- Project: `RP02 — Enterprise Operations Control`
- Workstream: `RP02-AUTO-FOUNDATION-001`
- Repository: `hamad933/Enterprise-Operations-Control`
- Exact baseline: `main@caaa01e20461858c9aba7e404afa5385c8bbe6bb`
- Writer branch: `feature/rp02-auto-foundation-001`
- Pull-request base: `main`
- Integration authority: RP02 Central Controller after mandatory independent review.

## Objective
Build the first project-native automation control-plane candidate without creating a runtime dependency on UES or CEP. The candidate must establish strict request identity, authority checks, request/effect identity separation, idempotency semantics, no-blind-retry reconciliation semantics, secret redaction, machine-readable evidence, deterministic tests, and a GET-only Jules shadow-inspection path.

## Write scope
- `tools/rp02_automation/**`
- `tests/rp02_automation/**`
- `docs/automation/**`
- `.github/workflows/rp02-automation-*.yml`

## Prohibited scope
- `app/**`, product behavior, product data, prototypes, migrations, deployment, release, or production configuration.
- Existing PR #16 branch/head or its seven-file correction scope.
- Existing governance files outside `docs/automation/**`.
- Direct mutation of `main`, force push, history rewrite, merge, release, deploy, external publication, or canonical Drive mutation.
- Jules provider POST/mutation operations in this foundation candidate.
- Secrets in source, artifacts, issues, Drive, or logs.

## Validation
- Python 3.12 compile check.
- Full deterministic `unittest` foundation suite.
- Exact changed-path review against this contract.
- Secret-like token scan over the automation candidate.
- GitHub Actions raw-head and merge-context governance validation after PR creation.
- Project-native automation test workflow on the exact PR head.

## Evidence
- Exact branch and head SHA readback.
- Direct PR diff and changed-path list.
- Exact workflow run IDs/conclusions for the frozen head.
- Machine-readable shadow evidence only after the secret and review gates are satisfied.

## Handoff
The pull-request body is the Execution Handoff and must contain the exact final head SHA, changed paths, validation evidence, limitations, reviewer entry point, and Stop Gate.

## Stop Gate
`FOUNDATION_CANDIDATE_OPEN_WITH_EXACT_REMOTE_SHA__LOCAL_TESTS_PASS__NO_LIVE_JULES_MUTATION__MANDATORY_INDEPENDENT_REVIEW_PENDING__SECRET_PROVISIONING_OR_SHADOW_CANARY_PENDING__NO_MERGE_RELEASE_DEPLOY`
