<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR. Principle IV is redefined (only the source locale is
written by engineers; translations are Crowdin-managed). Commit types are narrowed
to the root set (`style:` removed). TypeScript becomes mandatory for new files.
New principles and sections are added from the canonical engineering, frontend,
and frontend-platform bases.

Modified principles:
- I. Federated Contracts Are Public APIs: absorbs root "Versioned Contracts"
  (SemVer, deprecation path) and frontend-platform "Isolation" and "Communication".
- III. Pinia Is the Only Store: absorbs frontend "State Management".
- IV. Locale Completeness Is a Ship Gate: REDEFINED. Engineers write only
  `src/locales/en.json`; `pt_br.json`, `es.json`, `ro.json` are Crowdin-managed and
  MUST NOT be edited. Absorbs frontend "Internationalization" with an explicit
  project exception to "localized before merge".
- V. Match the Existing Stack and Patterns: TypeScript added to the stack; styling,
  HTTP, and naming rules moved to dedicated principles; `.js` composable rule
  replaced by the TypeScript mandate.
- VI. Tests and CI MUST Stay Green: absorbs frontend "Testing" (behavior over
  implementation, no coverage-only tests).

Added principles:
- VII. TypeScript for New Code (frontend "Type Safety")
- VIII. Code as Documentation and Naming (frontend "Code as Documentation",
  "Naming Conventions"; project exception for `.vue` file names)
- IX. Small, Single-Purpose Components (frontend "Single Responsibility",
  "Component Architecture"; framework exception for `update:*` v-model events)
- X. Unnnic Design System, Tokens, and BEM (frontend-platform "Component Usage",
  "Deprecated Components", "Token Consumption"; frontend "Styling Standards",
  "BEM Methodology")
- XI. Semantic and Accessible Markup (frontend-platform "Semantic HTML";
  frontend "Accessibility")
- XII. Async State and API Boundaries (frontend "Async State Correctness",
  "API Integration", "API and Data Boundaries")
- XIII. Security and Observability (root "Security and Secrets", "Observability")
- XIV. Specification Traceability and No Silent Divergence (root)

Added sections:
- Quality Standards (frontend "Performance", "Defensive Programming",
  "Maintainability"; frontend-platform "Linting and Formatting")

Modified sections:
- Development and Review: absorbs root "Version Control and Review",
  "Commit Messages", "Changelog Maintenance". `style:` commit type removed
  (root list prevails). Changelog categories widened to all six Keep a Changelog
  categories.

Removed sections: none.

Follow-up TODOs:
- TODO(TS_TOOLING): no `tsconfig.json` and no TypeScript loader exist in Rspack or
  Vitest. The first change that adds a new file MUST add `tsconfig.json` with
  `strict: true`, Rspack and Vitest TS handling, and ESLint TS parsing.
- TODO(CHANGELOG_VALIDATOR): `scripts/validate-changelog-release.js` accepts only
  Added/Changed/Fixed/Removed; it MUST also accept Deprecated and Security.
- TODO(DEP_AUDIT): CI has no dependency vulnerability check (npm audit,
  Dependabot, or equivalent); add one to satisfy XIII.
- TODO(BRANCH_PROTECTION): confirm `main` branch protection blocks direct pushes
  and requires an approved review plus green CI.
- TODO(SPEC_TEMPLATE): `.specify/templates/spec-template.md` lacks the mandatory
  "Inheritance from Product Spec" block (XIV). `specs/001-okta-login-webapp`
  uses a table variant without the "Architecture doc" line; align on next
  amendment.
- TODO(FETCH_SCRIPT): the setup-engineering fetch script does not list the
  `frontend-platform` domain; bases were fetched by manual clone.

Templates reviewed (not modified by this generation):
- .specify/templates/plan-template.md: Constitution Check gate remains generic ✅
- .specify/templates/spec-template.md: see TODO(SPEC_TEMPLATE) ⚠
- .specify/templates/tasks-template.md: no conflict ✅

Provenance:
- Source: weni-ai/vtex-cx-engineering-constitutions (main)
- Bases: base-constitution.md, frontend/base-constitution.md,
  frontend-platform/base-constitution.md
- Domains: frontend-platform (extends frontend)
- Precedence: root > frontend > frontend-platform > project
-->

