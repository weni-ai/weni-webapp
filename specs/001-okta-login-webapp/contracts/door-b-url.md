# Contract: Door B direct-start URL

**Feature**: `001-okta-login-webapp` | **Consumers**: customer IT administrators publishing a login address; customer-hosted door C controls | **Producer of the behavior**: `src/router.js` navigation guard

This is the only externally addressable surface this delivery adds. Once a customer
bookmarks or publishes an address in this shape, the parameter name and accepted form
are effectively public API — changing either breaks published links. Treat it with the
same care as a federated contract.

---

## 1. Address shape

```
https://<app-origin>/<any-existing-path>?idp=<identifier>
```

- **Reserved parameter name**: `idp`
- **No new route.** The parameter is read on the app's existing entry addresses
  (FR-001). `https://dash.weni.ai/?idp=acme-okta` works because `/` redirects to `orgs`,
  which requires authentication and therefore reaches the guard.
- Other query parameters and the fragment are preserved and pass through untouched.
- The parameter is read on every navigation the guard evaluates, not only the first.

**Name collision check**: the query parameters in use across the app are `plan`,
`cursor`, `next`, `redirect`, `tab`, and `utm_*`. OAuth response parameters arrive in
the fragment, because `kc.responseMode` defaults to `'fragment'`. `idp` collides with
none of them.

---

## 2. Accepted form

```
/^[a-z0-9][a-z0-9-]{1,62}$/
```

| Rule | Value |
|---|---|
| Character set | Lowercase ASCII letters, digits, hyphen |
| First character | Letter or digit (not a hyphen) |
| Length | 2–63 characters inclusive |
| Case | Lowercase only — uppercase is **rejected**, not folded |
| Normalization | **None.** No trimming, no case folding, no unescaping |
| Multiplicity | Exactly one occurrence. A repeated parameter is rejected |

The set admits nothing that can express a URL, an additional parameter, a fragment, a
path segment, percent-encoding, or whitespace: no `:` `/` `?` `&` `=` `#` `%` `.` `_`,
no whitespace, no uppercase.

**Validation is syntactic only.** The app holds no list of configured customers, makes
no pre-authentication request, and cannot distinguish "well-formed and configured" from
"well-formed and unknown" (FR-003, FR-009).

**Never repair, always reject.** Trimming or lowercasing would convert a hostile input
into an accepted one.

---

## 3. Behavior

### 3.1 Accepted identifier

| Session state | Session identity source | Behavior |
|---|---|---|
| Signed out or expired | — | `login({ idpHint, redirectUri })` |
| Live | Claim equals the identifier | Reuse. Strip the parameter in-app via `next()` |
| Live | Claim present, differs | `login({ idpHint, prompt: 'login', redirectUri })` |
| Live | Claim absent / empty / non-string | Treat as mismatch: `login({ idpHint, prompt: 'login', redirectUri })` |

- Exactly one top-level navigation leaves the app. No route component resolves first —
  no organization picker, no account chooser, no provider list, no flash of the shared
  login (FR-002, SC-001).
- `prompt: 'login'` on the mismatch branch is **mandatory**. Without it Keycloak
  honours its own SSO cookie, never reaches the identity provider, and returns the
  session the app just rejected (FR-008, SC-013).
- An expired session is a signed-out session and MUST NOT cause the requested source
  to be skipped.

### 3.2 Rejected identifier

Identical to no parameter at all: the default login path, with no `idpHint`.

- No app-owned message names a customer, an organization, or an identity source.
- No message confirms whether the identifier exists or belongs to another customer.
- Feedback, if any, is the login theme's existing generic sign-in failure — which this
  app does not own (FR-003, FR-005).

### 3.3 Well-formed but unconfigured identifier

Handled **upstream**. Keycloak treats `kc_idp_hint` as advisory: an alias matching no
configured identity provider is ignored and the realm's normal browser login renders
(R1). The app has no branch for this and cannot detect it, so it structurally cannot
emit copy about it.

### 3.4 Feature flag

Door B is gated on the GrowthBook flag `enterprise-okta-direct-start`, read in the
guard from the module-level singleton in `src/utils/growthbook.js`. When the flag is off
**or GrowthBook has not initialized**, the parameter is ignored entirely and the address
behaves as door A — fail closed (R10).

---

## 4. Redirect target invariants

**The identifier influences exactly one value: `idpHint`.** Nothing else (FR-004).

| Invariant | Guarantee |
|---|---|
| Destination | Only the platform identity service already configured in `src/services/Keycloak.js`. The identifier never contributes to an origin, host, path, or scheme |
| `redirectUri` | Computed from `window.location` with `idp` deleted. Never derived from any input parameter |
| Other parameters | The identifier cannot add, remove, or override any other redirect parameter |
| Encoding | `keycloak-js` applies `encodeURIComponent` to `idpHint`, so a value cannot break out of its own parameter. A defence in depth, **not** a substitute for validation |
| Federated / iframe remotes | The parameter is stripped in the guard before any `next()` resolves, so it never reaches `useFederatedModule`, `useChatsFederatedModule`, or `ExternalSystem.vue` query forwarding |

