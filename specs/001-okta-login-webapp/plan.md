# Implementation Plan: Enterprise Okta login — web app slice

**Branch**: `001-okta-login-webapp` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-okta-login-webapp/spec.md`

**Constitution**: `.specify/memory/constitution.md` v1.0.0 (ratified 2026-09-01)

---

## Summary

Deliver the web app's slice of Enterprise Okta login: **door B** (a customer-specific
direct-start login address that sends a person straight to their company's sign-in), a
**provider-agnostic blocked-organization explanation**, and a **read-only guard on the
existing SSO settings surface** so it cannot destroy an allowlist it cannot represent.

The technical approach is deliberately small — four surfaces, no new route, no new
store, no new dependency, no new API field:

1. **Door B** is a single reserved query parameter, `idp`, read in the existing
   `router.beforeEach` and forwarded as `keycloak-js`'s `idpHint` login option. The
   pinned `keycloak-js@25.0.6` already supports it, appending `kc_idp_hint` to the
   authorize URL. Validation is syntactic only against `/^[a-z0-9][a-z0-9-]{1,62}$/`;
   a rejected identifier is indistinguishable from an absent one.
2. **Redirect-loop prevention** is the highest-risk detail. The library's default
   adapter falls back to `location.href` for `redirectUri`, which on a door B address
   returns the person to the parameter and starts again. Every door B `login()` call
   passes an explicit `redirectUri` with the parameter deleted, and the session-reuse
   branch strips it in-app with `next()`. Stripping in the guard also keeps the
   parameter out of the query forwarded to federated and iframe remotes.
3. **FR-008 reuse-versus-re-authenticate** reads `identity_provider` from the token,
   treats absent as a mismatch, and — the detail that makes it actually work — passes
   `prompt: 'login'` on the mismatch branch. Without it Keycloak honours its own SSO
   cookie and returns the session the app just rejected. The claim requires a protocol
   mapper from Engine/infra; until it lands, every live-session door B entry forces a
   re-authentication, which is why door B ships behind a GrowthBook flag.
4. **The copy and settings fixes ship unflagged**, because both correct behavior that is
   already wrong in production: the blocked-organization message hard-codes "Google or
   Microsoft" in all four locales, an unrecognized blocking reason renders its raw key
   in a tooltip, and an ordinary save can clear an Okta organization's allowlist.

Full reasoning in [research.md](./research.md).

---

## Technical Context

**Language/Version**: Vue 3.5, Composition API with `<script setup>` for new code,
JavaScript (no TypeScript)

**Primary Dependencies**: `keycloak-js@25.0.6`, `vue-router@4`, `pinia@3`,
`vue-i18n@10`, `@weni/unnnic-system`, `@sentry/browser@8`, `@growthbook/growthbook`,
`axios`. **No dependency added, removed, or changed.**

**Storage**: N/A. No backend in this repository. No new `localStorage` key; the existing
`keycloak:user` entry is untouched.

**Testing**: Vitest 2 + `@vue/test-utils` 2 + `@pinia/testing`, jsdom, `globals: true`,
setup at `tests/unit/unit/setup.js`. Mock at the API boundary
(`vi.mock('@/api/request.js')`).

**Target Platform**: Single-page application shell served at `dash.weni.ai`.
Browserslist: chrome >= 87, edge >= 88, firefox >= 78, safari >= 14.

**Project Type**: Module Federation **host** (shell). Rspack for the application, Vite +
Vitest for tests — two configs, deliberately not unified. Node 22, npm with the
checked-in `package-lock.json`.

**Performance Goals**: Door B completes in exactly one redirect to the identity service
and one return (SC-003). The door B decision is synchronous within the existing guard
and adds no network request — FR-003 forbids a pre-authentication lookup.

**Constraints**:

- Exactly one `keycloak.init()`, exactly one `router.beforeEach` gate, no new redirect
  loop (Constitution II).
- Pinia setup stores only; Vuex must not reappear (Constitution III).
- All four locales updated together with identical structure and placeholders
  (Constitution IV).
- No change to `sharedStore`, Module Federation remotes, or iframe `postMessage`
  contracts (Constitution I).
- No new dependency; `@/` alias; Unnnic `$unnnic-*` tokens; HTTP only via
  `request.$http()` (Constitution V).

**Scale/Scope**: 3 user-facing surfaces, ~6 source files, 4 locale files, ~5 new or
extended test files. Two upstream prerequisites owned by Engine/infra.

**Open unknowns**: none. All ten plan-phase questions are resolved in
[research.md](./research.md). Clarifications Q1–Q3 in the spec are binding inputs.

---

## Constitution Check — Pre-Design Gate

*Evaluated before Phase 0. Re-evaluated after Phase 1 below.*

| Principle | Gate | Verdict |
|---|---|---|
| **I. Federated Contracts Are Public APIs** | No change to `Shared.js`, remotes, or iframe `postMessage` contracts | **PASS** — no file in scope touches `src/store/Shared.js`, `rspack.config.js` `exposes`, or any `forceRemount*` / `updateRoute` / `setLanguage` / `connect:updateExternalToken` handler |
| **II. Auth and Chrome Are Global and Singleton** | One `keycloak.init()`, one `beforeEach`, no redirect loop; chrome changes ship with tests | **PASS with a named risk** — the delivery adds conditions to the single auth gate, which is exactly where redirect loops originate. Escalated to a dedicated Phase 0 question (R4) |
| **III. Pinia Is the Only Store** | Pinia setup stores only; no duplicated state | **PASS** — no store is added. The identifier's owner is the URL |
| **IV. Locale Completeness Is a Ship Gate** | Four locales together, identical structure and placeholders, snake_case, alphabetical, VTEX Content Guide | **PASS with a scoped deviation to justify** — repo-wide alphabetical order is violated today. Escalated to R7 and recorded in Complexity Tracking |
| **V. Match the Existing Stack and Patterns** | No new dependency, `@/` alias, Unnnic tokens, `request.$http()`, `<script setup>` for new code | **PASS** — `idpHint` and `prompt` are existing `keycloak-js` options; Unnnic's `:disabled` covers read-only. `updateOrg.vue` stays Options API, since V forbids opportunistic rewrites |
| **VI. Tests and CI MUST Stay Green** | Tests in the same PR; coverage not dropping; nothing untested in auth, router, or chrome | **PASS with an obligation** — the delivery lands in the router gate and the organization chrome, so tests are mandatory, not optional. `src/router.js` has **no** spec today; one must be created |

**Gate result: PASS.** No violation requires justification. Two items are escalated into
Phase 0 rather than waved through:

- **II** — the redirect-loop risk became research question R4, which found that the
  loop is the library's *default* behavior unless `redirectUri` is passed explicitly.
- **IV** — the alphabetical-ordering conflict became research question R7, which
  measured the baseline before deciding.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-okta-login-webapp/
├── spec.md                                  # Input (complete, no open questions)
├── plan.md                                  # This file
├── research.md                              # Phase 0 — R1–R10 + observability
├── data-model.md                            # Phase 1 — six front-end shapes
├── quickstart.md                            # Phase 1 — validation guide
├── checklists/
│   └── requirements.md                      # Pre-existing
├── contracts/                               # Phase 1
│   ├── door-b-url.md                        # Door B URL contract
│   ├── organization-access-read-model.md    # Read model, asserting no field added
│   └── i18n-keys.md                         # Every key added/changed/removed × 4 locales
└── tasks.md                                 # Phase 2 — NOT created by /speckit-plan
```