# VTEX CX Platform Shell Constitution

## Core Principles

### I. Federated Contracts Are Public APIs

`src/store/Shared.js` (exposed as `connect/sharedStore`), the Module Federation
remotes (`insights`, `bulk_send`, `agent_builder`), and the iframe `postMessage`
contracts (`forceRemount*`, `updateRoute`, `setLanguage`,
`connect:updateExternalToken`) are public interfaces. They MUST remain backward
compatible within a release line. Changes MUST be additive. A field, event, or
exposed module MUST be deprecated, announced, and recorded in `CHANGELOG.md` before
it is removed. A breaking change to these surfaces MUST be released as a SemVer
MAJOR and MUST NOT be introduced silently.

`Shared.js` MUST NOT import application modules (no router, views, Keycloak, or
composables), so the container runtime never duplicates the host. Remote imports
MUST be wrapped with `tryImportWithRetries` / `safeAsyncComponent`. Federated
modules MUST be unmounted on project change and after inactivity.

Host and remotes MUST communicate only through these documented contracts. The
host MUST NOT manipulate DOM inside a remote or iframe boundary, and remote-facing
code MUST NOT reach into host DOM. Neither side MUST pollute global scope
(`window`, document-level styles): styles MUST be scoped or prefixed, and global
event listeners MUST be removed on unmount.

**Rationale:** a shape change here breaks every product on dash.weni.ai, not just
this repository. Explicit, versioned contracts and DOM isolation let the host and
each module evolve and deploy independently.

### II. Auth and Chrome Are Global and Singleton

`src/services/Keycloak.js` MUST initialize exactly once. `keycloak.init()` MUST NOT
be called anywhere else, and the token-refresh cadence MUST NOT change without
coordinating the corresponding iframe `postMessage` to `#intelligence`.
`router.beforeEach` is the single auth gate; new conditions added to it MUST NOT
introduce redirect loops.

`Sidebar`, `Topbar`, and `app.vue` mount on every authenticated page. Any change to
them MUST ship with tests.

**Rationale:** regressions in auth or chrome are platform-wide, not page-local.

### III. Pinia Is the Only Store

Global state MUST live in a Pinia store using setup syntax. Vuex MUST NOT be
reintroduced. State MUST NOT be duplicated across stores or components; state
another store already owns MUST be read from that store. Related state SHOULD be
grouped by feature. Local component state SHOULD be preferred when the data is not
shared.

When host state is mirrored into `Shared.js`, the owning store MUST push the value
out; `Shared.js` MUST NEVER pull application modules in.

**Rationale:** Vuex was removed across releases 2.43–2.45 because maintaining two
stores caused state drift. A single owner per piece of state keeps data flow
traceable.

### IV. Locale Completeness Is a Ship Gate

Every user-visible string MUST go through i18n (`$t` / `i18n.global.t`); strings
MUST NOT be hardcoded in templates or scripts. Adding or changing a key MUST update
`src/locales/en.json` (the Crowdin source declared in `crowdin.yml`) in the same
change, using snake_case keys in alphabetical order within their nested group, and
`{placeholders}` that translators can preserve.

`src/locales/pt_br.json`, `es.json`, and `ro.json` match the Crowdin translation
pattern and MUST NOT be created, edited, or deleted by engineers or agents. UI
strings MUST be written in English only. Translations are delivered by the
Localization automation (`.github/workflows/localization-automation.yml`), which
opens the translation PR after merge; the pre-commit hook enforces the lock.

Date, number, and currency formatting MUST respect the user's locale. Copy MUST
follow the VTEX Content Guide: sentence case, no "please", and no personal pronouns
in UI copy except in confirmation modals.

*Project exception to the frontend base:* "new strings MUST be localized before
merge" is satisfied in this repository by a complete `en.json` entry. Translation
parity is owned by the Localization team through Crowdin, not by the PR author.

**Rationale:** a missing source key ships visibly broken UI and the linter does not
catch it. Hand-edited translations conflict with Crowdin and get overwritten, so
one source of truth per locale prevents both.

### V. Match the Existing Stack and Patterns

The stack MUST remain Vue 3.5 with Rspack for the application, Vite/Vitest for
tests, Node 22, TypeScript for new files (Principle VII), and npm using the
checked-in `package-lock.json`. Dependencies MUST NOT be downgraded.

