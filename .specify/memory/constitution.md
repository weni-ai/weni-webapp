<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification. The prior file was an unfilled scaffold with
no adopted governance, so this is the first enforceable version.

Modified principles (template slot → adopted principle):
- [PRINCIPLE_1_NAME] (example: Library-First)          → I. Federated Contracts Are Public APIs
- [PRINCIPLE_2_NAME] (example: CLI Interface)          → II. Auth and Chrome Are Global and Singleton
- [PRINCIPLE_3_NAME] (example: Test-First NON-NEGOTIABLE) → III. Pinia Is the Only Store
- [PRINCIPLE_4_NAME] (example: Integration Testing)    → IV. Locale Completeness Is a Ship Gate
- [PRINCIPLE_5_NAME] (example: Observability)          → V. Match the Existing Stack and Patterns
- (new slot, not in template)                          → VI. Tests and CI MUST Stay Green

Explicitly rejected template examples: Library-First, CLI Interface, and mandatory
red-green TDD. This repository is an application shell, not a library or CLI, and
does not enforce strict test-first authoring.

Added sections:
- Compatibility and Caution (filled [SECTION_2_NAME] / [SECTION_2_CONTENT])
- Development and Review (filled [SECTION_3_NAME] / [SECTION_3_CONTENT])

Removed sections: none.

Follow-up TODOs: none. All placeholder tokens resolved.
-->

# VTEX CX Platform Shell Constitution

## Core Principles

### I. Federated Contracts Are Public APIs

`src/store/Shared.js` (exposed as `connect/sharedStore`), the Module Federation
remotes (`insights`, `bulk_send`, `agent_builder`), and the iframe `postMessage`
contracts (`forceRemount*`, `updateRoute`, `setLanguage`,
`connect:updateExternalToken`) MUST remain backward compatible. Changes to these
surfaces MUST be additive; a field, event, or exposed module MUST be deprecated and
announced before it is removed.

`Shared.js` MUST NOT import application modules — no router, no views, no Keycloak,
no composables — so that the container runtime never duplicates the host. Remote
imports MUST be wrapped with `tryImportWithRetries` / `safeAsyncComponent`.
Federated modules MUST be unmounted on project change and after inactivity.

Rationale: a shape change here breaks every product on dash.weni.ai, not just this
repository.

### II. Auth and Chrome Are Global and Singleton

`src/services/Keycloak.js` MUST initialize exactly once. Do not call
`keycloak.init()` anywhere else, and do not change the token-refresh cadence without
coordinating the corresponding iframe `postMessage` to `#intelligence`.
`router.beforeEach` is the single auth gate; new conditions added to it MUST NOT
introduce redirect loops.

`Sidebar`, `Topbar`, and `app.vue` mount on every authenticated page. Any change to
them MUST ship with tests.

Rationale: regressions in auth or chrome are platform-wide, not page-local.

### III. Pinia Is the Only Store

New state MUST be a Pinia store using setup syntax. Vuex MUST NOT be reintroduced.
State that another store already owns MUST NOT be duplicated. When host state is
mirrored into `Shared.js`, the owning store MUST push the value out; `Shared.js`
MUST NEVER pull application modules in.

Rationale: Vuex was removed across releases 2.43–2.45 precisely because maintaining
two stores caused state drift.

### IV. Locale Completeness Is a Ship Gate

Every user-visible string MUST go through i18n (`$t` / `i18n.global.t`). Adding or
changing a key MUST update `src/locales/en.json`, `pt_br.json`, `es.json`, and
`ro.json` in the same change, with identical nested structure, snake_case keys in
alphabetical order, and matching `{placeholders}` across all four files.

Copy MUST follow the VTEX Content Guide: sentence case, no "please", and no personal
pronouns in UI copy except in confirmation modals. Translations are managed through
Crowdin; do not invent npm translation scripts.

Rationale: a missing key ships visibly broken UI to a large share of users, and the
linter does not catch it.

### V. Match the Existing Stack and Patterns

The stack MUST remain Vue 3.5 with Rspack for the application, Vite/Vitest for tests,
Node 22, and npm using the checked-in `package-lock.json`.

New components MUST use `<script setup>` with the Composition API; existing Options
API components MUST NOT be rewritten opportunistically. New stores, composables
(`useXxx.js`), and API modules MUST follow the layout of their existing neighbors.
Imports inside `src/` MUST use the `@/` alias. Styling MUST use Unnnic `$unnnic-*`
tokens with scoped SCSS; colors and spacing MUST NOT be hardcoded. HTTP MUST go
through `request.$http()` so the Keycloak interceptors apply — do not bypass it.
Feature flags go through GrowthBook.

A dependency MUST NOT be added when lodash, Unnnic, or an existing util already
covers the need. `.env*` files and real secrets MUST NEVER be committed. Browser APIs
outside the browserslist target (chrome >= 87, edge >= 88, firefox >= 78,
safari >= 14) MUST NOT be used.

Rationale: this is a long-lived shell; consistency is what keeps it reviewable and
keeps the bundle shipped to every user predictable.

### VI. Tests and CI MUST Stay Green

New or changed behavior MUST ship unit tests in the same pull request, preferably
colocated in `src/**/__tests__/*.spec.js`. Mock at the API/client boundary
(`vi.mock('@/api/request.js')`) and reuse `tests/unit/__mocks__`. Pinia MUST be
tested with `createTestingPinia`. Coverage MUST NOT drop on touched files, and CI
(`npm ci && npm run build && npm run lint && npm run test:coverage`) MUST pass.

Strict red-green TDD is NOT required for every line. Untested behavior MUST NOT land
in auth, federation, billing, router, or chrome.

Rationale: a regression in this host is a production incident across the platform.

## Compatibility and Caution

Default to caution: this shell can break every product on the platform.

Code that appears unused MUST NOT be migrated, "cleaned up", or removed before
grepping the federation contracts and iframe events. Strings such as
`forceRemountInsights` are runtime contracts even when no local caller references
them.

Billing code (`src/views/billing/`, `src/store/billing*`, `src/components/billing/`)
MUST NOT change copy or computations casually; its numbers are customer-trust data
and MUST be treated as such.

The `version` field in `package.json` is not the release version. Releases are git
tags plus `CHANGELOG.md` entries grouped under Added / Changed / Fixed / Removed. A
CHANGELOG entry is required for every release. Dependencies MUST NOT be downgraded.

## Development and Review

The default branch is `main`. Branch names follow `<type>/<short-kebab-description>`.

Commit messages use conventional lowercase prefixes: `feat:`, `fix:`, `refactor:`,
`chore:`, `style:`, `test:`, `docs:`.

Pull requests MUST use `.github/pull_request_template.md`, filling in Type, Why, and
What Changed.

The code owners @paulobernardoaf and @cristiantela MUST review every pull request. Do
not merge without their approval.

## Governance

This constitution governs the Spec Kit `specify`, `plan`, `analyze`, and `implement`
workflows for this repository, and supersedes conflicting habits or stale
documentation.

Amendments require a pull request that updates `.specify/memory/constitution.md`,
bumps the Version (MAJOR for a removed or redefined principle, MINOR for a new
principle or materially expanded guidance, PATCH for wording and clarifications),
sets Last Amended to the date of the change, and states the reason for the amendment.

Pull requests that add Spec Kit features MUST NOT violate these principles. Reviewers
SHOULD reject any plan that proposes Vuex, locale files left out of sync, `Shared.js`
importing application modules, or skipping tests on chrome, auth, or federation.

**Version**: 1.0.0 | **Ratified**: 2026-09-01 | **Last Amended**: 2026-09-01
