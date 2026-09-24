# Contract: Organization access read model

**Feature**: `001-okta-login-webapp` | **Direction**: read-only, backend → app | **Producer**: Connect backend | **Consumers**: `src/utils/orgAccess.js`, `src/components/orgs/OrgCard.vue`, `src/components/orgs/orgList.vue`, `src/components/common/RightBar/updateOrg.vue`

The fields this app reads from the organization list to render access state and SSO
settings.

**The load-bearing assertion of this contract is that it does not change.** Clarification
Q3 and FR-011 forbid adding a field, and FR-018 / SC-010 require organizations without
customer-Okta enablement to render byte-for-byte as they do today. This document exists
so a reviewer can verify that by comparing it against the diff, and so a later change
that quietly adds a field is visibly a contract change.

---

## 1. Fields consumed

From each element of `GET /v2/organizations/` (`orgs.list` in `src/api/orgs.js`):

| Field | Type | Consumed by | Changed by this delivery |
|---|---|---|---|
| `uuid` | `string` | org store, all surfaces | No |
| `name` | `string` | `OrgCard.vue` | No |
| `description` | `string` | `OrgCard.vue`, `updateOrg.vue` | No |
| `enforce_2fa` | `boolean` | `updateOrg.vue` | No |
| `access_status` | `'active' \| 'disabled'` | `isOrgAccessDisabled`, `OrgCard.vue`, `orgList.vue` | No |
| `access_disabled_reason` | `string \| null` | `getOrgAccessDisabledMessage` | No — **read differently** (§3) |
| `sso_config` | object (§2) | `updateOrg.vue` | No — **consumer set narrowed** (§4) |

**Fields added by this delivery: none.**
**Fields removed: none.**
**Field types or meanings changed: none.**

From `PATCH /v1/organization/org/<uuid>/sso-settings/` (`orgs.updateSSOConfig`): request
and response shapes are unchanged. The delivery changes *when* this endpoint is called,
never its payload (§4).

---

## 2. `sso_config` shape

| Field | Type | Meaning |
|---|---|---|
| `is_enabled` | `boolean` | SSO is required for this organization |
| `allowed_sso_providers` | `string[]` | Identity sources that satisfy the organization's policy |
| `allowed_email_domains` | `string[]` | Email domains permitted in the organization |

`allowed_sso_providers` MAY contain values the app does not recognize, and MAY contain
more than one entry. Both are the cases FR-015 exists for. The app MUST NOT assume the
set is a subset of `['google', 'microsoft']`, and MUST NOT echo an unrecognized entry to
the screen (NFR-003, FR-012).

---

## 3. `access_disabled_reason` — resolution rules

The app maps the reason to a message through an **explicit allowlist**. The value itself
never reaches the screen.

| Reason | Message key |
|---|---|
| `sso_credential_unavailable` | `orgs.access_disabled_reason.sso_credential_unavailable` |
| `sso_email_domain_not_allowed` | `orgs.access_disabled_reason.sso_email_domain_not_allowed` |
| `sso_password_configured` | `orgs.access_disabled_reason.sso_password_configured` |
| `sso_provider_not_allowed` | `orgs.access_disabled_reason.sso_provider_not_allowed` |
| `sso_session_required` | `orgs.access_disabled_reason.sso_session_required` |
| *anything else* | `orgs.access_disabled_reason.default` |
| `null` / `undefined` / `''` | `''` (no message) |

**Rules**:

1. No interpolation parameters are passed for any reason. Every message in this
   namespace is placeholder-free after this delivery (FR-010, FR-011, FR-012).
2. An unrecognized reason resolves to `default` — never the raw reason code, never the
   interpolated key string, never an empty tooltip, never a missing-translation
   artifact (FR-013).
3. `sso_config` is **not** an input to message resolution (§4).

**This is a behavior change and a bug fix.** Today the helper interpolates any reason
into a key and calls `t`, so an unrecognized reason renders the literal string
`orgs.access_disabled_reason.<reason>` in a tooltip — vue-i18n returns the key when no
message exists. The backend adding a reason is enough to trigger it. The allowlist plus
`default` closes it.

**The backend may add reasons freely.** A new reason renders the generic explanation
until the app maps it, which is a safe default rather than a broken screen. No
coordination is required for the backend to ship a new reason.

---

## 4. Consumer narrowing — `sso_config`

Before this delivery, `sso_config` reached two consumers:

1. `getOrgAccessDisabledMessage`, to interpolate `{providers}` into
   `sso_provider_not_allowed`
2. `updateOrg.vue`, to hydrate the SSO form

After this delivery, **only `updateOrg.vue`**. The message path no longer receives
`sso_config` at all:

| Removed | Location |
|---|---|
| `SSO_PROVIDER_LABELS` | `src/utils/orgAccess.js` |
| `formatAllowedProviders` | `src/utils/orgAccess.js` |
| The `sso_config` parameter of `getOrgAccessDisabledMessage` | `src/utils/orgAccess.js` |
| The `ssoConfig` prop of `OrgCard.vue` | `src/components/orgs/OrgCard.vue` |
| The `ssoConfig` binding to `OrgCard` | `src/components/orgs/orgList.vue` |

**Why remove the parameter and prop rather than just stop using them**: FR-012 requires
that no identity-source identifier reach the interface *by any path*. Removing the
plumbing makes that a property of the code — the message path has no access to the data
— rather than a rule a future edit must remember. Verified not to be a runtime contract:
neither removed name appears in `rspack.config.js`'s `exposes` (only `./sharedStore`),
in any `postMessage` payload, or outside `src/utils/orgAccess.js`.

**`updateOrg.vue`'s read is unchanged**, with one addition: the `isSsoReadOnly` computed
derives representability from `allowed_sso_providers` (see
[`data-model.md`](../data-model.md) §5). It reads the same field it reads today and adds
no field to the request or response.

---

## 5. Write-path invariants

| Invariant | Requirement |
|---|---|
| `updateSSOConfig` is never called when `isSsoReadOnly` is `true` | FR-015, FR-016, SC-008 |
| No sequence of interactions can submit a replacement or empty `allowed_sso_providers` for an unrepresentable organization | SC-008 |
| Saving 2FA never writes `sso_config` | FR-016 |
| No request is added that creates, edits, tests, or attaches an Okta connection | FR-017, SC-009 |

The 2FA invariant is structural, not defensive: 2FA saves go through
`account.updateAccount2FAStatus`, a different endpoint that has no `sso_config` field.
The SSO write path is closed by four independent guards (research R9), of which the
`saveChanges` skip is the one that survives a future refactor combining the two saves.

---

## 6. Unchanged-rendering guarantee

For an organization whose `allowed_sso_providers` is empty, absent, or a single
`google` / `microsoft` value:

- `isSsoReadOnly` is `false`
- Every code path is the one running today
- Organization rendering, access evaluation, and SSO settings behavior are unchanged
  (FR-018, SC-010)

The evidence is the existing `tests/unit/unit/components/common/RightBar/UpdateOrgSSO.spec.js`
suite continuing to pass **unmodified**. If a change to this delivery requires editing
that file, FR-018 is at risk and the change needs re-examination.

---

## 7. Requirements covered

FR-010, FR-011, FR-012, FR-013, FR-015, FR-016, FR-017, FR-018, FR-021;
SC-005, SC-006, SC-008, SC-009, SC-010.
