# Contributing to RP02

All repository changes are governed work. Read `AGENTS.md` before using this document.

## 1. Baseline and branches

- `main` is the protected integration baseline by policy.
- Direct changes to `main` are prohibited after the one-time empty-repository bootstrap commit `defed5284243b4ad2e512009d2c55ca4145acfdd`.
- Every subsequent change must use a bounded branch and pull request unless an explicitly approved emergency or recovery contract says otherwise.
- Branch names should use one of:
  - `governance/<workstream-id>`
  - `feature/<workstream-id>-<slug>`
  - `fix/<workstream-id>-<slug>`
  - `docs/<workstream-id>-<slug>`
  - `recovery/<workstream-id>-<slug>`

One branch should represent one bounded workstream or one tightly related authorized wave.

## 2. Required pull request content

Every pull request must state:

- Project and Workstream ID
- Purpose and authorized outcome
- Verified base commit
- In scope
- Out of scope
- Prohibited changes
- Changed paths
- Tests and CI
- Evidence references
- Security, privacy, data, migration, and authority impact
- Known limitations or deviations
- Execution Handoff reference
- Stop state

Use `.github/pull_request_template.md` as the minimum structure.

## 3. Reviews and merging

### Primary review

- The executor may not approve or merge its own work.
- The RP02 Central Controller performs primary review against the direct diff, exact version, CI, evidence, and active Workstream Contract.
- The Controller issues the repository-control verdict and coordinates any owner decision required by the active gate.

### Independent review triggers

Independent review is required when any of the following applies:

- the Controller authored or materially implemented the governance proposal under review;
- the change modifies the authority model, repository execution contract, security boundary, destructive-operation policy, release or recovery policy, or cross-repository reusable rule;
- the active Workstream Contract or owner explicitly requires it;
- material disagreement, unresolved risk, or disputed evidence remains after primary review.

The Controller may also require independent review for other proportionate high-risk changes.

### Independence and frozen scope

An independent reviewer must:

- be separate from the executor or author of the reviewed change;
- not act as the Controller issuing the final repository-control verdict for the same frozen version;
- review an exact repository, base commit, head commit, pull request, criteria set, exclusions, and Stop Gate;
- use direct repository, PR, CI, and evidence sources named by the frozen review contract;
- remain read-only and avoid importing unrelated portfolio context or historical chats as authority.

The independent reviewer may issue:

- `PASS`
- `PASS_WITH_NOTES`
- `REVISION_REQUIRED`
- `BLOCKED_MISSING_EVIDENCE`

This is an independent-assurance outcome, not merge authority and not an owner product decision.

### Reconciliation and disagreement

- The Controller records and reconciles the independent findings against the exact reviewed head.
- A blocking independent outcome (`REVISION_REQUIRED` or `BLOCKED_MISSING_EVIDENCE`) prevents merge until a corrected head receives fresh checks and a new review.
- Findings and outcomes do not transfer automatically to a later commit.
- If the Controller and independent reviewer disagree materially, do not merge. Record the conflict and escalate it to the owner or another explicitly authorized reviewer.
- For Controller-authored governance, the Controller may not waive a blocking independent finding by itself.

### Merge authority

- Merge requires an explicit Controller verdict after all required reviews and checks, plus any owner approval required by the active gate.
- No independent-review outcome, CI success, or mergeable GitHub state alone authorizes merge.
- Prefer squash merge for a clean bounded workstream history unless the Workstream Contract requires preserved commits.
- Delete the workstream branch after an accepted merge unless retention is justified.

Repository settings may not yet enforce every policy mechanically. The written rule remains binding until settings are configured through an authorized governance change.

## 4. Commit rules

- Use clear imperative messages, for example `docs: define evidence handoff contract`.
- Do not mix unrelated changes.
- Do not include generated dependencies, caches, secrets, raw evidence archives, or local environment files.
- Do not amend or force-push after review begins unless the reviewer requests it and the updated head is clearly identified.

## 5. Validation

Run the smallest complete validation set required by the Workstream Contract. At minimum, governance-only changes must verify:

- required files exist;
- repository-relative Markdown paths resolve;
- no application, database, deployment, or secret-bearing files were added outside the governance workstream scope;
- the PR diff contains only authorized paths;
- Markdown is readable and has no placeholder authority claims;
- CI evidence states whether it tested the raw head, PR merge context, or both.

Future implementation work must add domain, security, negative-path, accessibility, data-safety, and migration evidence proportionate to its scope.

## 6. Issues and scope changes

Do not expand a pull request because a related opportunity is discovered. Record it as an unexpected finding or proposed follow-on work and stop at the current gate.

A scope change requires an updated Workstream Contract and named authority before implementation.

## 7. Release and deployment

No merge implies release or deployment authority. Release, migration, deployment, rollback, and recovery are separate governed events with exact-artifact evidence and approval requirements.