New components MUST use `<script setup>` with the Composition API; existing
Options API components MUST NOT be rewritten opportunistically. New stores,
composables (`useXxx`), and API modules MUST follow the layout of their existing
neighbors. Imports inside `src/` MUST use the `@/` alias. Feature flags MUST go
through GrowthBook.

A dependency MUST NOT be added when lodash, Unnnic, or an existing util already
covers the need. Browser APIs outside the Rspack target (chrome >= 87, edge >= 88,
firefox >= 78, safari >= 14) MUST NOT be used.

**Rationale:** this is a long-lived shell; consistency keeps it reviewable and
keeps the bundle shipped to every user predictable.

### VI. Tests and CI MUST Stay Green

New or changed behavior MUST ship unit tests in the same pull request, colocated in
`src/**/__tests__/*.spec.*`. Mocks MUST sit at the API/client boundary
(`vi.mock('@/api/request.js')`) and SHOULD reuse `tests/unit/__mocks__`. Pinia MUST
be tested with `createTestingPinia`.

Tests MUST verify user-observable behavior and outcomes, not implementation
details. Tests MUST NOT be added only to raise coverage. A test that would still
pass after a regression MUST be fixed or removed. Coverage MUST NOT drop on touched
files, and CI (`npm ci && npm run build && npm run lint && npm run test:coverage`)
MUST pass.

Strict red-green TDD is NOT required. Untested behavior MUST NOT land in auth,
federation, billing, router, or chrome.

**Rationale:** a regression in this host is a production incident across the
platform, and tests that do not catch real regressions give false confidence.

### VII. TypeScript for New Code

Every new file (components, stores, composables, API modules, utils, and tests)
MUST be written in TypeScript (`.ts`, or `<script setup lang="ts">` in `.vue`).
Existing `.js` files SHOULD only receive bug fixes or small changes; a substantial
modification SHOULD migrate the file to TypeScript. Types MUST be explicit; `any`
SHOULD be avoided except at untyped third-party boundaries. `tsconfig.json` MUST
enable `strict`.

The repository has no TypeScript tooling today. The first change that introduces a
new file MUST also add `tsconfig.json` (strict), TypeScript handling in Rspack and
Vitest, and TypeScript parsing in ESLint, in the same pull request or a preceding
one. Creating a new `.js` file to avoid that setup MUST NOT happen.

**Rationale:** static typing catches errors at build time, improves tooling, and
documents contracts inline. Gradual migration lets adoption proceed without
blocking delivery.

### VIII. Code as Documentation and Naming

All code, identifiers, comments, and documentation MUST be in English, except
domain terms that only have meaning in the original language. Code MUST favor
readability over brevity. Non-trivial decisions MUST carry a comment explaining
*why*, not *what*.

Variables and functions MUST use `camelCase`; components MUST use `PascalCase`.
Files and directories MUST be lowercase. Abbreviations MUST be avoided unless
universally understood.

*Project exception:* Vue single-file component files (`.vue`) MUST be named in
`PascalCase`, matching the component name (for example `UserListItem.vue`). This
follows the Vue style guide and the existing codebase. All other files and all
directories remain lowercase.

**Rationale:** a codebase readable by any contributor lowers onboarding and
maintenance cost, and predictable naming makes the code searchable.

### IX. Small, Single-Purpose Components

Each file SHOULD stay under 350 lines. Each function MUST have one responsibility.
Template logic MUST be extracted to computed properties or functions; complex
conditional rendering MUST be expressed through descriptively named booleans.

Components MUST be named for their purpose, and related components SHOULD be
grouped in feature folders with scope-indicating prefixes (for example
`AppHeader`, `UserProfile`). Props MUST have descriptive names (`userName`).
Emitted events MUST be prefixed with `on` (`onUserEmailChange`). State-update
handlers SHOULD be prefixed with `handle`. State variables MUST state what they
represent (`isLoadingUser`, `errorStatusUser`).

*Framework exception:* `update:<prop>` events required by Vue `v-model` keep the
name Vue mandates.

**Rationale:** small, predictable units are easier to test, review, and refactor,
and consistent interface naming makes components self-documenting.

### X. Unnnic Design System, Tokens, and BEM