**Two strip points, both required** (FR-007, SC-003):

| Branch | Mechanism |
|---|---|
| Leaving for the identity service | Explicit `redirectUri` = current address minus `idp` |
| Reusing an existing session | `next({ ...to, query: <idp removed> })` |

The explicit `redirectUri` is not optional. `keycloak-js`'s default adapter falls back
to `location.href`, which on a door B address includes the parameter — the return leg
would land back on it and redirect again. **This is the loop SC-003 forbids.**

**Return destination**: the app's normal post-login destination, or a destination the
address already carried and the app already supports. No new destination mechanism.

**Mobile**: `src/main.js` hard-navigates to chats before `createApp` on small touch
devices, so the guard never runs and door B is unsupported there. The parameter is
deleted from the `redirect` value handed to chats, so it cannot reappear later and fire
a stale redirect (R5).

---

## 5. Worked examples

Assume app origin `https://dash.weni.ai` and a configured alias `acme-okta`.

### 5.1 Accepted

| # | Address | Outcome |
|---|---|---|
| A1 | `https://dash.weni.ai/?idp=acme-okta` | `login({ idpHint: 'acme-okta', redirectUri: 'https://dash.weni.ai/' })` |
| A2 | `https://dash.weni.ai/orgs?idp=a1` | Accepted at minimum length; `redirectUri: 'https://dash.weni.ai/orgs'` |
| A3 | `https://dash.weni.ai/orgs?idp=acme-okta&utm_source=email` | Accepted; `redirectUri: 'https://dash.weni.ai/orgs?utm_source=email'` — `utm_source` preserved |
| A4 | `https://dash.weni.ai/?idp=acme-okta` with a live session whose claim is `acme-okta` | **No redirect.** `next()` to `/` with `idp` removed |
| A5 | `https://dash.weni.ai/?idp=acme-okta` with a live session whose claim is `other-okta` | `login({ idpHint: 'acme-okta', prompt: 'login', redirectUri: 'https://dash.weni.ai/' })` |
| A6 | `https://dash.weni.ai/?idp=acme-okta` with a live session and no claim | Same as A5 — undeterminable is a mismatch |

### 5.2 Rejected — hostile and malformed

Every row: identifier discarded, `login()` called with **no** `idpHint`, no app-owned
copy. Covers SC-002's required ≥ 12 documented inputs.

| # | `?idp=` value | Decoded value | Class |
|---|---|---|---|
| R1 | *(parameter absent)* | — | missing |
| R2 | `` | `''` | empty |
| R3 | `a` | `a` | under minimum length |
| R4 | `aaaa…` (64 chars) | 64 chars | over-long |
| R5 | `Acme-Okta` | `Acme-Okta` | mis-cased |
| R6 | `ACME-OKTA` | `ACME-OKTA` | mis-cased |
| R7 | `%20acme-okta%20` | ` acme-okta ` | whitespace-padded |
| R8 | `acme%20okta` | `acme okta` | embedded whitespace |
| R9 | `acme%2Fokta` | `acme/okta` | encoded path separator |
| R10 | `acme%23okta` | `acme#okta` | encoded fragment marker |
| R11 | `acme%26kc_idp_hint%3Dother` | `acme&kc_idp_hint=other` | encoded parameter injection |
| R12 | `%00acme` | `\0acme` | null byte |
| R13 | `..%2F..%2Fadmin` | `../../admin` | path traversal |
| R14 | `https%3A%2F%2Fevil.example.com` | `https://evil.example.com` | absolute URL |
| R15 | `%2F%2Fevil.example.com` | `//evil.example.com` | scheme-relative URL |
| R16 | `javascript%3Aalert(1)` | `javascript:alert(1)` | dangerous scheme |
| R17 | `%3Cscript%3Ealert(1)%3C%2Fscript%3E` | `<script>alert(1)</script>` | script-bearing |
| R18 | `acme.okta` | `acme.okta` | hostname-shaped |
| R19 | `acme_okta` | `acme_okta` | disallowed separator |
| R20 | `-acme` | `-acme` | leading hyphen |
| R21 | `acme-okta&idp=other` (repeated parameter) | `['acme-okta','other']` | non-string / array |

### 5.3 Accepted identifier alongside a hostile sibling parameter

| # | Address | Assertion |
|---|---|---|
| S1 | `https://dash.weni.ai/?idp=acme-okta&redirect_uri=https://evil.example.com` | `idp` is accepted. `redirectUri` is `https://dash.weni.ai/?redirect_uri=https%3A%2F%2Fevil.example.com` — computed from the app's own location, so `redirect_uri` is inert passenger data and never reaches the Keycloak redirect. The destination is the configured identity service only |

S1 is an FR-004 invariant test, not a validation test: it asserts that an unrelated
parameter cannot influence the redirect even when the identifier is valid.

---

## 6. Requirements covered

FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009;
SC-001, SC-002, SC-003, SC-004, SC-013.
