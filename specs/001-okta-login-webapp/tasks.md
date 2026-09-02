---
description: "Task list for Enterprise Okta login — web app slice"
---

# Tasks: Enterprise Okta login — web app slice

**Input**: Design documents from `/specs/001-okta-login-webapp/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md),
[contracts/door-b-url.md](./contracts/door-b-url.md),
[contracts/organization-access-read-model.md](./contracts/organization-access-read-model.md),
[contracts/i18n-keys.md](./contracts/i18n-keys.md)

**Constitution**: `.specify/memory/constitution.md` v1.0.0

**Tests**: **MANDATORY, not optional.** Constitution VI forbids untested behavior landing
in auth, router, or chrome, and this delivery lands in all three. Every implementation
task that changes behavior has a paired test task. Red-green ordering is encouraged but
not enforced (Constitution VI does not require strict TDD); what *is* enforced is that
tests land in the same pull request and coverage does not drop (SC-012).

**Organization**: Tasks are grouped by user story. US1, US2, and US5 are deliberately a
single phase — see Phase 5's note.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: `[US1]` … `[US5]`, mapping to the user stories in [spec.md](./spec.md)
- Every task names its exact file path

## Path conventions

Single-project SPA shell. Source under `src/`, legacy specs under `tests/unit/unit/`.
New tests are colocated under `src/**/__tests__/*.spec.js` (Constitution VI) except where
a change extends an existing suite, which stays where it is. Imports inside `src/` use
the `@/` alias.

---

## Phase 1: Setup

**This phase is empty. There is no setup work.**

This is a brownfield repository, not a new project. No scaffolding, no dependency
install, no lint configuration, no new route, no new store, no migration. The stack,
aliases, test harness, and Sentry wiring all exist and are used as-is. GrowthBook is
already in the app for other flags and is **not** used by this delivery.
Any task proposing otherwise is out of scope — see plan.md's Complexity Tracking.

---

## Phase 2: Foundational (Blocking Prerequisites)

**This phase is empty. There is no blocking prerequisite.**

The three user-story groups share no new infrastructure: US3 touches the message helper
and organization chrome, US4 touches the organization settings form, and US1+US2+US5
touch the router guard and the mobile pre-redirect. They can be implemented in any order
or concurrently. The only sequencing that matters is the ship order in
[Implementation Strategy](#implementation-strategy), which is about risk and upstream
dependencies, not about code coupling.

---

## Phase 3: User Story 3 — Blocked-organization copy stops naming only Google and Microsoft (Priority: P1) 🎯 MVP

**Goal**: Make the blocked-organization explanation provider-agnostic in all four
locales, stop rendering raw reason codes for reasons the app does not recognize
(FR-013), remove the plumbing that could carry an identity-source identifier to the
screen (R8, FR-012), and enforce locale parity mechanically (SC-007).

**Why this is the MVP and not User Story 1**: US3 corrects behavior that is wrong in
production today, ships unflagged, and depends on nothing from door B, Engine, or infra.
See plan.md Phase 2, order 1.

**Independent Test**: Render a blocked organization for each blocking reason — including
one the app does not recognize — in each of the four locales, and confirm no message
names a provider, no raw reason code or literal key reaches the screen, and no
identity-source identifier is reachable by any path.

### Tests for User Story 3

- [X] T001 [P] [US3] Move `tests/unit/unit/utils/orgAccess.spec.js` to `src/utils/__tests__/orgAccess.spec.js`, porting the three existing `isOrgAccessDisabled` cases unchanged, and **delete the original file** so exactly one `orgAccess` suite exists in the repository. The colocated location is the Constitution VI convention and `src/utils/__tests__/` already exists (`normalizeInternalPath.spec.js`).
- [X] T002 [US3] Extend `src/utils/__tests__/orgAccess.spec.js` for the new `getOrgAccessDisabledMessage` contract from `contracts/organization-access-read-model.md` §3: `''` for `null` / `undefined` / `''` reason; each of the five known reasons (`sso_credential_unavailable`, `sso_email_domain_not_allowed`, `sso_password_configured`, `sso_provider_not_allowed`, `sso_session_required`) resolving to its own key; any other reason resolving to `orgs.access_disabled_reason.default`; `t` receiving **no** interpolation parameters for any reason; and a legacy `sso_config` argument changing nothing. Delete the existing `{providers}` interpolation case — it asserts the behavior this delivery removes. *(Depends on T001 — same file.)*
- [X] T003 [P] [US3] Create `src/locales/__tests__/localeParity.spec.js` asserting, across `src/locales/{en,pt_br,es,ro}.json`: (a) an identical **ordered** key sequence at every nesting level, and (b) an identical placeholder-name set for every leaf key. The extractor captures the variable name at the head of a brace group so it matches both `{name}` and the `count` in `{count, plural, one{…} other{…}}` (the app registers a custom ICU compiler — `src/utils/plugins/icuMessageCompiler.js`). Do **not** assert repo-wide alphabetical ordering (research R7) and do **not** hardcode a key count — assert parity, not totals.
- [X] T004 [US3] Add the `{'@'}` literal-escape case as a named test in `src/locales/__tests__/localeParity.spec.js`: `orgs.sso.invalid_domain` (`Enter a domain without {'@'} (example: yourcompany.com)`) must yield an **empty** placeholder set, because `{'@'}` is vue-i18n's literal escape and not a placeholder. Anchoring the name pattern to `[A-Za-z_][\w]*` excludes it; the test exists so a future extractor rewrite cannot silently regress it. *(Depends on T003 — same file.)*
- [X] T005 [P] [US3] Update `tests/unit/unit/components/orgs/OrgCard.spec.js`: assert the component declares no `ssoConfig` prop, that `disabledTooltipText` resolves from `accessDisabledReason` alone, that an unrecognized reason renders the `default` message rather than the literal string `orgs.access_disabled_reason.<reason>`, and that no identity-source value passed anywhere in props reaches the rendered output (SC-006).
- [X] T006 [P] [US3] Update `tests/unit/unit/components/orgs/orgList.spec.js`: assert `OrgCard` is rendered without an `ssoConfig` binding, and refresh `tests/unit/unit/components/orgs/__snapshots__/orgList.spec.js.snap` if the removed binding appears there.

### Implementation for User Story 3

- [X] T007 [P] [US3] Rewrite `src/utils/orgAccess.js`: delete `SSO_PROVIDER_LABELS` and `formatAllowedProviders`, drop the `sso_config` destructure from `getOrgAccessDisabledMessage`'s first argument, add an explicit known-reason allowlist, fall through to `orgs.access_disabled_reason.default` for anything unrecognized, and call `t(key)` with no parameters. Keep `isOrgAccessDisabled`, `ACCESS_STATUS_ACTIVE`, and `ACCESS_STATUS_DISABLED` exactly as they are.
- [X] T008 [P] [US3] Remove the `ssoConfig` prop declaration from `src/components/orgs/OrgCard.vue` and the `sso_config: this.ssoConfig` argument from its `disabledTooltipText` computed. *(Lands with T007 and T009 — they are one behavior across three files.)*
- [X] T009 [P] [US3] Remove the `:ssoConfig="org.sso_config"` binding from the `OrgCard` usage in `src/components/orgs/orgList.vue`.
- [X] T010 [P] [US3] Update all four of `src/locales/{en,pt_br,es,ro}.json` in one change (Constitution IV): rewrite `orgs.access_disabled_reason.sso_session_required`, rewrite `orgs.access_disabled_reason.sso_provider_not_allowed` **removing its `{providers}` placeholder**, and add `orgs.access_disabled_reason.default` as the first key of that object. Use the exact copy in `contracts/i18n-keys.md` §1.1, §2.1, and §2.2 for every language — English is `Access to this organization is unavailable. Contact the organization admin.`, `Your current session doesn't meet this organization's sign-in requirements. Sign in the way this organization requires.`, and `Your current sign-in method isn't allowed in this organization. Sign in the way this organization requires.` respectively. No key is removed.
- [X] T011 [US3] Verify the removal per the Constitution's Compatibility and Caution section: grep the repository to confirm `SSO_PROVIDER_LABELS`, `formatAllowedProviders`, `ssoConfig`, and `{providers}` appear nowhere in `src/`, nowhere in `rspack.config.js`'s `exposes` (still only `./sharedStore`), and in no `postMessage` payload. Apparently-dead code is only dead once this check passes. *(Depends on T007, T008, T009, T010.)*

**Checkpoint**: The blocked-organization explanation is provider-agnostic in four
locales, an unknown reason renders a safe generic message, the identifier is
structurally unreachable from the message path, and locale parity is enforced in CI.
Shippable on its own, unflagged.

---

## Phase 4: User Story 4 — Existing SSO settings cannot silently break an Okta-enabled organization (Priority: P2)

**Goal**: Present the SSO settings surface as read-only for any organization whose
identity-source allowlist the form cannot faithfully represent, and close every write
path that could replace or empty that allowlist (FR-015, FR-016, SC-008).

**Independent Test**: Render organization settings for an organization whose
`allowed_sso_providers` holds a value the form does not offer, confirm the SSO section
is read-only and the policy is still visible, and confirm no save path — including a
programmatic one — submits a replacement or empty allowlist.

### Tests for User Story 4

- [X] T012 [P] [US4] Add the `isSsoReadOnly` truth matrix to `tests/unit/unit/components/common/RightBar/UpdateOrg.spec.js`, covering all seven rows of `data-model.md` §5: `[]`, `['google']`, `['microsoft']`, and `undefined` → `false`; `['okta-acme']`, `['google','microsoft']`, and `['google','okta-acme']` → `true`.
- [X] T013 [US4] Add read-only rendering assertions to `tests/unit/unit/components/common/RightBar/UpdateOrg.spec.js`: with `isSsoReadOnly` true, the switch, provider select, domain input, and chips are all `:disabled`, the `orgs.sso.managed_externally` notice renders, and the domain list is still visible — US4 requires the administrator to see the policy, not lose sight of it. *(Depends on T012 — same file.)*
- [X] T014 [US4] Add write-guard assertions to `tests/unit/unit/components/common/RightBar/UpdateOrg.spec.js`: `ssoDirty` is `false` when read-only; `saveChanges` calls `orgs.updateSSOConfig` **zero** times when read-only even after `ssoForm` is mutated programmatically (SC-008's "no sequence of interactions"); and a 2FA-only save calls `account.updateAccount2FAStatus` once and `orgs.updateSSOConfig` zero times — research R9's guard 4, which is structural (a different endpoint with no `sso_config` field) and therefore asserted rather than implemented. *(Depends on T012 — same file.)*
- [X] T015 [US4] Assert the regression net explicitly: `tests/unit/unit/components/common/RightBar/UpdateOrgSSO.spec.js` passes **unmodified**. Run the suite and confirm `git diff --exit-code -- tests/unit/unit/components/common/RightBar/UpdateOrgSSO.spec.js` is clean. This is the cheapest available evidence for FR-018 / SC-010's "byte-for-byte unchanged" claim. **If the implementation requires editing that file, stop — FR-018 is at risk and the change needs re-examination**, not an edited assertion.

### Implementation for User Story 4

- [X] T016 [P] [US4] Add `orgs.sso.managed_externally` to all four of `src/locales/{en,pt_br,es,ro}.json` in one change, positioned between `lockout_error` and `provider_label` (that object is already internally alphabetical). Exact copy for all four languages in `contracts/i18n-keys.md` §1.2 — English is `This organization's sign-in policy is managed by the platform team and can't be edited here.`
- [X] T017 [US4] Add the `isSsoReadOnly` computed to `src/components/common/RightBar/updateOrg.vue`, true when `org.sso_config.allowed_sso_providers` has more than one entry or contains any value outside the existing module-level `SSO_PROVIDERS` constant. Both conditions describe the form's own capability, not knowledge of Okta — no new field, no new constant, no `okta` added to `SSO_PROVIDERS`. Stay in the Options API: Constitution V forbids opportunistic migration and this file has regressed before.
- [X] T018 [US4] Guard 1 in `src/components/common/RightBar/updateOrg.vue`: bind `:disabled="isSsoReadOnly"` on the SSO `UnnnicSwitch`, `UnnnicSelect`, `UnnnicInput`, and `UnnnicChip`, and render the `orgs.sso.managed_externally` notice reusing the existing `weni-update-org__sso-helper` class. No new component, no new SCSS value — `$unnnic-*` tokens only. *(Depends on T016, T017.)*
- [X] T019 [US4] Guard 2 in `src/components/common/RightBar/updateOrg.vue`: `ssoDirty` returns `false` when `isSsoReadOnly` is true, so the dirty check cannot fire. *(Depends on T017.)*
- [X] T020 [US4] Guard 3 in `src/components/common/RightBar/updateOrg.vue`: `saveChanges` skips `updateSSOConfig` unconditionally when `isSsoReadOnly` is true. This is the guard that survives a future refactor combining the SSO and 2FA saves, which is why it is not redundant with guards 1 and 2 — state that in the pull request so a reviewer does not remove it. *(Depends on T017.)*

**Checkpoint**: An organization whose allowlist the form cannot express is visible but
unwritable; organizations with an empty, `google`, or `microsoft` allowlist behave
exactly as they do today, evidenced by `UpdateOrgSSO.spec.js` passing unmodified.
Shippable on its own, unflagged.

---

## Phase 5: User Stories 1 + 2 + 5 — Door B, identifier validation, and entry-door diagnostics (Priority: P1 / P1 / P3)

**Goal**: Read a single reserved `idp` query parameter in the existing
`router.beforeEach`, validate it syntactically, forward it as `keycloak-js`'s `idpHint`,
prevent the redirect loop that is the library's default behavior, decide FR-008 reuse
versus re-authentication, and tag the entry door in Sentry. Door B is not flag-gated
(research R10, reversed 2026-09-02).

**Why these three are one phase**: US2's validation is inseparable from US1's forwarding
— same guard branch, same predicate, and a rejected identifier is by design
indistinguishable from an absent one. US5 is a three-line Sentry tag on that same
branch. Split apart, none of the three would be independently testable.

**Independent Test**: Open a valid door B address while signed out and confirm the
browser leaves for the identity service on the first navigation carrying
`kc_idp_hint`, with a `redirect_uri` free of `idp` and no app view rendered in between;
then confirm every identifier in `contracts/door-b-url.md` §5.2 lands on the default
login path with no `kc_idp_hint` at all.

### Tests for User Story 1 + 2 + 5

All router tests live in **`src/__tests__/router.spec.js`**, which does not exist today —
`src/router.js` has no spec at all, so this is net-new coverage on the most sensitive
file in the delivery. Because they share one file, these tasks are sequential.

- [X] T021 [US2] Create `src/__tests__/router.spec.js` with a table-driven validation test over the exported identifier predicate, covering **all 21 rejections (R1–R21) and both acceptances (A1, A2)** in `contracts/door-b-url.md` §5.2–§5.3 — absent, empty, single character, 64 characters, two mis-cased forms, whitespace-padded, embedded whitespace, encoded path separator, encoded fragment marker, encoded parameter injection, null byte, path traversal, absolute URL, scheme-relative URL, dangerous scheme, script-bearing, hostname-shaped, disallowed separator, leading hyphen, and the repeated parameter that `vue-router` surfaces as an array. SC-002 requires at least 12 documented inputs; the table is the enforcement of the full set. Assert values are rejected, never repaired — no trimming, no case folding, no unescaping.
- [X] T022 [US1] Add the signed-out accepted-identifier branch test to `src/__tests__/router.spec.js`: `Keycloak.keycloak.login` is called **exactly once** with `{ idpHint, redirectUri }`, `next` is not called, and no route component resolves (FR-002, SC-001 — no organization picker, account chooser, provider list, or flash of the shared login).
- [X] T023 [US1] Add the `prompt: 'login'` assertions to `src/__tests__/router.spec.js`, on **both** FR-008 branches: a live session whose `tokenParsed.identity_provider` differs from the identifier, and a live session where the claim is absent, empty, or not a string. **This assertion is the requirement.** A test asserting only that `login` received `idpHint` passes while FR-008 is broken: without `prompt`, Keycloak honours its own SSO cookie, never reaches the identity provider, and returns the very session the app just rejected (research R2, SC-013). Assert the signed-out branch passes **no** `prompt`.
- [X] T024 [US1] Add the redirect-loop assertions to `src/__tests__/router.spec.js`: the `redirectUri` handed to `login` does **not** contain `idp` while preserving origin, path, every other query parameter, and the fragment; and a second guard invocation on the stripped address calls `login` **zero** times. `keycloak-js` defaults `redirectUri` to `location.href`, so the loop is the library's default behavior and the explicit `redirectUri` is the only thing preventing it (research R4, SC-003).
- [X] T025 [US1] Add the session-reuse branch test to `src/__tests__/router.spec.js`: when the claim equals the validated identifier, `login` is called zero times and `next` is called with `idp` removed from the query and every other parameter preserved. This is the second of the two required strip points, and it is also what keeps the parameter out of the query forwarded into federated and iframe remotes (`useFederatedModule.js`, `useChatsFederatedModule.js`, `ExternalSystem.vue`) — a Constitution I concern, not only an FR-007 one.
- [X] T026 [US2] Add the FR-004 invariant test from `contracts/door-b-url.md` §5.3 (case S1) to `src/__tests__/router.spec.js`: for `?idp=acme-okta&redirect_uri=https://evil.example.com`, the identifier is accepted, the `redirectUri` is computed from the app's own `window.location`, and `redirect_uri` rides along as inert passenger data that never influences the Keycloak destination. This is an invariant test, not a validation case.
- [X] T027 [US1] **Withdrawn (2026-09-02, R10 reversal)**. Was: fail-closed tests in `src/__tests__/router.spec.js` for `enterprise-okta-direct-start` off and GrowthBook uninitialized. Door B is not gated; do not add those tests.
- [X] T028 [US1] Add existing-behavior regression tests to `src/__tests__/router.spec.js` for the paths the door B branch sits next to: the `#state=` fragment cleanup still fires, the `externals` force-remount redirect still fires, an unauthenticated door A navigation still calls `login()` with no arguments, and `afterKeycloakInitialization` on `/register` still short-circuits. These are not door B tests — they are the Constitution II net for adding conditions to the platform's single auth gate.
- [X] T029 [US5] Add the entry-door diagnostics test to `src/__tests__/router.spec.js`: `Sentry.setTag('entry_door', …)` is called with exactly one of the three literals `default`, `direct_start`, `direct_start_rejected`, matching door A, an accepted identifier, and a rejected identifier respectively; and **no** Sentry call anywhere receives the identifier itself (NFR-003, SC-011).
- [X] T030 [P] [US1] Create `src/__tests__/main.spec.js` asserting the mobile pre-redirect from research R5: on a simulated mobile user agent with `screen.width < 1024` and `ontouchstart` present, a door B address still hard-navigates to the chats origin, and the `redirect` query parameter on that URL carries the path **without** `idp`. Door B stays unsupported on mobile; what this closes is the parameter being packaged to another origin and firing later as pending state. *(This is the one path not named in the delivery's file inventory; it is required by plan.md §VI's obligation table row for `src/main.js`, which names the assertion but no host file.)*

### Implementation for User Story 1 + 2 + 5

- [X] T031 [US2] Add the reserved parameter name and the validation predicate to `src/router.js` and **export the predicate** (the file already exports `routes`) so T021 can table-drive it without simulating navigation: the raw value must be a primitive string — an array from a repeated parameter is rejected without further inspection — and must match `/^[a-z0-9][a-z0-9-]{1,62}$/`. No normalization of any kind. No new utility file: the inventory adds no module.
- [X] T032 [US1] **Withdrawn (2026-09-02, R10 reversal)**. Was: read `enterprise-okta-direct-start` from `getGrowthBook()` / `gbInstance` in `src/router.js`. Door B is not gated; do not add that read. *(Was depends on T031; T033 now depends on T031 only.)*
- [X] T033 [US1] Capture and validate `to.query.idp` **synchronously at the top of the existing `router.beforeEach`**, before `await Keycloak.isAuthenticated()`, into a guard-local variable in `src/router.js`. Guard-local, never module-level and never persisted — that is what makes the "double entry", "abandoned sign-in", and "pending state that fires later" edge cases fall out for free (research R3). Do not add a second `beforeEach` and do not add a second `keycloak.init()`. *(Depends on T031.)*
- [X] T034 [US1] Add the door B branch after the await in `src/router.js`, comparing the validated identifier against `Keycloak.keycloak.tokenParsed?.identity_provider` by exact string equality: signed out or expired → `login({ idpHint, redirectUri })`; claim equals the identifier → `next({ ...to, query })` with `idp` removed; claim differs, absent, empty, or non-string → `login({ idpHint, prompt: 'login', redirectUri })`. Position the branch so it cannot short-circuit the existing `#state=` fragment cleanup — the two operate on different parts of the address and stay separate. *(Depends on T033, T035.)*
- [X] T035 [US1] Build the explicit `redirectUri` in `src/router.js` from `window.location` with `idp` deleted, preserving origin, path, all other query parameters, and the fragment. Never derive it from an input parameter. Do not set `kc.redirectUri` globally in `src/services/Keycloak.js` — that would change door A's return destination platform-wide. *(Depends on T031.)*
- [X] T036 [US5] Set `Sentry.setTag('entry_door', 'default' | 'direct_start' | 'direct_start_rejected')` in the guard in `src/router.js` using `@sentry/browser`, already initialized in `src/main.js`. Record the door only — never the identifier, at any level. *(Depends on T033.)*
- [X] T037 [P] [US1] Delete the `idp` parameter from the `redirect` value handed to chats in the mobile pre-redirect at the top of `src/main.js`. Keep the bounce and keep door B unsupported on mobile; this removes behavior rather than adding it. `src/main.js` requires mobile-UA regression testing — see quickstart §2.5.

**Checkpoint**: Door B works end to end, hostile identifiers degrade silently to door A,
the loop is closed at both strip points, and support can tell the doors apart. Merge
enables door B. Runtime quality of the company-Okta leg still depends on the two
external blockers below.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T038 Verify coverage did not drop on any touched file (SC-012), comparing the `coverage/` report against `main` for `src/router.js`, `src/main.js`, `src/utils/orgAccess.js`, `src/components/orgs/OrgCard.vue`, `src/components/orgs/orgList.vue`, and `src/components/common/RightBar/updateOrg.vue`. `src/router.js` goes from no spec to a spec, so its number should rise materially.
- [X] T039 Add a `CHANGELOG.md` entry at the top of the file for the new version, grouped under `Added` / `Changed` / `Fixed`: **Added** — door B direct-start entry, and the entry-door Sentry tag; **Changed** — provider-agnostic blocked-organization copy in all four locales, and read-only SSO settings for organizations the form cannot represent; **Fixed** — an unrecognized blocking reason rendering its raw key, and an ordinary save clearing an allowlist it could not represent. The release version lives in the git tag and the CHANGELOG header, not in `package.json`.
- [X] T040 Run the full CI sequence on Node 22 — the version pinned in `.github/workflows/unit-tests.yaml` — as `npm ci && npm run build && npm run lint && npm run test:coverage`. All four steps must pass (Constitution VI). Note that `node -v` in this workspace may report v18; switch before running, or the results will not match CI.

---

## External blockers — cross-squad, **not** implementation tasks in this repository

These two are owned by Engine/infra. They affect runtime quality of door B after merge;
they do **not** gate a flag flip, because door B is not flag-gated (research R10,
2026-09-02). Nothing in this repository should attempt to code around them.

| # | Owner | What | Consequence while absent |
|---|---|---|---|
| B1 | Engine/infra | An identity-provider alias configured on the realm | Keycloak ignores `kc_idp_hint` as advisory and renders the normal login. Door B degrades to door A, which is the designed fallback (research R1) |
| B2 | Engine/infra | A Keycloak **User Session Note** protocol mapper projecting the `identity_provider` session note into a token claim of the same name | The claim is absent on every session, so every live-session door B entry is a mismatch and forces a re-authentication. Correct per FR-008; accepted as live until the mapper lands (research R2, R10) |

Merge enables door B. Walk [quickstart.md](./quickstart.md) §2 against staging once B1
and B2 are confirmed for a full company-Okta path. Quickstart §2.2, §3, §4, and §5
depend on neither blocker and can be validated as soon as the phases merge.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: empty.
- **Phase 2 (Foundational)**: empty. Nothing blocks any user story.
- **Phase 3 (US3)**, **Phase 4 (US4)**, **Phase 5 (US1+US2+US5)**: mutually independent.
  They share no file, no helper, and no locale object — US3 touches
  `orgs.access_disabled_reason`, US4 touches `orgs.sso`.
- **Phase 6 (Polish)**: depends on whichever phases are being shipped.

### Within each phase

- Tests are listed before implementation and land in the same pull request.
- Phase 3: T001 → T002 (same file); T003 → T004 (same file); T007/T008/T009/T010 land
  together as one behavior; T011 verifies after all four.
- Phase 4: T012 → T013, T014 (same file); T017 before T018, T019, T020 (all depend on the
  computed); T016 before T018 (the notice needs its key).
- Phase 5: T021 first (it needs only the exported predicate); T031 → T033 → T034,
  with T035 required by T034; T037 is independent of the guard work entirely. T027 and
  T032 are withdrawn (R10 reversal) and are not in this chain.

### Story dependencies

None. US3 and US4 are corrections to shipping behavior. US1+US2+US5 depend on nothing
in this repository. B1 and B2 affect runtime quality of the company-Okta leg, not a
flag flip.

---

## Parallel Opportunities

Real parallelism here is mostly **across phases**, not within them, because Phase 5's
tests all share one new file and its implementation all shares `src/router.js`.

```text
# Three developers, one per phase, no coordination needed:
Developer A: Phase 3 (US3)  — orgAccess.js, OrgCard.vue, orgList.vue, locales, parity spec
Developer B: Phase 4 (US4)  — updateOrg.vue, UpdateOrg.spec.js, orgs.sso locale key
Developer C: Phase 5 (US1+US2+US5) — router.js, main.js, router.spec.js, main.spec.js
```

Within Phase 3, four test tasks touch four different files:

```text
T001  src/utils/__tests__/orgAccess.spec.js
T003  src/locales/__tests__/localeParity.spec.js
T005  tests/unit/unit/components/orgs/OrgCard.spec.js
T006  tests/unit/unit/components/orgs/orgList.spec.js
```

and three implementation tasks do the same:

```text
T007  src/utils/orgAccess.js
T008  src/components/orgs/OrgCard.vue
T009  src/components/orgs/orgList.vue
```

Within Phase 5, only T030 (`src/main.spec.js`) and T037 (`src/main.js`) run alongside the
router work.

---

## Implementation Strategy

### MVP first — and the MVP is User Story 3, not User Story 1

1. Complete **Phase 3 (US3)**.
2. **STOP and VALIDATE**: quickstart §3 and §5. No flag, no upstream dependency.
3. Ship. Copy that is wrong in production today is now correct in four locales, and the
   FR-013 raw-reason-code leak is closed.

### Incremental delivery

| Order | Phase | Why here |
|---|---|---|
| 1 | US3 | Highest value per unit of risk. Corrects shipping behavior, no upstream dependency |
| 2 | US4 | Independent. Must ship **before** implantation enables the first Okta organization, not after |
| 3 | US1+US2+US5 | Merge enables door B. B1 and B2 affect runtime quality of the company-Okta leg, not a flag flip. Shipping it last keeps the two corrections from being held behind identity-service work |

Orders 1 and 2 before 3 is deliberate, not a priority ranking: they carry no upstream
dependency, so they can merge and release while the identity service work proceeds in
parallel.

---

## Notes

- `[P]` means a different file with no incomplete dependency. Same-file tasks are never
  `[P]`, which is why Phase 5 has almost none.
- **Do not** generate or accept work for: a login page or first step; an email, password,
  or domain field; Okta token validation; an Okta configuration UI; adding `okta` to
  `SSO_PROVIDERS`; a GrowthBook flag for door B (`enterprise-okta-direct-start` or
  otherwise); a new dependency, store, route, API field, `localStorage` key, or
  second `keycloak.init()`; rewriting `updateOrg.vue` or `OrgCard.vue` to `<script setup>`
  (Constitution V forbids opportunistic migration); or re-sorting the locale files
  alphabetically (244 of 318 objects are unsorted today — research R7's justified
  deviation).
- Four files are **unchanged** by this delivery, and each is a constitutional guarantee:
  `src/services/Keycloak.js` (one `init`, Constitution II), `src/store/Shared.js`
  (Constitution I), `src/utils/growthbook.js` (untouched — this delivery does not read
  a flag), and `rspack.config.js` (`exposes` still only `./sharedStore`).
- Three assertions fail **silently** — the code appears to work while the requirement is
  broken. They are T023 (`prompt: 'login'`), T024 (`redirectUri` free of `idp`, zero
  second-invocation logins), and T015 (`UpdateOrgSSO.spec.js` unmodified). None of them
  may be folded into a broader task. T027 (fail-closed flag) was withdrawn with the
  2026-09-02 R10 reversal.
- Commit with the repository's conventional lowercase prefixes (`feat:`, `fix:`,
  `refactor:`, `test:`, `docs:`); branch as `<type>/<short-kebab-description>`.
