# RP02 Architecture Decision Records

Architecture Decision Records document durable technical choices and their consequences. They do not replace owner product decisions or Google Drive control state.

## Naming

Use:

```text
NNNN-short-kebab-title.md
```

Example: `0001-authorization-scope-model.md`.

## Required structure

```markdown
# ADR-NNNN: Title

- Status: PROPOSED | ACCEPTED | REJECTED | SUPERSEDED
- Date: YYYY-MM-DD
- Workstream:
- Decision authority:
- Supersedes:
- Superseded by:

## Context

## Decision

## Alternatives considered

## Security, privacy, authority, and data impact

## Consequences

## Validation and evidence

## Rollback or migration considerations

## References
```

## Rules

- New ADRs begin as `PROPOSED` unless the governing review explicitly accepts them.
- An executor may draft an ADR but may not mark it `ACCEPTED` without the required Controller or owner verdict.
- Never edit an accepted ADR to hide history. Supersede it with a new ADR and update both status references.
- Reference the exact workstream, pull request, and effective commit.
- Keep task instructions out of ADRs.
- Do not duplicate Google Drive decisions; reference their decision ID when relevant.
- Security, authorization, audit, evidence, migration, integration, and recovery decisions require proportionate validation.

No ADR is currently accepted.
