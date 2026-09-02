# Quickstart: validating the Okta login web app slice

**Feature**: `001-okta-login-webapp` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

How to exercise door B, a rejected identifier, and a blocked organization locally
against a staging realm, plus how to run the locale parity check.

This is a validation guide, not an implementation guide. Shapes and rules live in
[`data-model.md`](./data-model.md) and [`contracts/`](./contracts/); tasks live in
`tasks.md`.

---

## Prerequisites

**Local toolchain**

- Node 22 (`.github/workflows/unit-tests.yaml` pins CI to 22). `node -v` in this
  workspace currently reports v18 — switch before running the suite, or coverage and
  build results will not match CI.
- `npm ci` — never `npm install --force`; `package-lock.json` is the source of truth.
- `.env.local` copied from `.env.sample` and populated. Never commit it.

**Environment variables that matter here** (all read through `getEnv` in
`src/utils/env.js`):

| Variable | Why |
|---|---|
| `KEYCLOAK_ISSUER`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_REALM` | Point at the **staging** realm |
| `ROOT_API` | Connect API serving the organization list |
| `MODULES_YAML` | Needed for the mobile check in §2.5 (`chats` origin) |

**Upstream prerequisites for the full door B path** — owned by Engine/infra, not by this
repository:

| # | Prerequisite | Without it |
|---|---|---|
| 1 | An identity-provider alias configured on the staging realm (e.g. `acme-okta`) | Keycloak ignores `kc_idp_hint` and renders the normal login. §2.1 still validates the outbound redirect, but not the company sign-in leg |
| 2 | A **User Session Note** protocol mapper projecting the `identity_provider` session note into the token (research R2) | The claim is absent on every session, so every live-session door B entry forces a re-authentication. §2.4 will show a redirect where it should show reuse |

Prerequisites 1 and 2 are cross-squad dependencies. Validate §2.2, §2.3, §3, §4, and §5
first — none of them depends on either. Door B itself is not flag-gated: merge enables
it (research R10, 2026-09-02).

**Staging fixtures to request from implantation**

| Fixture | Used by |
|---|---|
| An organization with `allowed_sso_providers: ['<okta-alias>']` | §3.2, §4.2 |
| An organization with `access_status: 'disabled'` and `access_disabled_reason: 'sso_session_required'` | §3.1 |
| An organization with `allowed_sso_providers: ['google']` | §4.1 regression baseline |

---

## Running locally

```bash
npm ci
npm run dev          # rspack dev server with HMR
```

Then open the app at the dev server's origin. Substitute that origin for
`http://localhost:8080` below if it differs.

---

## 1. Fast feedback loop (no realm needed)

Almost everything in this delivery is unit-testable, so start here.

```bash
npm run test                       # watch mode
npm run test -- localeParity        # just the parity check
npm run test:coverage               # what CI runs
```

Run the full CI sequence before pushing:

```bash
npm ci && npm run build && npm run lint && npm run test:coverage
```

**Coverage obligation (SC-012)**: coverage must not drop on any touched file. Compare
the `coverage/` report for `src/router.js`, `src/utils/orgAccess.js`,
`src/components/orgs/OrgCard.vue`, `src/components/orgs/orgList.vue`,
`src/components/common/RightBar/updateOrg.vue`, and `src/main.js` against `main`.

---

## 2. Exercising door B

### 2.1 Accepted identifier, signed out (US1, SC-001)

1. Clear site data for the dev origin — cookies, `localStorage`, and session storage.
   `localStorage['keycloak:user']` in particular, or `init` restores a session and you
   will validate §2.4 instead.
2. Open `http://localhost:8080/?idp=acme-okta`.

**Expected**

- The browser leaves for the Keycloak issuer on the **first** navigation.
- No app view renders in between: no organization picker, no account chooser, no
  provider list, no flash of the shared login.
- The authorize URL carries `kc_idp_hint=acme-okta`.
- The authorize URL's `redirect_uri` is `http://localhost:8080/` — **without** `idp`.
- With prerequisite 1 satisfied, the company sign-in appears; completing it lands on the
  normal post-login destination.
