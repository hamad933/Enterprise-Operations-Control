# RP02 Evidence and Execution Handoff

## 1. Evidence principle

Evidence must prove the authorized result against the exact repository version. A screenshot, successful build, or executor statement is not sufficient by itself.

Default preservation classification is `REFERENCE_ONLY`.

## 2. Authoritative locations

- Repository: durable tests, scripts, fixtures, architecture contracts, and permanent documentation.
- Pull request: scope, commits, diff, discussion, reviewer entry point, and evidence links.
- GitHub Actions artifacts: temporary logs, traces, screenshots, videos, reports, and browser evidence.
- Google Drive: accepted or deliberately frozen long-term evidence only after a Controller preservation decision.

Do not copy source files, complete logs, or repeated screenshots into the handoff when a stable direct reference exists.

## 3. Minimum evidence for every workstream

Every handoff must identify:

- Project and Workstream ID
- Workstream Contract or authoritative instruction reference
- Base commit, branch, head commit, and pull request
- Changed paths and direct diff entry point
- Acceptance criteria coverage
- Tests executed and results
- CI runs and artifacts tied to the same head commit
- Security, privacy, authority, and data impact
- Limitations, deviations, skipped checks, and unexpected findings
- Reviewer entry point
- Stop state and actions not taken

## 4. RP02 evidence profiles

When the scope includes authority or access, include:

- positive and negative permission checks;
- direct-object or API scope enforcement;
- site, asset, team, and cross-site isolation;
- requester, executor, verifier, approver, and observer separation where required;
- delegation bounds and expiry;
- audit events for denied, conflict, override, and sensitive actions.

When the scope includes KPI, decisions, or corrective action, include:

- KPI definition, unit, source, owner, cadence, scope, threshold, and version;
- lineage from source event or data to displayed value;
- stale, missing, and conflicting-data paths;
- threshold breach through decision and corrective-action trace;
- override or exception authority and auditability;
- proof that synthetic values are not represented as operational truth.

When the scope includes work execution and closure, include:

- request, assignment, execution, closure-request, verification, rejection, rework, and exception transitions;
- evidence attached to the correct work item and version;
- independent verification when required;
- duplicate submission, idempotency, and concurrency behavior when relevant;
- mobile or offline behavior only when explicitly authorized.

When the scope includes UX or visual behavior, include:

- representative authorized and denied journeys;
- loading, empty, stale, error, and permission-denied states;
- accessibility checks appropriate to the change;
- RTL and LTR evidence when in scope;
- console and network evidence linked to the same commit and run;
- screenshots that prove product state rather than decorative fragments.

## 5. Governance-only evidence

A governance-only workstream must at minimum prove:

- only authorized governance and documentation paths changed;
- required governance files exist;
- internal file references resolve;
- no application, database, deployment, integration, or secret-bearing files were introduced;
- branch and PR metadata match the Workstream Contract;
- the handoff names the exact head commit and Stop Gate.

## 6. Execution Handoff template

```markdown
# Execution Handoff

## Identity
- Project:
- Workstream:
- Contract:
- Repository:
- Base commit:
- Branch:
- Head commit:
- Pull request:

## Authorized outcome

## Changed paths

## Acceptance criteria and evidence

## Tests and CI

## Security / privacy / authority / data coverage

## Limitations and deviations

## Unexpected findings

## Reviewer entry point

## Preservation classification
REFERENCE_ONLY | PROMOTE_TO_DRIVE | DO_NOT_PRESERVE

## Stop state
```

The handoff is an index, not an evidence archive.

## 7. Controller review outcomes

The RP02 Central Controller issues one of:

- `PASS`
- `PASS_WITH_NOTES`
- `REVISION_REQUIRED`
- `BLOCKED_MISSING_EVIDENCE`
- `BLOCKED_AUTHORITY_OR_CONTRACT`

An executor does not issue the final verdict.

## 8. Stop gate

After publishing the pull request and handoff, stop. Do not merge, release, deploy, update Drive, or begin follow-on work without new authority.