UI primitives MUST come from `@weni/unnnic-system` when available. Custom
components MUST NOT duplicate Unnnic functionality. Unnnic MUST be upgraded through
controlled version bumps, never by copy-pasting its code. The Unnnic skill MUST be
consulted for components, props, tokens, and their modern replacements. Deprecated
Unnnic components MUST NOT be introduced in new code; existing usages SHOULD be
migrated when the surrounding code changes.

Color, typography, spacing, shadow, and radius MUST use documented Unnnic tokens
(`$unnnic-*`) in scoped SCSS; raw values MUST NOT be hardcoded and tokens MUST NOT
be invented. Semantic tokens MUST be preferred over primitive tokens.

Selectors MUST be classes; IDs are reserved for JavaScript targeting when no
alternative exists. Nesting SHOULD be avoided. Class names MUST follow BEM
(`.block`, `.block__element`, `.block--modifier`) and MUST NOT chain elements
(`.block__elem1__elem2`).

**Rationale:** a shared library and tokens give one visual language with
centralized accessibility fixes. BEM and flat selectors keep specificity
predictable across host and remotes.

### XI. Semantic and Accessible Markup

Markup MUST use semantic elements (`header`, `nav`, `main`, `section`, `article`,
`aside`, `footer`) wherever they apply; `div` and `span` MUST only be used when no
semantic element fits. Headings MUST follow a logical hierarchy, and every
host-rendered page MUST have exactly one `h1`. Elements SHOULD carry at least one
class describing their purpose.

Interactive elements MUST be keyboard accessible with visible focus. Form inputs
MUST have associated labels. Color MUST NOT be the only carrier of information.
Images MUST have meaningful `alt` text or `alt=""` when decorative.

**Rationale:** semantic, accessible markup serves assistive technology, is a legal
requirement in many jurisdictions, and makes the template self-documenting.

### XII. Async State and API Boundaries

HTTP MUST go through `request.$http()` so the Keycloak interceptors apply, and API
calls MUST live in `src/api/` modules, never in components. API errors MUST be
handled explicitly and MUST NOT surface as unhandled exceptions.

Every async operation MUST track loading, success, and error states and reflect
them in the UI. Silent failures MUST NOT occur: errors MUST be shown to the user or
reported. Contradictory states (loading and error together) MUST be impossible.
Double submissions MUST be guarded. Optimistic updates MUST roll back on failure.

Backend snake_case fields MUST be normalized to camelCase in the API layer and MUST
NOT leak into new stores, business logic, or components. Raw DTO types that model
the backend contract MAY keep backend naming. Existing federated contract shapes
(Principle I) keep their current field names, since renaming them is a breaking
change.

**Rationale:** incorrect async state is one of the most common sources of broken
UX, and a clean API boundary keeps the frontend decoupled from backend details.

### XIII. Security and Observability

Secrets MUST NEVER be committed; `.env*` files MUST stay gitignored. The bundle is
public, so server-side secrets MUST NOT be shipped to the client at all; runtime
configuration MUST be injected at container start (`config.js.tmpl`,
`docker-entrypoint.sh`), and CI tokens MUST come from GitHub secrets. Access MUST
follow least privilege. Dependencies MUST come from the npm registry and MUST be
checked for known vulnerabilities.

Errors MUST be reported through Sentry with enough context (route, module or
remote name) to correlate them across host, remotes, and backend; correlation or
trace headers on requests MUST be preserved. Logs and Sentry events MUST NEVER
contain tokens, secrets, or sensitive personal data. `console` output MUST NOT be
relied on in production code.

**Rationale:** leaked credentials and vulnerable dependencies are among the most
damaging breaches, and privacy-safe, correlated telemetry is what makes platform
incidents diagnosable.

### XIV. Specification Traceability and No Silent Divergence

Every engineering spec under `specs/` MUST derive from exactly one approved product
spec and MUST reference it by an immutable pinned version (commit or tag); a
mutable URL or ID alone MUST NOT be used. The product spec MUST exist and be tagged
before the engineering spec is created. An engineering spec MUST NOT redefine the
problem, scope, success criteria, or binding decisions it inherits. A technical
architecture document SHOULD exist for non-trivial features; when it does, it MUST
be linked and pinned, but its absence MUST NOT block the spec.

