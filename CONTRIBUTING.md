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

- The executor may not approve or merge its own work.
- The RP02 Central Controller performs primary review against the direct diff and evidence.
- Independent review is required only when the Controller identifies a justified trigger, such as a material security boundary, destructive operation, release, major architecture change, cross-project reusable policy, or disputed result.
- Merge requires an explicit Controller verdict and any owner approval required by the active gate.
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
- internal paths referenced by governance files resolve;
- no application, database, deployment, or secret-bearing files were added outside scope;
- the PR diff contains only authorized paths;
- Markdown is readable and has no placeholder authority claims.

Future implementation work must add domain, security, negative-path, accessibility, data-safety, and migration evidence proportionate to its scope.

## 6. Issues and scope changes

Do not expand a pull request because a related opportunity is discovered. Record it as an unexpected finding or proposed follow-on work and stop at the current gate.

A scope change requires an updated Workstream Contract and named authority before implementation.

## 7. Release and deployment

No merge implies release or deployment authority. Release, migration, deployment, rollback, and recovery are separate governed events with exact-artifact evidence and approval requirements.
