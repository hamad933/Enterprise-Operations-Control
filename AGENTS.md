# AGENTS.md — RP02 Repository Execution Contract

## 1. Authority and applicability

This file is the canonical repository-stable instruction entry point for human and automated executors working in `hamad933/Enterprise-Operations-Control`.

Order of authority:

1. Explicit owner-approved decisions and current gates recorded in the governed Google Drive control state.
2. The bounded Workstream Contract issued by the RP02 Central Controller.
3. This file and the repository-native governance documents it references.
4. Task-local notes that do not conflict with the above.

Conversation memory, historical snapshots, prototypes, and synthetic examples are not execution authority.

## 2. Mandatory reading order

Before changing the repository, read only:

1. `AGENTS.md` as the repository entry point.
2. The exact active Workstream Contract supplied by the RP02 Central Controller.
3. `CONTRIBUTING.md`.
4. `docs/governance/EXECUTION_AND_SAFETY_RULES.md`.
5. `docs/governance/EVIDENCE_AND_HANDOFF.md`.
6. Only the exact architecture, ADR, design-contract, or other repository paths named by the Workstream Contract.

Stop reading when these sources fully cover the authorized task. Do not load unrelated portfolio packs, Drive folders, repositories, historical archives, or prior chats.

If the active Workstream Contract is missing, does not identify its baseline and Stop Gate, or conflicts with a higher-authority source, stop with `BLOCKED_AUTHORITY_OR_CONTRACT` before reading optional context or changing files.

## 3. Repository identity and product invariants

This repository serves `RP02 — Enterprise Operations`, a reference product for multi-site facilities operations and control using synthetic organizational context.

Any future implementation must preserve these invariants when they are in scope:

- traceability from observation or request through authority, decision, controlled action, evidence, verification, and outcome;
- explicit site, asset, organizational, and action scope;
- visible denied, conflict, missing-evidence, stale-data, and rejected-verification states;
- separation of requester, executor, verifier, approver, and observer when risk requires it;
- cross-site visibility must not silently grant cross-site action authority;
- KPI values require source, scope, period, owner, threshold, and evidence lineage;
- sensitive work must not be self-closed solely by the executor when independent verification is required;
- synthetic context must never be represented as real client or operational truth.

These invariants are product constraints, not a frozen database schema or UI specification.

## 4. Executor authority

An executor may only:

- modify files explicitly listed in the Workstream Contract;
- use the named baseline, branch, and pull-request policy;
- run bounded tests and capture required evidence;
- publish a reference-only Execution Handoff;
- stop at the named Stop Gate.

An executor may not:

- approve its own governance or implementation result;
- update canonical Google Drive control state;
- merge, release, deploy, or change repository settings without explicit authority;
- expand product scope or infer unresolved owner decisions;
- introduce secrets, real client data, production credentials, or unapproved integrations;
- bypass branch, review, evidence, or safety requirements;
- rewrite history or force-push unless a Workstream Contract explicitly authorizes it.

## 5. Workstream contract requirements

Every executable task must identify:

- project and workstream ID;
- outcome and scope;
- verified repository and baseline commit;
- branch and PR target;
- exact files or areas allowed to change;
- out-of-scope and prohibited changes;
- acceptance criteria;
- tests and evidence;
- Execution Handoff location;
- Stop Gate.

If any required field is missing or conflicting, stop with `BLOCKED_AUTHORITY_OR_CONTRACT` and report the gap.

## 6. Security and data rules

- Use synthetic fixtures by default.
- Never commit secrets, tokens, private keys, credentials, customer data, or exported production data.
- Do not weaken authorization, audit, evidence integrity, or separation-of-duties controls for convenience.
- Destructive data operations, migrations, external integrations, and deployment require separate explicit authorization and recovery evidence.
- Denied and out-of-scope paths must be tested whenever authority boundaries are implemented.

## 7. Evidence, review, and completion

A task is not complete merely because files changed. Completion requires the tests, CI, evidence, limitations, and handoff specified in `docs/governance/EVIDENCE_AND_HANDOFF.md` and the Workstream Contract.

The executor must stop after opening or updating the authorized pull request and publishing the handoff. The RP02 Central Controller performs primary review and issues the repository-control verdict.

Independent review is an additional read-only assurance layer when required by `CONTRIBUTING.md` or the Workstream Contract. It must be pinned to an exact base and head, must not modify the repository or canonical state, and does not replace Controller review or any owner decision required by the active gate.

## 8. Bounded overrides

A Workstream Contract may apply a narrower override only when it:

- names the exact rule being overridden;
- states the reason and scope;
- names the approving authority;
- has an expiry or Stop Gate;
- does not silently weaken security, evidence, or owner authority.

Unstated conflicts are resolved in favor of the stricter canonical rule.