### Source Code (repository root)

Real paths, all pre-existing except the two new test files.

```text
src/
├── router.js                                # MODIFIED — door B branch in the single beforeEach
├── main.js                                  # MODIFIED — strip `idp` from the mobile chats redirect
├── services/
│   └── Keycloak.js                           # UNCHANGED — single init, single client (Constitution II)
├── utils/
│   ├── growthbook.js                         # UNCHANGED — read via the module-level singleton
│   ├── orgAccess.js                          # MODIFIED — reason allowlist; remove provider labels
│   └── __tests__/
│       └── orgAccess.spec.js                 # NEW (colocated) — supersedes tests/unit/unit/utils/orgAccess.spec.js
├── components/
│   ├── orgs/
│   │   ├── OrgCard.vue                        # MODIFIED — drop the unused ssoConfig prop
│   │   └── orgList.vue                        # MODIFIED — drop the ssoConfig binding
│   └── common/RightBar/
│       └── updateOrg.vue                      # MODIFIED — isSsoReadOnly + write guards
├── locales/
│   ├── en.json  pt_br.json  es.json  ro.json  # MODIFIED — 2 added, 2 changed, 0 removed
│   └── __tests__/
│       └── localeParity.spec.js               # NEW — mechanical SC-007 check
└── store/
    └── Shared.js                              # UNCHANGED (Constitution I)

src/__tests__/
└── router.spec.js                             # NEW — the door B guard. No router spec exists today

tests/unit/unit/
├── utils/orgAccess.spec.js                    # MODIFIED or removed in favor of the colocated spec
└── components/
    ├── orgs/OrgCard.spec.js                   # MODIFIED — prop removal
    ├── orgs/orgList.spec.js                   # MODIFIED — binding removal
    └── common/RightBar/
        ├── UpdateOrg.spec.js                  # Possibly touched
        └── UpdateOrgSSO.spec.js               # MUST pass UNMODIFIED — the FR-018 / SC-010 regression net
```

