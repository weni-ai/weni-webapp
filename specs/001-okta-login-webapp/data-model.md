# Phase 1 Data Model: Enterprise Okta login — web app slice

**Feature**: `001-okta-login-webapp` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

The spec's Key Entities expressed as front-end shapes. Nothing here is persisted by
this repository: every entity is either derived from the URL for the lifetime of one
navigation, read from a token, read from an API response the app already consumes, or a
compile-time constant. **No new store, no new field on any API contract, no new
`localStorage` key.**

Why that matters: FR-006 requires a door B session to be identical in kind to a door A
session, and forbids door-specific session state. A new store or persisted key would be
door-specific session state. The absence of persistence in this model is a requirement,
not an omission.

---

## 1. Direct-start identifier

The opaque token naming one customer identity source, carried in the door B address.

| Property | Value |
|---|---|
| Source | `to.query.idp` in `router.beforeEach` |
| Runtime type | `string` after validation; `null` when absent or rejected |
| Lifetime | One `router.beforeEach` invocation. Never stored, never persisted |
| Owner | The URL. The app holds no copy |
| Rendered | Never (FR-005, FR-011, FR-012) |
| Logged | Never (NFR-003, SC-011) |

**Accepted form** (R6): `/^[a-z0-9][a-z0-9-]{1,62}$/` — lowercase ASCII alphanumerics
and hyphen, first character alphanumeric, length 2–63.

**Validation rules**, in order:

1. The raw value MUST be a primitive `string`. A repeated query parameter yields an
   array from `vue-router` and is rejected without further inspection.
2. The string MUST match the accepted form exactly.
3. No normalization of any kind — no trimming, no case folding, no unescaping. A value
   that needs repair is rejected (R6).
4. A rejected value is indistinguishable from an absent one on every subsequent code
   path: same branch, same redirect, same absence of copy (FR-003, FR-005).

**States**:

```
absent ──────────────────────────────► null  ── default login path
present, non-string (repeated) ──────► null  ── default login path
present, fails accepted form ────────► null  ── default login path
present, matches accepted form ──────► string ── login with idpHint
```

There is no `invalid` state distinct from `null`. Collapsing rejection into absence is
what makes FR-003's silent degradation structural rather than conventional — no branch
exists that could grow an error message later.

**Forbidden derivations** (FR-004): the identifier MUST NOT contribute to any value
other than `login()`'s `idpHint`. In particular it MUST NOT appear in `redirectUri`,
which is computed from `window.location` with the parameter deleted, and MUST NOT be
forwarded into federated or iframe module routes — guaranteed by stripping it in the
guard before any `next()` resolves (R4).

---

## 2. Entry door

How the person arrived. Derived, not stored.

| Value | Meaning |
|---|---|
| `default` | No `idp` parameter present — the ordinary login path (door A) |
| `direct_start` | A well-formed `idp` parameter was accepted and forwarded as `idpHint` |
| `direct_start_rejected` | An `idp` parameter was present and rejected |

| Property | Value |
|---|---|
| Source | Derived from entity 1 within the same guard invocation |
| Runtime type | One of the three string literals above — a closed enum |
| Lifetime | Computed per navigation; emitted once as a Sentry tag |
| Consumers | `Sentry.setTag('entry_door', …)` only |
| Effect on session | **None** (FR-006, SC-004) |

The enum is closed and carries no customer-derived data, so SC-011's "zero
identity-provider secrets and zero other-customer configuration recorded" holds by
construction: there is no field in this entity that could hold an identifier.

`direct_start` records that a well-formed identifier was *forwarded*, not that it
*resolved*. The app cannot know whether it resolved — Keycloak decides that server-side
and never reports back (R1) — and inventing a fourth value would require the
pre-authentication lookup FR-003 forbids.

---

## 3. Organization access outcome

The per-organization decision the app renders. Produced upstream; **never computed
here** (FR-021, BD-004).

Read from each element of the organization list response, unchanged by this delivery:

| Field | Type | Read by |
|---|---|---|
| `access_status` | `'active' \| 'disabled'` | `isOrgAccessDisabled`, `OrgCard.vue`, `orgList.vue` |
| `access_disabled_reason` | `string \| null` | `getOrgAccessDisabledMessage` |
| `sso_config` | object | `updateOrg.vue` only — **no longer** `getOrgAccessDisabledMessage` (R8) |

**Known reasons** — the allowlist replacing today's unchecked key interpolation (R8,
FR-013):

| Reason | Message key |
|---|---|
| `sso_credential_unavailable` | `orgs.access_disabled_reason.sso_credential_unavailable` |
| `sso_email_domain_not_allowed` | `orgs.access_disabled_reason.sso_email_domain_not_allowed` |
| `sso_password_configured` | `orgs.access_disabled_reason.sso_password_configured` |
| `sso_provider_not_allowed` | `orgs.access_disabled_reason.sso_provider_not_allowed` |
| `sso_session_required` | `orgs.access_disabled_reason.sso_session_required` |
| *anything else, including future backend reasons* | `orgs.access_disabled_reason.default` |

**Message resolution rules**:

1. No reason (`null`, `undefined`, `''`) → `''`. Unchanged from today.
2. A reason in the allowlist → its mapped key.
3. Any other reason → the `default` key. Never the raw reason, never the interpolated
   key string, never a missing-translation artifact (FR-013).
4. No interpolation parameters are passed. Every message in this namespace is
   placeholder-free after this delivery (FR-010, FR-011, FR-012).

Rule 3 is a behavior change: today an unrecognized reason renders the literal string
`orgs.access_disabled_reason.<reason>` in a tooltip, because vue-i18n returns the key
when no message exists.

**`sso_config` shape** — read by `updateOrg.vue` only, and only for entity 5's
read-only decision:

