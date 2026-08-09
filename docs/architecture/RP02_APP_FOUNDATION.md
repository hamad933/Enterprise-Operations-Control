# RP02 Application Foundation — W01

## Boundary

`RP02-APP-FOUNDATION-001` establishes a browser-native front-end foundation for the S01 reference slice only. The application uses HTML, CSS, and native ES modules under `app/`; it has no framework, package runtime, build system, backend, database, external API, or production authentication dependency.

## Structure

- `app/index.html` — accessible application shell and S01 semantic structure.
- `app/styles.css` — presentation and responsive behavior for desktop, tablet, and mobile.
- `app/data.js` — visibly synthetic S01 operational records, scope definitions, sites, and Route Ribbon state.
- `app/state.js` — deterministic UI state transitions, exact selected-site state, filtering/search, action-authority checks, and safe simulated-action state.
- `app/icons.js` — one local inline-SVG icon vocabulary with no external icon package.
- `app/render.js` — presentation rendering for the Attention Ledger, Operational Pulse, sites, Route Ribbon, and Focus / Authority Aperture.
- `app/app.js` — browser interaction wiring, dialog focus management, keyboard behavior, notifications, and control events.
- `tests/foundation.mjs` — dependency-free state and invariant checks using Node's built-in test assertions.

Presentation, synthetic state/data, and interaction logic remain separate enough for review and future bounded extension without introducing an application framework.

## Frozen reference relationship

`prototypes/rp02-s01/index.html` remains a frozen reference-only artifact and is not imported, generated, or modified by the real application. W01 carries forward its approved RP02 visual/product intent while implementing the four corrections authorized by the workstream contract.

## Synthetic-data boundary

All records in this slice are synthetic and must remain visibly identified as such. The application does not fetch, persist, transmit, or imply live enterprise operational truth. Simulated actions change only in-memory presentation state and never represent real execution or final closure.

## Extension rule

Future workstreams may extend only the explicitly authorized surface and paths for their contract. New frameworks, package runtimes, build layers, backend services, databases, schemas, integrations, device connections, production authentication/authorization, deployment, or release infrastructure require separate explicit authorization before implementation.