**Structure Decision**: single-project SPA shell; the repository's existing layout is
used unchanged. New tests are **colocated** under `src/**/__tests__/*.spec.js` per
Constitution VI, except where a change extends an existing suite in `tests/unit/unit/`,
which stays where it is.

`UpdateOrgSSO.spec.js` passing **unmodified** is treated as a deliverable, not an
incidental: it is the cheapest available evidence for SC-010's "byte-for-byte unchanged"
claim. If the implementation requires editing it, FR-018 is at risk and the change needs
re-examination.

---

## Phase 0 — Research (complete)

[research.md](./research.md) resolves all ten questions. The findings that changed the
design, rather than merely confirming it:

| # | Question | Decision | Why it changed the design |
|---|---|---|---|
| R1 | Identity-source hint | `login({ idpHint })`; `keycloak-js@25.0.6` appends `kc_idp_hint`. An unresolvable alias is ignored server-side | The FR-003/FR-005 fallback is upstream, so the app needs no unknown-alias branch and structurally cannot leak copy |
| R2 | Reading the session's source | `tokenParsed.identity_provider`; requires a protocol mapper from Engine/infra | **`prompt: 'login'` is mandatory on mismatch** — without it Keycloak reuses its SSO cookie and returns the rejected session. Also confirms the pre-mapper forced re-auth, which motivates the flag |
| R3 | Bootstrap ordering | Capture from `to.query` before the `await` in `beforeEach`; compare after | `init` cannot precede the guard and does not strip the query, so the hazard is narrower than feared. Guard-local state also disposes of the "double entry" and "pending state" edge cases |
| R4 | Redirect-loop avoidance | Explicit `redirectUri` minus the parameter, plus an in-app `next()` strip | The loop is the library's **default**. Also found `to.query` is forwarded into remotes and iframes, making the strip a Constitution I concern too |
| R5 | Mobile pre-redirect | Keep the bounce; strip `idp` from the `redirect` handed to chats | The parameter is currently packaged to another origin and can reappear later — a latent loop and forbidden pending state |
| R6 | Accepted identifier form | `idp`, `/^[a-z0-9][a-z0-9-]{1,62}$/`, no normalization; 21 rejections + 2 acceptances | Rejecting rather than repairing keeps SC-002's mis-cased and padded classes as rejections |
| R7 | Locale parity enforcement | Vitest spec asserting ordered key sequence + placeholder sets; **not** repo-wide alphabetical order | Measured 244/318 objects unsorted today; enforcing it would re-sort the locale tree for no requirement |
| R8 | Dead code from Q3 | Remove the labels, the helper, the `sso_config` parameter, the `OrgCard` prop, and its binding; add a reason allowlist + `default` key | Found a live FR-013 defect: an unrecognized reason renders its raw key in a tooltip today |
| R9 | Read-only SSO detection | `isSsoReadOnly` on `length > 1` or an unknown entry; four independent write guards | The 2FA path is already a separate endpoint, so FR-016's scenario is structurally safe; guards close the SSO path itself |
| R10 | Rollout | Door B behind `enterprise-okta-direct-start` (default off, fail closed); the two fixes unflagged | Flagging a bug fix would ship the code and keep the bug. The flag must be read from the module-level GrowthBook singleton, since `inject` is unavailable in the guard |