- After the return leg, the address contains no `idp` parameter (FR-007).

**How to inspect**: open DevTools → Network with "Preserve log" enabled *before*
navigating; the authorize request is the first document request. Read `kc_idp_hint` and
`redirect_uri` from its query string.

**Redirect-loop check (SC-003)**: the Network log must show exactly one navigation to
the issuer and one return. More than one round trip means `redirectUri` still carries the
parameter — the failure mode research R4 exists to prevent.

### 2.2 Rejected identifier (US2, SC-002)

Try these against a cleared session. The full documented set is in
[`contracts/door-b-url.md`](./contracts/door-b-url.md) §5.2; these three are the
highest-signal spot checks.

| Address | Class |
|---|---|
| `http://localhost:8080/?idp=Acme-Okta` | mis-cased |
| `http://localhost:8080/?idp=https%3A%2F%2Fevil.example.com` | absolute URL |
| `http://localhost:8080/?idp=acme-okta&idp=other` | repeated parameter |

**Expected for every one**

- The browser leaves for the Keycloak issuer, and the authorize URL has **no**
  `kc_idp_hint` parameter at all.
- The destination is the configured issuer only — never `evil.example.com`.
- The default login renders.
- No app-owned message names a customer, an organization, or an identity source, and
  none acknowledges the identifier (FR-005).

The 20-input table is the unit test's job; browser checks are for confirming the
end-to-end shape, not for enumerating the set.

### 2.3 Hostile sibling parameter (FR-004)

Open `http://localhost:8080/?idp=acme-okta&redirect_uri=https://evil.example.com`.

**Expected**: `kc_idp_hint=acme-okta` is present, and the authorize URL's `redirect_uri`
points at `localhost:8080` — never `evil.example.com`. The extra parameter rides along
as inert passenger data.

### 2.4 Door B with a live session (FR-008, SC-013)

**Requires prerequisite 2.** Without the protocol mapper the claim is absent, every
entry is a mismatch, and this section will show a redirect where it should show reuse.
That is correct behavior, not a bug — confirm the mapper is in place before reading a
redirect here as a failure.

| Setup | Expected |
|---|---|
| Signed in through `acme-okta`, open `?idp=acme-okta` | **No redirect.** The `idp` parameter is stripped from the address and the app renders |
| Signed in through `other-okta`, open `?idp=acme-okta` | Redirect to the issuer with `kc_idp_hint=acme-okta` **and `prompt=login`** |
| Signed in with a platform password, open `?idp=acme-okta` | Same as the row above — a password session never satisfies a company sign-in door |

**`prompt=login` is the assertion that matters.** Without it Keycloak honours its own
SSO cookie, never reaches the identity provider, and returns the session the app just
rejected — which looks like success while breaking FR-008. Read it off the authorize URL.

### 2.5 Mobile (research R5)

1. DevTools → Device toolbar → a phone preset, and confirm the UA matches
   `/Mobile|Android|iPhone|…/` and `screen.width < 1024`.
2. Reload `http://localhost:8080/?idp=acme-okta`.

**Expected**: the app still hard-navigates to the chats origin (door B is unsupported on
mobile), and the `redirect` query parameter on that URL carries the path **without**
`idp` — so no stale identifier can fire later.

### 2.6 Entry-door diagnostics (US5, SC-011)

With `SENTRY_DSN_ENDPOINT` set, trigger an accepted entry (§2.1) and a rejected one
(§2.2) and inspect the Sentry event tags.

**Expected**: `entry_door` is one of `default`, `direct_start`, or
`direct_start_rejected` — and **never** the identifier. No identity-provider secret and
no other customer's configuration appears in any recorded field.

---

## 3. Blocked-organization copy (US3)

### 3.1 Provider-agnostic message (FR-010, SC-005)

1. Sign in as a member of the blocked-organization fixture.
2. Open `/orgs` and hover the disabled organization's card.

**Expected**: the tooltip explains that the current session does not satisfy the
organization and that the person must sign in the way the organization requires. It
names **no** provider — no "Google", no "Microsoft", no "GitHub", no Okta.

Repeat with the language switcher in each of the four locales. Every one must be
present, translated, and provider-free (FR-014, US3 scenario 4).