Every engineering spec MUST open with this section, in exactly this format:

```
## Inheritance from Product Spec
- Product Spec: <title> — <URL>
- Pinned version: <commit/tag>
- Architecture doc: <none | URL + commit/tag>
- Inherited binding decisions: <short list>
- Scope of this spec: <slice implemented by this repo>
- Divergences: <none | link to amendment>
```

When a technical need contradicts anything inherited, the divergence MUST NOT be
implemented silently. It MUST be raised as an amendment in the product repository
and linked in `Divergences`; once approved and tagged, `Pinned version` MUST be
updated. A difference that contradicts nothing inherited is an implementation
decision and MUST be recorded in the engineering spec.

**Rationale:** pinned traceability guarantees every team implements the same
version of a feature, and forced amendments keep intent and implementation from
drifting apart without an audit trail.

## Quality Standards

All code MUST pass `npm run lint` without errors. ESLint MUST extend
`@weni/eslint-config` (currently `@weni/eslint-config/vue3`), and formatting MUST
be enforced by Prettier through that configuration; style debates MUST NOT happen
in review.

Unused dependencies MUST be removed. Heavy computations on frequent events MUST be
memoized or debounced. Images and fonts MUST be optimized. Bundle-size impact
SHOULD be weighed before adding a dependency, and initial load SHOULD prioritize
above-the-fold content.

Defensive guards SHOULD only be added when the invalid state is realistically
reachable, and MUST follow the surrounding patterns. Root causes MUST be fixed
rather than masked.

Business rules MUST NOT be duplicated; each MUST have a single source of truth.
Incidental utility duplication MAY remain when extraction would add coupling.
Abstractions SHOULD only be introduced once a pattern repeats across real use cases.

## Compatibility and Caution

Default to caution: this shell can break every product on the platform.

Code that appears unused MUST NOT be migrated, "cleaned up", or removed before
grepping the federation contracts and iframe events. Strings such as
`forceRemountInsights` are runtime contracts even when no local caller references
them.

Billing code (`src/views/billing/`, `src/store/billing*`, `src/components/billing/`)
MUST NOT change copy or computations casually; its numbers are customer-trust data.

## Development and Review

All code MUST reach `main` through a pull request. A merge MUST require a green CI
run and approval from the code owners @paulobernardoaf and @cristiantela
(`.github/CODEOWNERS`), which is stricter than the root minimum of one approved
review. Direct pushes to `main` MUST be blocked by branch protection.

Branch names follow `<type>/<short-kebab-description>`. Pull requests MUST use
`.github/pull_request_template.md`, filling in Type of Change, Why, and What
Changed.

Commits MUST follow Conventional Commits, `<type>: <description>`, with types
limited to `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. The description MUST
be imperative, specific, and at most 50 characters. Each commit MUST be one logical
change.

The `version` field in `package.json` is not the release version. Releases are git
tags following SemVer plus a `CHANGELOG.md` entry in Keep a Changelog format
(`## [x.y.z] - YYYY-MM-DD`). Every user-facing change MUST appear under the right
category: Added, Changed, Deprecated, Removed, Fixed, or Security. Releases MUST
pass `npm run changelog:validate`.

## Governance

This constitution governs the Spec Kit `specify`, `plan`, `analyze`, and
`implement` workflows for this repository and supersedes conflicting habits or
stale documentation. It is synthesized from the canonical VTEX CX bases
(root > frontend > frontend-platform > project); project exceptions MUST be stated
inline with a justification. Re-running `setup-engineering` refreshes the bases
while preserving still-valid project rules.

Amendments require a pull request that updates `.specify/memory/constitution.md`,
bumps the Version (MAJOR for a removed or redefined principle, MINOR for a new
principle or materially expanded guidance, PATCH for wording and clarifications),
sets Last Amended to the change date, and states the reason.

Every plan MUST pass a Constitution Check against these principles, and
`/speckit.analyze` treats a conflict with any MUST as CRITICAL. Reviewers SHOULD
reject plans that propose Vuex, edits to Crowdin-managed locale files, `Shared.js`
importing application modules, new `.js` files, or skipping tests on chrome, auth,
or federation.

**Version**: 2.0.0 | **Ratified**: 2026-09-01 | **Last Amended**: 2026-10-01