**Cross-cutting**: entry-door observability is a Sentry tag with a closed three-value
enum, never the identifier.

**Cross-squad dependencies registered** (blocking door B *enablement*, not merge):

| # | Owner | What | Consequence if absent |
|---|---|---|---|
| 1 | Engine/infra | Identity-provider alias on the realm | `kc_idp_hint` ignored; door B degrades to door A |
| 2 | Engine/infra | User Session Note protocol mapper for `identity_provider` | Every live-session door B entry forces a re-authentication |

---

## Phase 1 — Design & Contracts (complete)

### Artifacts

| Artifact | Contents |
|---|---|
| [data-model.md](./data-model.md) | The spec's Key Entities as front-end shapes: direct-start identifier, entry door, organization access outcome, session identity source, SSO settings representability, supported locale set. No persistence anywhere — a requirement of FR-006, not an omission |
| [contracts/door-b-url.md](./contracts/door-b-url.md) | Parameter name, accepted form, behavior per session state, redirect-target invariants, and 23 worked examples covering SC-002's ≥ 12 hostile inputs |
| [contracts/organization-access-read-model.md](./contracts/organization-access-read-model.md) | Fields consumed, reason-resolution allowlist, consumer narrowing, write-path invariants, and the explicit assertion that **no field is added** |
| [contracts/i18n-keys.md](./contracts/i18n-keys.md) | 2 keys added, 2 changed, 0 removed, 1 placeholder removed — full copy in all four locales, with Crowdin implications |
| [quickstart.md](./quickstart.md) | How to exercise door B, a rejected identifier, and a blocked organization against a staging realm, plus the locale parity check and a troubleshooting table |

### Design decisions worth stating at plan level

**One guard, one branch point.** The door B logic is a branch inside the existing
`router.beforeEach`, positioned so it cannot short-circuit the existing `#state=`
fragment cleanup. The two operate on different parts of the address and are kept
separate deliberately.

**The identifier's owner is the URL.** No store, no module-level variable, no
`localStorage`. Guard-local state is what makes the "double entry", "abandoned sign-in",
and "pending state that fires later" edge cases fall out for free rather than needing
queues or locks.

**FR-012 is made structural, not conventional.** Removing the `sso_config` parameter,
the `OrgCard` prop, and the `orgList` binding means the message path has no access to an
identity-source identifier. It is unreachable by construction, not by discipline.

**SC-002 lives in the contract, SC-002's enforcement lives in unit tests.** The 21
rejection cases are a table-driven test against the validation predicate; browser checks
in the quickstart confirm end-to-end shape rather than enumerating the set.

---

## Constitution Check — Post-Design Gate

*Re-evaluated against the Phase 1 design.*

### I. Federated Contracts Are Public APIs — **PASS**

| Check | Result |
|---|---|
| `src/store/Shared.js` | Not in the file list. No getter renamed, no return shape changed |
| `rspack.config.js` `exposes` | Unchanged — still only `./sharedStore` |
| Remotes (`insights`, `bulk_send`, `agent_builder`, `chats`, `integrations`) | Untouched |
| iframe `postMessage` (`forceRemount*`, `updateRoute`, `setLanguage`, `connect:updateExternalToken`) | Untouched. The token-refresh `setInterval` and its `#intelligence` message are unchanged |
| `tryImportWithRetries` / `safeAsyncComponent` | No remote import added |

**Strengthened by design**: R4 found that `to.query` is forwarded wholesale into
federated routes (`useFederatedModule.js`, `useChatsFederatedModule.js`) and iframe
navigation (`ExternalSystem.vue`). Stripping `idp` in the guard means no remote ever
observes it, so the query contract remains not merely compatible but **identical**.