| Field | Type |
|---|---|
| `is_enabled` | `boolean` |
| `allowed_sso_providers` | `string[]` |
| `allowed_email_domains` | `string[]` |

**Invariant**: this delivery adds no field to any of the above and changes no field's
meaning (FR-011, Clarification Q3). Asserted in
[`contracts/organization-access-read-model.md`](./contracts/organization-access-read-model.md).

---

## 4. Session identity source

Which identity source established the current session. Read to decide FR-008 reuse
versus re-authenticate. **Never rendered.**

| Property | Value |
|---|---|
| Source | `Keycloak.keycloak.tokenParsed?.identity_provider` |
| Runtime type | `string` when the claim is present and non-empty; `null` otherwise |
| Availability | **Requires a Keycloak User Session Note protocol mapper** (R2) |
| Lifetime | Read from the live token per guard invocation. Never copied into a store |
| Rendered | Never (FR-011, FR-012) |
| Logged | Never (NFR-003) |

**States and the decision they drive**, given a well-formed requested identifier:

| Session | `identity_provider` claim | Decision |
|---|---|---|
| None / expired | — | `login({ idpHint, redirectUri })` |
| Live | Equals the requested identifier | **Reuse.** Strip the parameter via `next()` |
| Live | Present, differs from the requested identifier | `login({ idpHint, prompt: 'login', redirectUri })` |
| Live | Absent, empty, or not a string | **Treat as mismatch.** `login({ idpHint, prompt: 'login', redirectUri })` |

Comparison is exact string equality on the validated identifier. No case folding, no
normalization, no prefix matching — the identifier was already rejected if it needed
repair (entity 1), and a loose comparison here is how one customer's source could come
to satisfy another's door.

**Two load-bearing rules**:

- **Undeterminable is a mismatch, never reuse** (FR-008, SC-013). An expired session is
  a signed-out session and MUST NOT cause the requested source to be skipped.
- **`prompt: 'login'` is mandatory on the mismatch branch** (R2). Without it, Keycloak
  honours its own SSO cookie, skips the identity provider entirely, and returns the
  same session the app just rejected — silently satisfying an Okta door with a platform
  password session and breaking FR-008 and SC-013 while appearing to work.

**Pre-mapper behavior**: until the protocol mapper lands, the claim is absent on every
session, so every live-session door B entry takes the mismatch branch and forces a
re-authentication. This is correct per FR-008. Research R10 originally gated door B
behind a flag for this reason; the 2026-09-02 reversal accepts the cost as live.

---

## 5. SSO settings representability

Not a spec entity, but the derived value FR-015 and FR-016 turn on. Local to
`updateOrg.vue`.

| Property | Value |
|---|---|
| Source | `org.sso_config.allowed_sso_providers` |
| Runtime type | `boolean` — the `isSsoReadOnly` computed |
| Constant | `SSO_PROVIDERS = ['google', 'microsoft']`, already in the file |

**Read-only when either condition holds**:

1. `allowed_sso_providers.length > 1` — the single-select cannot hold more than one.
2. Any entry is not in `SSO_PROVIDERS` — the select has no option for it.

Both conditions describe the *form's* capability, not knowledge of Okta. That is what
keeps the surface from becoming an Okta configuration UI (BD-005, FR-017).

**States**:

| `allowed_sso_providers` | `isSsoReadOnly` | Behavior |
|---|---|---|
| `[]` | `false` | Exactly as today (FR-018, SC-010) |
| `['google']` / `['microsoft']` | `false` | Exactly as today |
| `['okta-acme']` | `true` | Read-only |
| `['google', 'microsoft']` | `true` | Read-only |
| `['google', 'okta-acme']` | `true` | Read-only |
| `undefined` / missing | `false` | Exactly as today |

**Consequences when `isSsoReadOnly` is `true`**:

- Every SSO input is `:disabled` — switch, provider select, domain input, chips (R9).
- `ssoDirty` is forced `false`.
- `saveChanges` skips `updateSSOConfig` unconditionally.
- The `orgs.sso.managed_externally` notice renders.
- No control to create, edit, test, or attach an Okta connection exists (FR-017, SC-009).

The empty and single-known-provider rows are the FR-018 / SC-010 guarantee: for
organizations without customer-Okta enablement, `isSsoReadOnly` is `false` and every
path is the one running today. The existing `UpdateOrgSSO.spec.js` suite passing
unmodified is the evidence.

---

## 6. Supported locale set

| Property | Value |
|---|---|
| Members | `en`, `pt_br`, `es`, `ro` |
| Source of truth | `src/locales/*.json`, loaded in `src/utils/plugins/i18n.js` |
| Runtime type | Compile-time constant — four static JSON imports |

`src/utils/plugins/i18n.js` maps `pt-br` and `pt-BR` to the same `pt_br` messages;
that aliasing is untouched.

**Ship-gate invariants**, enforced mechanically by
`src/locales/__tests__/localeParity.spec.js` (R7):

1. **Identical ordered key sequence** at every nesting level across all four files.
2. **Identical placeholder-name set** for every leaf key, tolerating ICU
   `plural` / `selectordinal` / `select` blocks and excluding vue-i18n's literal escape
   `{'@'}`.

Measured baseline: 1013 keys per file, zero key differences, zero placeholder
mismatches, zero ordered-sequence divergences. Both invariants hold today, so the test
passes on landing and fails only on drift this delivery or a later one introduces.

**Explicitly not enforced**: repo-wide alphabetical ordering. 244 of 318 objects
violate it today, identically in all four files. Keys added by this delivery are
inserted in alphabetical position within their own object — both objects touched
(`orgs.access_disabled_reason`, `orgs.sso`) are already internally sorted. See R7 for
the full justification.
