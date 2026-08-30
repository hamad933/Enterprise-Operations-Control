# RP02 Automation Lessons Ledger

## CEP — separated request and effect serialization
- SOURCE_SYSTEM: CEP Jules Gateway v2.2/v2.3
- SOURCE_REF: `.github/workflows/cep-jules-v2-mutation.yml`, `cep-jules-v2-mutation-worker.yml`
- PROBLEM_SOLVED: duplicate request execution and conflicting write-domain effects.
- FAILURE_MODE: one global lock reduces safe parallelism; request-only lock does not prevent cross-request effect collisions.
- MECHANISM: stable request key plus distinct effect key; separate mutation worker; preflight intent before provider write.
- WHY_IT_WORKS: it separates transport identity from state-changing identity.
- PORTABLE_TO_THIS_PROJECT: yes.
- PROJECT_SPECIFIC_PARTS: CEP controller/lane names, repository source, workflow names.
- SECURITY_IMPLICATION: prevents duplicate writers and supports no-blind-retry discipline.
- RECOMMENDED_ADOPTION: adopt the invariant; redesign RP02 names/contracts.
- REJECTED_ALTERNATIVES: global project lock; direct provider write from input workflow.

## CEP — ambiguous provider writes are unknown, not retryable
- SOURCE_SYSTEM: CEP Jules Gateway provider adapter.
- SOURCE_REF: `tools/cep_jules_gateway/jules.py`
- PROBLEM_SOLVED: network/protocol ambiguity after POST.
- FAILURE_MODE: a retry can duplicate a session/message/approval.
- MECHANISM: classify 429/5xx/transport/protocol ambiguity as unknown write outcome and set blind retry false.
- WHY_IT_WORKS: it forces reconciliation against provider truth before another effect.
- PORTABLE_TO_THIS_PROJECT: yes.
- PROJECT_SPECIFIC_PARTS: CEP package names only.
- SECURITY_IMPLICATION: protects provider state from duplicate effects.
- RECOMMENDED_ADOPTION: mandatory before any RP02 mutation.
- REJECTED_ALTERNATIVES: automatic POST retry.

## UES — bounded retry applies only to pre-effect provider reads
- SOURCE_SYSTEM: Universal Execution System.
- SOURCE_REF: `ues/initial_lineage_runtime.py` on UES current main reviewed during this workstream.
- PROBLEM_SOLVED: transient inventory failure before any external effect.
- FAILURE_MODE: treating read retry and mutation retry as equivalent.
- MECHANISM: allowlisted GET operations receive a bounded attempt count; exhausted inventory stays fail-closed with zero effects and `safe_to_blind_retry=false`.
- WHY_IT_WORKS: retry safety is tied to proof that no write has occurred.
- PORTABLE_TO_THIS_PROJECT: yes.
- PROJECT_SPECIFIC_PARTS: UES lineage registry and portfolio adapter model.
- SECURITY_IMPLICATION: preserves liveness without weakening write safety.
- RECOMMENDED_ADOPTION: foundation read adapter uses bounded transient GET retries only.
- REJECTED_ALTERNATIVES: unlimited polling; provider replay; mutation retry after timeout.

## RP02 — written repository policy outranks missing mechanical protection
- SOURCE_SYSTEM: RP02 repository governance.
- SOURCE_REF: `CONTRIBUTING.md`, GitHub branch/ruleset readback.
- PROBLEM_SOLVED: settings do not currently enforce all written policy.
- FAILURE_MODE: assuming an unprotected branch authorizes direct writes.
- MECHANISM: bounded branch + PR remains mandatory by repository contract.
- WHY_IT_WORKS: authority is governance-derived, not capability-derived.
- PORTABLE_TO_THIS_PROJECT: native.
- PROJECT_SPECIFIC_PARTS: RP02 branch conventions and Controller review.
- SECURITY_IMPLICATION: prevents bypass through connector capability.
- RECOMMENDED_ADOPTION: all automation self-changes use the same PR/review path.
- REJECTED_ALTERNATIVES: direct `main` mutation because GitHub permits it.

## RP02 — third-party GitHub Actions require immutable reviewed pins
- SOURCE_SYSTEM: RP02 Automation Foundation hosted validation plus current upstream action releases.
- SOURCE_REF: `RP02 Automation Foundation Tests` hosted log; `actions/checkout v7.0.1`, `actions/setup-python v7.0.0`, `actions/upload-artifact v7.0.1` exact tag commit readbacks.
- PROBLEM_SOLVED: old action majors emitted Node 20 deprecation warnings and floating version tags leave the trusted control plane exposed to future tag movement or unreviewed dependency changes.
- FAILURE_MODE: dependency runtime drift or supply-chain substitution changes automation semantics without an RP02 code diff.
- MECHANISM: verify the current upstream release, resolve its exact commit, pin the workflow to the full commit SHA, and retain the human-readable release version in a comment.
- WHY_IT_WORKS: execution resolves to reviewed immutable source identity while preserving maintainability.
- PORTABLE_TO_THIS_PROJECT: yes.
- PROJECT_SPECIFIC_PARTS: exact RP02 workflows and their required action set.
- SECURITY_IMPLICATION: reduces control-plane dependency drift and makes later upgrades explicit review events.
- RECOMMENDED_ADOPTION: use immutable full-SHA action pins in RP02 automation; periodically re-verify upstream releases before bounded upgrades.
- REJECTED_ALTERNATIVES: floating major tags such as `@v4`/`@v5`; suppressing the Node deprecation warning without dependency upgrade.