**Removed code cleared**: `SSO_PROVIDER_LABELS` and `formatAllowedProviders` are
module-private to `src/utils/orgAccess.js` and appear in no federation contract and no
`postMessage` payload — verified per the Compatibility and Caution section, which
requires grepping before removing apparently-dead code.

### II. Auth and Chrome Are Global and Singleton — **PASS**

| Check | Result |
|---|---|
| `keycloak.init()` call sites | Still exactly one, inside `Keycloak.isAuthenticated()`. `hasInitialized` untouched |
| `router.beforeEach` count | Still one. Door B is a branch within it, not a second guard |
| Token-refresh cadence | Unchanged 6 s `setInterval`; the `#intelligence` `postMessage` is untouched |
| No new redirect loop | **Actively designed against.** Explicit `redirectUri` minus the parameter on the outbound branch; `next()` strip on the reuse branch. R4 documents that the loop is the library default, so this is the specific mitigation, not a general assurance |
| Chrome changes ship with tests | `OrgCard.vue` and `orgList.vue` are organization chrome and both are covered. `src/router.js` gets its first spec |
| Sidebar / Topbar / `app.vue` | Not modified |

**Residual risk, stated plainly**: this delivery adds conditions to the platform's single
auth gate. Three mitigations are load-bearing and each must be asserted by a test, since
each fails silently: (a) `login` is called exactly once per guard invocation; (b) the
`redirectUri` passed to `login` does not contain `idp`; (c) a second guard invocation on
the stripped address calls `login` zero times.

### III. Pinia Is the Only Store — **PASS**

No store added, no Vuex reintroduced, no state duplicated. The identifier's single source
of truth is the URL; the session's identity source is read from the live token and never
copied. The GrowthBook flag is read from the existing module-level singleton in
`src/utils/growthbook.js` rather than through a new store — necessary because the guard
runs outside any component or store setup, so `inject(gbKey)` is unavailable.

### IV. Locale Completeness Is a Ship Gate — **PASS with one justified deviation**

| Check | Result |
|---|---|
| Every user-visible string via `$t` | Yes. All copy in [contracts/i18n-keys.md](./contracts/i18n-keys.md) |
| Four locales in the same change | Yes — `en`, `pt_br`, `es`, `ro` for both added and both changed keys |
| Identical nested structure | Yes; enforced mechanically by the new parity spec |
| Matching placeholders | Yes — every touched key is placeholder-free after the change; `{providers}` is removed from all four simultaneously |
| snake_case keys | Yes — `default`, `managed_externally` |
| Alphabetical order | **Scoped deviation.** New keys are inserted in alphabetical position within their own object (both are already internally sorted). Repo-wide ordering is not enforced: 244 of 318 objects violate it today, identically in all four files. See Complexity Tracking |
| VTEX Content Guide | Sentence case, no "please", no personal pronouns, ≤ 2 sentences and ≤ 240 characters, per-language colon and punctuation rules. English uses contractions; the others do not |
| No invented npm translation script | Correct — a Vitest spec on the existing CI step |

### V. Match the Existing Stack and Patterns — **PASS**

| Check | Result |
|---|---|
| Stack unchanged | Vue 3.5, Rspack for the app, Vite/Vitest for tests, Node 22, npm with the checked-in lockfile |
| No dependency added or downgraded | Correct. `idpHint` and `prompt` are existing `keycloak-js@25.0.6` options; `:disabled` is existing Unnnic; Sentry and GrowthBook are already wired |
| `<script setup>` for new components | No new component. `updateOrg.vue` and `OrgCard.vue` stay Options API — V forbids opportunistic rewrites, and both have caused regressions before |
| `@/` alias | Used in all new imports |
| Unnnic tokens, scoped SCSS | The read-only notice reuses the existing `weni-update-org__sso-helper` class and `$unnnic-*` tokens. No hardcoded color or spacing |
| HTTP via `request.$http()` | No new request is added at all. FR-003 forbids a pre-authentication lookup |
| Feature flags via GrowthBook | Yes — `enterprise-okta-direct-start` |
| Browserslist compliance | `URL` / `URLSearchParams`, `String.prototype.match`, `Array.prototype.every`, and optional chaining are all within chrome 87 / edge 88 / firefox 78 / safari 14 |
| No `.env*` or secret committed | Correct |