### 3.2 No identifier on screen (FR-011, FR-012, SC-006)

Hover the Okta-enabled organization's card.

**Expected**: no identity-source identifier or display name appears in the tooltip.
Search the rendered DOM for the alias string — zero matches.

### 3.3 Unrecognized reason (FR-013)

Easiest as a unit test. To check in the browser, have the backend return
`access_disabled_reason: 'some_future_reason'`, or intercept the organization list
response in DevTools and edit the value.

**Expected**: the generic explanation renders. **Not** the raw reason code, **not** the
literal string `orgs.access_disabled_reason.some_future_reason`, **not** an empty
tooltip. The literal-key rendering is the bug shipping today, so seeing it means the
allowlist is not wired up.

---

## 4. Organization SSO settings (US4)

### 4.1 Unchanged for representable organizations (FR-018, SC-010)

1. Open the `['google']` fixture's settings → the security tab.

**Expected**: the form behaves exactly as it does today — switch, provider select,
domain input, and chips all editable; save enabled when dirty.

The stronger evidence is mechanical: `tests/unit/unit/components/common/RightBar/UpdateOrgSSO.spec.js`
passes **unmodified**. Needing to edit that file means FR-018 is at risk.

### 4.2 Read-only for unrepresentable organizations (FR-015, FR-016, SC-008)

1. Open the Okta-enabled fixture's settings → the security tab.

**Expected**

- The SSO section renders read-only: switch, provider select, domain input, and chips
  are all disabled.
- The `orgs.sso.managed_externally` notice explains the policy is managed by the
  platform team.
- The domain list is still visible — the administrator can see the policy but cannot
  change it.
- Changing 2FA and saving succeeds and does **not** send an SSO request. Confirm in
  Network: exactly one call to `.../2fa/`-style account endpoint, and **zero** calls to
  `PATCH /v1/organization/org/<uuid>/sso-settings/`.

### 4.3 No Okta configuration UI (FR-017, SC-009)

Search the settings surfaces for any control to create, edit, test, or attach an Okta
connection.

**Expected**: none exists anywhere in the app.

---

## 5. Locale parity check (SC-007)

```bash
npm run test -- localeParity
```

Asserts, across `en`, `pt_br`, `es`, and `ro`:

1. An identical **ordered** key sequence at every nesting level.
2. An identical placeholder-name set for every leaf key.

**Baseline before the change**: 1013 keys per file, zero key differences, zero
placeholder mismatches, zero ordered-sequence divergences.
**Expected after**: 1015 keys per file, all invariants holding.

**Deliberately not asserted**: repo-wide alphabetical ordering — 244 of 318 objects
violate it today, identically in all four files (research R7). Verify by eye instead
that the two new keys sit in their alphabetical position:
`orgs.access_disabled_reason.default` first in its object, and
`orgs.sso.managed_externally` between `lockout_error` and `provider_label`.

To confirm the check actually bites, temporarily append a key to `es.json` only and
re-run — it must fail.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `?idp=…` is ignored entirely | The identifier failed validation (rejected values are indistinguishable from an absent one — FR-003), or the route does not require auth so the guard never starts login |
| Redirects in a loop on a door B address | `redirectUri` still carries `idp`. The library defaults to `location.href`, so the explicit `redirectUri` is mandatory (research R4) |
| Door B always redirects even when already signed in through that source | The `identity_provider` protocol mapper is missing — prerequisite 2. Expected pre-mapper |
| Company sign-in never appears; the shared login renders instead | The alias is not configured on the realm. Keycloak ignores an unresolvable `kc_idp_hint` (research R1) |
| Mismatch redirect returns instantly without a credential prompt | `prompt: 'login'` is missing; Keycloak reused its SSO cookie (research R2) |
| `?idp=…` never reaches the guard on a phone preset | Expected — the mobile pre-redirect runs before `createApp` (research R5) |
| A tooltip shows `orgs.access_disabled_reason.<something>` | The known-reason allowlist is not wired up; this is the FR-013 defect |
| Coverage dropped on a touched file | SC-012. Add tests before pushing |