### VI. Tests and CI MUST Stay Green — **PASS with obligations**

| Surface | Test obligation |
|---|---|
| `src/router.js` door B guard | **New** `src/__tests__/router.spec.js`. No router spec exists today, so this is net-new coverage on the most sensitive file in the delivery |
| Identifier validation | Table-driven over the 21 rejections and 2 acceptances in the URL contract |
| FR-008 branches | Reuse, mismatch, and undeterminable — the mismatch and undeterminable cases **must assert `prompt: 'login'`**, or the test passes while the requirement is broken |
| Redirect-loop prevention | Assert `login` called once, `redirectUri` free of `idp`, and zero `login` calls on the stripped address |
| Feature flag | Off and uninitialized both behave as door A (fail closed) |
| `src/utils/orgAccess.js` | Known reasons, unknown reason → `default`, no reason → `''`, and no parameters passed |
| `OrgCard.vue` / `orgList.vue` | Prop and binding removal; no identifier reaches the rendered output |
| `updateOrg.vue` | `isSsoReadOnly` true/false matrix; `updateSSOConfig` never called when read-only; a 2FA save sends no SSO request |
| `src/main.js` | Mobile UA: still bounces to chats, `redirect` value free of `idp` |
| Observability | `entry_door` tag is one of three literals and never the identifier |
| Locale parity | The new `localeParity.spec.js`, including the `{'@'}` literal-escape case |

Coverage must not drop on `src/router.js`, `src/main.js`, `src/utils/orgAccess.js`,
`src/components/orgs/OrgCard.vue`, `src/components/orgs/orgList.vue`, and
`src/components/common/RightBar/updateOrg.vue` (SC-012). CI
(`npm ci && npm run build && npm run lint && npm run test:coverage`) must pass.

`UpdateOrgSSO.spec.js` must pass **unmodified** — the FR-018 / SC-010 evidence.

### Out-of-bounds check

Confirmed absent from the design: a login page, a first step, an email or password
field, domain-mapping logic, Okta token validation, an Okta configuration UI, and any
change to organizations without customer-Okta enablement. Excluded by FR-017 through
FR-022 and owned by Engine/infra or Connect's backend.

**Post-design gate result: PASS.** One scoped deviation recorded below.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| **Constitution IV — repo-wide alphabetical key ordering not enforced** for the four locale files | The mechanical SC-007 check asserts ordered-sequence parity and placeholder parity, both of which hold today (1013 keys, zero divergences). Adding an alphabetical assertion would fail on landing: 244 of 318 objects are unsorted today, identically in all four files | Sorting the tree to satisfy the assertion would touch most of `src/locales/`, invalidate Crowdin context on strings unrelated to this feature, and carry real merge-accident risk — for a property no requirement in this spec asks to be enforced globally. **Mitigation**: keys added here are inserted in alphabetical position within their own object, and both objects touched are already internally sorted, so a reviewer can verify compliance by eye. Full reasoning in research R7 |

No other principle requires justification. In particular the delivery adds no
dependency, no store, no route, no API field, and no second `init` — so the usual
sources of complexity debt are absent by construction.

---

## Phase 2 — Next Step

Run `/speckit-tasks` to generate `tasks.md`. The task breakdown should follow the user
stories' priorities, which are independently deliverable in this order:

| Order | Scope | Rationale |
|---|---|---|
| 1 | **US3** — provider-agnostic copy + FR-013 allowlist + R8 dead-code removal + locale parity spec | Highest value per unit of risk. Fixes copy that is wrong in production today, needs nothing from door B and nothing from Engine/infra, and ships unflagged |
| 2 | **US4** — `isSsoReadOnly` and the write guards | Also unflagged and independent. Must ship before implantation enables the first Okta organization, not after |
| 3 | **US1 + US2 + US5** — door B, validation, and the entry-door tag, behind the flag | One change: US2's validation is inseparable from US1's forwarding, and the observability tag is three lines on the same branch. Blocked on nothing for merge; blocked on both Engine/infra prerequisites for enablement |

Order 1 and 2 before 3 is deliberate: they carry no upstream dependency and no flag, so
they can merge and release while the identity service work proceeds in parallel.
