# Phase 0 Research: Enterprise Okta login — web app slice

**Feature**: `001-okta-login-webapp` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

All ten unknowns raised for the plan phase are resolved below. Findings are
grounded in the code and the pinned dependency versions in this repository, not
in general Keycloak documentation.

Evidence base:

- `keycloak-js@25.0.6` (`package-lock.json`, `node_modules/keycloak-js/dist/keycloak.mjs`)
- `src/services/Keycloak.js`, `src/router.js`, `src/main.js`
- `src/utils/orgAccess.js`, `src/components/orgs/OrgCard.vue`, `src/components/orgs/orgList.vue`
- `src/components/common/RightBar/updateOrg.vue`, `src/api/orgs.js`
- `src/locales/{en,pt_br,es,ro}.json`, `src/utils/plugins/i18n.js`, `src/utils/plugins/icuMessageCompiler.js`
- `src/utils/growthbook.js`, `src/store/featureFlags/index.js`
- `rspack.config.js`, `vite.config.js`, `vitest.config.js`

---

## R1 — Identity-source hint on login

**Question**: `src/router.js` calls `Keycloak.keycloak.login()` with no arguments and
nothing in the repo passes `idpHint` / `kc_idp_hint`. How is the hint passed in the
pinned `keycloak-js`, does it survive the PKCE S256 redirect, and what does Keycloak
do with an alias that resolves to nothing?

**Decision**: Pass `idpHint` in the options object of the existing
`Keycloak.keycloak.login()` call. No new authentication mechanism, no manual URL
construction, no second Keycloak client.

**Rationale**:

`keycloak-js@25.0.6` supports `idpHint` as a first-class login option. In
`node_modules/keycloak-js/dist/keycloak.mjs`, `createLoginUrl(options)` appends it
verbatim as the standard Keycloak brokering parameter:

```js
if (options && options.idpHint) {
    url += '&kc_idp_hint=' + encodeURIComponent(options.idpHint);
}
```

The library encodes the value with `encodeURIComponent`, so a value containing `&`,
`?`, `#`, or `/` cannot break out of its own parameter and inject another. That is a
useful second line of defence, but it is **not** sufficient on its own and does not
replace FR-003 validation: an alias that is percent-encoded into one parameter is
still an attacker-chosen alias, and `encodeURIComponent` does nothing about length,
case, or an alias that resolves to a different tenant's identity source. Validation
stays mandatory (see R6).

`login(options)` delegates to `adapter.login(options)`, which for the default
`type: 'default'` adapter performs `window.location.assign(kc.createLoginUrl(options))`
— a single top-level navigation. That satisfies SC-001's "first navigation, no app
view rendered in between", because the router guard never calls `next()` on this
branch and therefore never resolves a route component.

**PKCE survival**: `kc_idp_hint` does not need to survive the return leg, so PKCE is
irrelevant to it. The two mechanisms are orthogonal and touch different halves of the
flow:

| Concern | Where it lives | Return leg |
|---|---|---|
| `kc_idp_hint` | Query parameter on the outbound authorize URL | Consumed server-side by Keycloak; never returned |
| PKCE `code_verifier` | `callbackStorage` (session storage), written by `createLoginUrl` | Read on return to exchange the code |

`createLoginUrl` builds `callbackState` (state, nonce, `redirectUri`, `loginOptions`,
`pkceCodeVerifier`) and calls `callbackStorage.add(callbackState)` *after* appending
every URL parameter including the hint. `pkceMethod: 'S256'` is already set in
`src/services/Keycloak.js`, and `options.idpHint` is carried inside
`callbackState.loginOptions` incidentally. Adding `idpHint` therefore changes nothing
about the PKCE exchange, which is unconditional on `kc.pkceMethod` being set.

**Unresolvable alias**: Keycloak treats `kc_idp_hint` as advisory. When the value
names no identity provider alias configured on the realm, the authorization endpoint
ignores it and renders the realm's normal browser login flow — it does not return an
error page and does not fail the request. This is precisely the degradation FR-003
and User Story 2 acceptance scenario 2 require ("they arrive at the shared login
first step and the app adds no new copy about the identifier"), and it means a
well-formed-but-unknown identifier is handled upstream with no app-side branch.

**Consequence for FR-005**: because the fallback is server-side, the app never learns
that an identifier was unknown, so it structurally cannot emit copy that confirms
whether an identifier exists. FR-005 is satisfied by construction rather than by
discipline.

**Alternatives considered**:

- *Build the authorize URL by hand and `window.location.assign` it* — rejected. It
  duplicates `createLoginUrl`, and because `callbackStorage.add(callbackState)` would
  never run, the PKCE verifier, `state`, and `nonce` would be absent and the return
  leg would fail. It also bypasses the singleton in `src/services/Keycloak.js`.
- *`createLoginUrl({ idpHint })` then assign manually* — rejected. Equivalent to
  `login()` but with an extra step and no benefit.
- *A second Keycloak client instance for door B* — rejected outright. Constitution
  principle II mandates exactly one client and one `init()`.

---

## R2 — Reading the session's identity source

**Question**: FR-008 reuses a session only when it came from the named source. Is that
readable from the token the realm issues today, or does it need a protocol mapper from
Engine/infra? If it is unavailable, does the spec's fallback (undeterminable =
re-authenticate) force a re-auth on every door B entry for an already-signed-in user?

**Decision**: Read the session's identity source from
`Keycloak.keycloak.tokenParsed?.identity_provider`, treat any absent, empty, or
non-string value as undeterminable, and record a **hard cross-squad dependency** on
Engine/infra to add a Keycloak *User Session Note* protocol mapper projecting the
`identity_provider` session note into the token for the app's client. Until that
mapper exists, FR-008 is correct but degrades to "always re-authenticate on door B
with a live session".

**Rationale**:

Keycloak's brokering flow stores the originating provider alias as a **user session
note** named `identity_provider` (alongside `identity_provider_identity`) when a
session is established through an identity provider. Session notes are server-side
state; they are **not** included in the access token or ID token by default. The
supported way to surface one to a client is a *User Session Note* protocol mapper on
that client, mapping the note name `identity_provider` to a token claim.

The app cannot add that mapper. It is realm/client configuration owned by
Engine/infra. Nothing in this repository can substitute for it, and nothing in this
repository should try — inferring the source from the token's `iss`, `azp`, `amr`, or
email domain would be exactly the local policy inference FR-021 forbids.

`keycloak-js` exposes whatever claims the realm does issue as `keycloak.tokenParsed`
and `keycloak.idTokenParsed`, so once the mapper lands, no app change is required
beyond reading the claim — which is why the claim read should ship now, unflagged, and
not be deferred.

**The re-authentication consequence, stated plainly**: the spec's assumption block
asked whether the undeterminable fallback forces a re-auth on every door B entry for
an already-signed-in person. **It does.** Absent the mapper, `identity_provider` is
`undefined` for every session, every door B entry with a live session is a mismatch,
and every one of them re-authenticates. This is a real user-visible cost, not a
theoretical one. It was the original argument for the flag in R10; the 2026-09-02
reversal accepts that cost rather than gating door B.

**A second, less obvious finding — a bare re-auth is not enough**: re-authenticating
by calling `login({ idpHint })` against a realm where the person already holds a
Keycloak SSO cookie does **not** reach the identity provider. Keycloak sees a valid
SSO session, skips the browser flow entirely, and returns the *existing* session — the
very session FR-008 just rejected. That would silently satisfy an Okta door with a
platform-password session and violate FR-008 and SC-013 while appearing to work.

The mismatch branch must therefore force a fresh authentication. `keycloak-js@25.0.6`
supports this: `createLoginUrl` appends `&prompt=` from `options.prompt`, so the
mismatch branch calls `login({ idpHint, prompt: 'login', redirectUri })`. The
signed-out branch uses `login({ idpHint, redirectUri })` with no `prompt` — there is
no session to distrust, and forcing `prompt=login` there would be a gratuitous extra
credential prompt.

This distinction is the load-bearing detail of FR-008. A test asserting only that
`login` was called with `idpHint` would pass while the requirement is broken, so the
mismatch test MUST assert `prompt: 'login'` explicitly.

**Alternatives considered**:

- *Infer the source from the email domain or `iss`* — rejected. FR-021 forbids local
  policy inference, and `iss` is the platform issuer for every door (BD-001).
- *Ask the backend which source established the session* — rejected. FR-003 forbids a
  pre-authentication call, and it would add a field to a contract FR-011 says gains no
  field.
- *Skip the reuse check and always re-authenticate on door B* — rejected as a
  permanent design, though it is the accurate description of pre-mapper behavior. As a
  permanent choice it would make door B strictly worse than door A for signed-in
  users, with no requirement asking for it.
- *Defer the claim read until the mapper lands* — rejected. It would leave FR-008
  unimplemented, and the claim read is the cheap half.

**Dependency to register with Engine/infra** (blocking for door B enablement, not for
merge):

| | |
|---|---|
| What | Keycloak *User Session Note* protocol mapper on the app's client |
| Session note | `identity_provider` |
| Claim name | `identity_provider` |
| Token(s) | Access token (ID token optional) |
| Why | FR-008 / SC-013 reuse-versus-re-authenticate decision |
| Without it | Every door B entry with a live session forces a re-authentication |

---

## R3 — Bootstrap ordering

**Question**: `keycloak.init()` runs lazily inside `Keycloak.isAuthenticated()` from
`router.beforeEach`, and restores a prior session from `localStorage['keycloak:user']`
inside `init`. Where exactly must the door B parameter be read so the hint is decided
before that restore, without adding a second `init` (Constitution II)?

**Decision**: Read the parameter synchronously from `to.query` at the top of the
existing `router.beforeEach`, **before** the `await Keycloak.isAuthenticated()`. Keep
it in a local variable for the duration of that guard invocation. Compare it against
the session's identity source **after** the await. One `init`, one guard, no new
module-level or persisted state.

**Rationale**:

The ordering concern in the question is real but narrower than it appears. Two facts
resolve it:

1. **`init` cannot run before the guard.** `keycloak.init()` is called from exactly
   one place — inside `Keycloak.isAuthenticated()` — and that is called from exactly
   one place, `router.beforeEach`. Reading `to.query` before the `await` is therefore
   unconditionally before `init`, with no ordering hazard to defend against.

2. **`init` does not destroy the parameter.** Inside `init`, `processInit()` calls
   `parseCallback(window.location.href)` and only rewrites the address when a callback
   is present:

   ```js
   var callback = parseCallback(window.location.href);
   if (callback) {
       window.history.replaceState(window.history.state, null, callback.newUrl);
   }
   ```

   On a door B entry there is no OAuth response in the address, `parseCallback`
   returns `null`, and `replaceState` never runs. Even on the return leg, `newUrl` is
   rebuilt as `url.substring(0, fragmentIndex)` plus any non-OAuth fragment
   parameters, which preserves the query string. The parameter is not at risk from
   `init` in either direction.

What genuinely must happen before the await is only the *capture*; the *comparison*
necessarily happens after, because the token that carries `identity_provider` does not
exist until `init` resolves. So the guard reads:

```
beforeEach(to, from, next):
  1. capture and validate the door B identifier from to.query   # synchronous, pre-init
  2. await Keycloak.isAuthenticated()                            # the single init
  3. branch on (identifier present?) x (authenticated?) x (source matches?)
```

**Placement**: the capture belongs inside `beforeEach`, not at module scope in
`router.js` and not in `main.js`. Module scope would read `location.search` once at
import time and then be wrong for every subsequent in-app navigation, and it would
survive across the callback as stale pending state — precisely the "pending
direct-start state that fires later" the spec's Edge Cases forbid. Because a guard
local lives and dies within one navigation, the "double entry" edge case (two tabs,
or a reload mid-redirect) needs no queue, no lock, and no de-duplication: each
navigation evaluates independently and at most one `login()` call can be reached per
invocation.

**Route requirement**: the identifier must be readable on a route that reaches the
guard's authenticated branch. `/` redirects to `orgs`, which has `requiresAuth: true`,
so `https://dash.weni.ai/?idp=<identifier>` enters the guard. FR-001 requires no new
route and none is added.

**Constitution II**: `hasInitialized` in `src/services/Keycloak.js` is untouched, the
`init` call site count stays at one, and the `setInterval` token-refresh cadence and
its `#intelligence` `postMessage` are untouched.

**Alternatives considered**:

- *Capture in `main.js` before `createApp`* — rejected. It creates cross-module
  pending state, is invisible to the guard's tests, and collides with the mobile
  pre-redirect (R5).
- *Module-level variable in `router.js`* — rejected. Stale after the first
  navigation; behaves as pending state across the callback.
- *A Pinia store for the pending identifier* — rejected. Principle III forbids
  duplicating state that already has an owner (the URL), and persistence is the
  defect, not the feature.
- *A second `init` with `onLoad: 'login-required'` and `idpHint`* — rejected. Direct
  violation of Constitution II.

---

## R4 — Redirect-loop avoidance

**Question**: `login()` defaults its `redirectUri` to the current URL, which for a
door B address would return the user to the parameter and start again. How is the
return destination set, and where is the parameter stripped (FR-007, SC-003)?

**Decision**: Always pass an explicit `redirectUri` on a door B `login()` call,
computed as the current address with the reserved parameter removed. Independently,
strip the parameter with a `next({ ...to, query: <without the parameter> })` redirect
on the branch where an existing session is reused. Two strip points, both required,
neither sufficient alone.

**Rationale**:

The loop is real and confirmed in the pinned library. The default adapter's
`redirectUri` resolution is:

```js
redirectUri: function(options, encodeHash) {
    if (options && options.redirectUri) {
        return options.redirectUri;
    } else if (kc.redirectUri) {
        return kc.redirectUri;
    } else {
        return location.href;
    }
}
```

`options.redirectUri` is unset (today's `login()` takes no arguments) and
`kc.redirectUri` is unset in `src/services/Keycloak.js`, so the current behavior is
`location.href` — which on a door B address includes the parameter. The return leg
would land back on the door B address, the guard would re-read the parameter, and with
`prompt: 'login'` on the mismatch branch it would redirect again. That is an infinite
loop, and it is the default outcome if `redirectUri` is left alone. **This is the
single highest-risk detail in the delivery.**

Two branches need two different strip mechanisms:

| Branch | Mechanism | Why |
|---|---|---|
| Redirecting to the identity service (signed out, or source mismatch) | `login({ idpHint, redirectUri: strippedHref })` | The person leaves the app; only the URL handed to Keycloak controls where they come back to |
| Reusing an existing session (source matches) | `next({ ...to, query: <parameter removed> })` | The person never leaves; the address must be cleaned in-app |

`strippedHref` is built from the current location by deleting the reserved parameter
and preserving everything else — origin, path, all other query parameters, and the
fragment — so the existing behavior in the spec's "Return destination" default holds:
a destination the app already supports today still works, and no new destination
mechanism is introduced.

Because `strippedHref` is derived from the app's own `window.location` and the
parameter is deleted rather than reused, FR-004 holds structurally: the identifier
influences exactly one thing (`idpHint`) and cannot add, remove, or override any other
redirect parameter. This is worth stating as an invariant in the contract, because it
is the property that makes hostile input (R6) non-exploitable even if validation were
somehow bypassed.

**A second reason the strip is mandatory** — beyond the loop: `to.query` is forwarded
wholesale into federated and iframe module routes. `src/composables/useFederatedModule.js`
passes `query: to.query || {}`, `useChatsFederatedModule.js` does the same, and
`src/components/ExternalSystem.vue` forwards `this.$route.query` into iframe
navigation. An unstripped identifier would leak into remotes and iframes, which is
both an FR-012 exposure and a Constitution I concern. Stripping in the guard means no
remote ever observes the parameter, so the federation and `postMessage` contracts are
untouched — additive at worst, unchanged in fact.

**Existing hash cleanup is unaffected**: the guard already handles the return leg's
fragment with `if (to.hash.startsWith('#state='))  next({ ...to, hash: '' })`. Because
`kc.responseMode` defaults to `'fragment'`, the OAuth response arrives in the hash and
this path continues to work. The new query-strip and the existing hash-strip operate
on different parts of the address and must not be merged into one branch; the door B
check is placed so it cannot short-circuit the `#state=` handling.

**SC-003 measurement**: one outbound `window.location.assign` and one return
navigation per door B entry. Testable by asserting the guard calls `login` exactly
once with a `redirectUri` that does not contain the parameter, and that a second guard
invocation on the stripped address calls `login` zero times.

**Alternatives considered**:

- *Set `kc.redirectUri` globally in `src/services/Keycloak.js`* — rejected. It changes
  door A's return destination for every route, a platform-wide regression far outside
  this slice.
- *Strip with `history.replaceState` in the guard* — rejected. It desynchronizes
  `vue-router`'s internal current-route from the address; `next({ ...to, query })` is
  the router-native mechanism.
- *Rely only on the in-app strip and let `redirectUri` default* — rejected. The
  default returns the person to the parameter before the guard can strip it, which is
  the loop.
- *Add the parameter to a denylist inside the federated-module query forwarding* —
  rejected. It treats a symptom in three places instead of the cause in one.

---

## R5 — Mobile pre-redirect

**Question**: `src/main.js` rebuilds a chats URL and hard-navigates before `createApp`
on a small touch device. Does a door B entry on mobile lose the parameter, and what
should happen?

**Decision**: Keep the mobile pre-redirect and keep door B unsupported on mobile, but
**strip the reserved parameter from the `redirect` value handed to chats**. Door B on
mobile degrades to the ordinary chats login path, and no pending identifier can fire
later.

**Rationale**:

The parameter is lost today, and worse than lost. The current code is:

```js
if ('ontouchstart' in window && screen.width < 1024 && isMobileUserAgent) {
  const Chats = new URL(getOriginFromURL(getEnv('MODULES_YAML').chats));
  Chats.searchParams.append(
    'redirect',
    window.location.href.replace(window.location.origin + '/', ''),
  );
  window.location = Chats.href;
}
```

This runs before `createApp`, so the router guard never executes and the hint is never
applied — door B silently behaves as door A on mobile. But the full path *and query*,
including the identifier, are packaged into `redirect=` and handed to a different
origin. If chats later returns the person to that stored path, the identifier
reappears in the shell's address with a live session already established. The guard
would then read it, find a mismatch (R2: undeterminable pre-mapper), and force a
re-authentication triggered by a parameter the person set minutes earlier on another
origin. That is exactly the "pending direct-start state that fires later" the spec's
Edge Cases forbid, and it is a latent loop.

Deleting the parameter from the `redirect` value closes that hole with a one-line,
mobile-only change. Door B on mobile then degrades to the ordinary login path, which
is the same posture FR-003 already mandates for a rejected identifier — consistent
rather than special-cased.

Two properties make this the cautious choice. It is the minimum viable change to
`main.js`, which the repository guidance flags as requiring mobile-UA regression
testing. And it removes behavior rather than adding it, so there is no new interaction
between the mobile bounce and the OAuth callback to reason about.

**Alternatives considered**:

- *Skip the mobile pre-redirect when the parameter is present, so the hint applies* —
  seriously considered and rejected. It appears to deliver door B on mobile, but the
  person completes sign-in and lands in the shell rather than in chats, silently
  changing the mobile destination. The return leg also arrives with a `#state=`
  fragment while `main.js` still runs before the router, so the bounce condition would
  need to understand OAuth callbacks too. Two behavior changes and a new ordering
  hazard, to serve a bookmarked-desktop-address scenario on a phone. Recorded as the
  natural follow-up if mobile door B is ever asked for.
- *Set `redirectUri` to the chats URL after a mobile door B login* — rejected. The
  spec's "Return destination" default explicitly introduces no new destination
  mechanism.
- *Leave `main.js` untouched* — rejected. It leaves the pending-state loop above.

**Test obligation**: a `main.js`-level test asserting that a door B address on a
simulated mobile UA still bounces to chats and that the `redirect` value carries the
path without the parameter.

---

## R6 — Accepted form for the identifier

**Question**: Propose a bounded charset and length that cannot carry a URL, additional
query parameters, a fragment, a path segment, percent-encoding, or whitespace, and
derive the ≥ 12 hostile inputs SC-002 requires.

**Decision**:

- **Reserved parameter name**: `idp`
- **Accepted form**: `/^[a-z0-9][a-z0-9-]{1,62}$/`
  — lowercase ASCII letters, digits, and hyphen; must start with a letter or digit;
  total length 2–63 characters
- **Type guard**: the value must be a primitive string. A repeated parameter yields an
  array from `vue-router` and is rejected without inspection.
- Anything else is discarded and the default login path continues, with no app-owned
  copy (FR-003, FR-005).

**Rationale**:

The charset is the intersection of what a Keycloak identity-provider alias needs and
what cannot express a payload. It admits no `:` or `/` (no scheme, no authority, no
path segment), no `?` or `&` or `=` (no additional parameters), no `#` (no fragment),
no `%` (no percent-encoding, so a decoded value containing a delimiter fails the test
even though `vue-router` decoded it before the app saw it), no whitespace in any form,
no `.` (no hostname), no `_`, and no uppercase — which makes SC-002's "mis-cased"
class a rejection rather than a silent normalization. The 63-character cap matches the
DNS-label convention aliases follow in practice and bounds the "over-long" class; the
2-character floor rejects single-character noise. The leading-character rule blocks
`-`-prefixed values that could be read as flags by downstream tooling.

Validation is **syntactic only**: a pure predicate over a string. The app holds no
list of customers, makes no pre-authentication request, and cannot distinguish
"well-formed and configured" from "well-formed and unknown" — which is what keeps
FR-003 and FR-009 true and keeps the enumeration surface at zero. A rejected value
takes the same code path as no value at all, so there is no observable difference for
an attacker probing for valid identifiers.

Deliberately **not** normalizing: no trimming, no lowercasing, no unescaping. Each
would convert a hostile input into an accepted one and turn `idp=%20acme-okta%20`
or `idp=ACME-OKTA` into successful redirects. Reject, never repair.

`idp` as the name is short, mirrors the `kc_idp_hint` it feeds, and collides with
nothing: the query parameters in use across the app are `plan`, `cursor`, `next`,
`redirect`, `tab`, and `utm_*`, plus the OAuth response parameters that arrive in the
fragment because `kc.responseMode` defaults to `'fragment'`.

**Hostile input set** (20 rejections, 2 acceptances — exceeds SC-002's 12):

| # | `?idp=` value | Class | Expected |
|---|---|---|---|
| 1 | *(absent)* | missing | reject |
| 2 | `` (empty) | empty | reject |
| 3 | `a` | under minimum length | reject |
| 4 | 64 × `a` | over-long | reject |
| 5 | `Acme-Okta` | mis-cased | reject |
| 6 | `ACME-OKTA` | mis-cased | reject |
| 7 | `%20acme-okta%20` → ` acme-okta ` | whitespace-padded | reject |
| 8 | `acme okta` | embedded whitespace | reject |
| 9 | `acme%2Fokta` → `acme/okta` | encoded path separator | reject |
| 10 | `acme%23okta` → `acme#okta` | encoded fragment marker | reject |
| 11 | `acme%26kc_idp_hint=other` → `acme&kc_idp_hint=other` | encoded parameter injection | reject |
| 12 | `%00acme` → `\0acme` | null byte | reject |
| 13 | `../../admin` | path traversal | reject |
| 14 | `https://evil.example.com` | absolute URL | reject |
| 15 | `//evil.example.com` | scheme-relative URL | reject |
| 16 | `javascript:alert(1)` | dangerous scheme | reject |
| 17 | `<script>alert(1)</script>` | script-bearing | reject |
| 18 | `acme.okta` | hostname-shaped | reject |
| 19 | `acme_okta` | disallowed separator | reject |
| 20 | `-acme` | leading hyphen | reject |
| 21 | `acme-okta` *(repeated: `?idp=acme-okta&idp=other`)* | non-string / array | reject |
| 22 | `acme-okta` | well-formed | accept |
| 23 | `a1` | well-formed, minimum length | accept |

`?idp=acme-okta&redirect_uri=https://evil.example.com` is tracked separately: `idp`
itself is well-formed and accepted, and the assertion is FR-004's — the extra
parameter must not reach the redirect. That is guaranteed by R4's construction
(`redirectUri` is computed from the app's own location, never from an input
parameter), and it earns its own test because it is an invariant rather than a
validation case.

**Alternatives considered**:

- *Allow uppercase and lowercase on read* — rejected. Silently converts a hostile
  class into an accepted one and removes SC-002's mis-cased class.
- *A UUID-only form* — rejected. Keycloak aliases are human-authored and rarely
  UUIDs; implantation would be unable to name a real provider.
- *Allow `.` for domain-shaped aliases* — rejected. It reintroduces hostname shapes
  and weakens the "cannot carry a URL" property for no requirement.
- *Validate against an allowlist fetched at boot* — rejected. FR-003 forbids the
  lookup and FR-009 forbids the enumeration surface.

---

## R7 — Locale parity enforcement

**Question**: SC-007 requires a mechanical check of key-set and placeholder parity
across the four files. Decide the mechanism, preferring a Vitest test — the
constitution says not to invent npm translation scripts since Crowdin owns
translations.

**Decision**: A colocated Vitest spec, `src/locales/__tests__/localeParity.spec.js`,
that imports the four JSON files and asserts (a) an identical **ordered** key sequence
at every nesting level and (b) an identical placeholder set for every leaf key. It
runs inside the existing `npm run test:coverage` CI step. No new npm script, no new
dependency, no Crowdin-adjacent tooling.

**Rationale**:

The repository already establishes this exact pattern: `tests/unit/utils/validate-changelog-release.spec.js`
enforces a repo-level invariant (CHANGELOG format and tag agreement) as a Vitest test
rather than as bespoke tooling. A locale parity test is the same shape of thing, so it
needs no new convention and no argument. Riding the existing CI step also means SC-007
is enforced on every PR, not only when someone remembers to run a script — which is
what "verified mechanically rather than by review" asks for.

**Baseline measured, not assumed.** The current state of `src/locales/`:

| Property | Measured today |
|---|---|
| Key count per file | 1013 in all four |
| Keys missing or extra vs `en` | 0 for `pt_br`, `es`, `ro` |
| Placeholder-set mismatches | 0 across all 1013 keys |
| Identical ordered key sequence vs `en` | Yes, 0 divergences at every level |
| Objects whose keys are alphabetically sorted | **74 of 318** — 244 are not, identically in all four files |

So the test passes on the current tree and will fail only on real drift introduced by
a change. Asserting the *ordered* sequence rather than the unordered set is free (it
already holds), and it is strictly stronger: it catches a key appended to the bottom of
`es.json` instead of inserted at its sibling's position, which is the most common way
Crowdin round-trips drift apart.

**Alphabetical ordering is deliberately excluded from the mechanical check.** 244 of
318 objects violate it today, in all four files identically. A repo-wide sort
assertion would fail on landing, and satisfying it would mean re-sorting 244 objects
across four files — a diff touching most of the locale tree, invalidating Crowdin
context on strings unrelated to this feature, with real risk of a merge accident, all
for a property no requirement asks to be enforced globally. Constitution IV's
alphabetical-order rule is honored where this delivery has authority: **keys added by
this feature are inserted in alphabetical position within their own object**, and both
objects touched (`orgs.access_disabled_reason` and `orgs.sso`) are already internally
sorted, so the new keys land correctly and the reviewer can verify it by eye. This is
recorded as a scoped, justified deviation rather than an oversight.

**Placeholder extraction must tolerate ICU.** `src/utils/plugins/i18n.js` registers a
custom `messageCompiler` (`src/utils/plugins/icuMessageCompiler.js`) that routes ICU
`plural` / `selectordinal` / `select` messages through `intl-messageformat` and
everything else through vue-i18n's native compiler. The extractor therefore captures
the *variable name* at the head of a brace group — matching both plain `{name}` and
the `count` in `{count, plural, one{…} other{…}}` — and compares name sets, not raw
strings. It must also not treat vue-i18n's literal escape `{'@'}` (live today in
`orgs.sso.invalid_domain`) as a placeholder; a name pattern anchored to
`[A-Za-z_][\w]*` excludes it, and that case is worth an explicit test so a future
extractor rewrite cannot silently regress it.

**Coverage**: `vitest.config.js` sets `coverage.include: ['src/**/*.{vue,js,ts}']`, so
JSON locale files are outside coverage accounting and the new spec cannot distort
SC-012.

**Alternatives considered**:

- *An npm script such as `translations:check`* — rejected. Constitution IV explicitly
  says not to invent npm translation scripts, and it would not run in CI without also
  editing the workflow.
- *An ESLint rule* — rejected. ESLint does not lint JSON here and cannot compare
  across files.
- *Trusting Crowdin to guarantee parity* — rejected. Crowdin syncs translations; it
  does not gate this repository's CI, and SC-007 asks for a check in the delivery.
- *Also asserting alphabetical order repo-wide* — rejected, with the measurement
  above as the reason.

---

## R8 — Dead code from Q3

**Question**: Making the copy provider-agnostic removes the `{providers}` placeholder,
which orphans `SSO_PROVIDER_LABELS` and `formatAllowedProviders` in
`src/utils/orgAccess.js`. Decide removal versus retention, and check what removing a
key implies for Crowdin.

**Decision**: Remove `SSO_PROVIDER_LABELS` and `formatAllowedProviders` entirely, drop
the `sso_config` argument from `getOrgAccessDisabledMessage`, and remove the now-unused
`ssoConfig` prop from `OrgCard.vue` together with its binding in `orgList.vue`. Add a
known-reason allowlist and a new `orgs.access_disabled_reason.default` key. No locale
**key** is removed; one placeholder is.

**Rationale**:

Constitution's Compatibility and Caution section requires grepping the federation and
iframe contracts before removing apparently-dead code. Done: `SSO_PROVIDER_LABELS` and
`formatAllowedProviders` are module-private to `src/utils/orgAccess.js` — the latter is
not even exported. Neither name appears in `rspack.config.js`'s `exposes` (only
`./sharedStore`), in any `postMessage` payload, or anywhere outside that file. They are
genuinely dead once the placeholder goes, not runtime contracts, so retention would be
unjustified clutter.

The stronger reason to go further and delete the `sso_config` parameter is FR-012: "no
identity-source identifier may reach the interface by any path, including sources the
app does not recognize." Keeping `sso_config` flowing into the message helper would
leave the leak one line of future carelessness away. Removing the parameter, the prop,
and the binding makes the identifier structurally unreachable from the message path —
FR-012 becomes a property of the code rather than a rule someone must remember. That
argument is what justifies touching three files instead of one, and it is worth stating
in the PR.

**FR-013 is a latent bug fixed in the same change.** The current helper interpolates
any reason into a key and calls `t`:

```js
const key = `orgs.access_disabled_reason.${reason}`;
return t(key, params);
```

For a reason the app does not recognize, vue-i18n returns the key string itself, so
`orgs.access_disabled_reason.some_new_backend_reason` renders on screen in a tooltip —
exactly the "raw reason code / missing-translation artifact" FR-013 forbids, shipping
today. The fix is an explicit allowlist of known reasons with a fall-through to the new
`default` key. An allowlist is chosen over probing with vue-i18n's `te` because the
helper receives only `t` (from `OrgCard.vue` as `this.$t.bind(this)`), and because an
allowlist states the contract locally where a reviewer can see it.

The resulting helper takes `{ access_disabled_reason }` and `t`, returns `''` for no
reason, the mapped message for a known reason, and the `default` message otherwise —
no parameters, no interpolation, no provider data.

**Crowdin implications**:

| Change | Crowdin effect |
|---|---|
| `sso_session_required` — text rewritten | Source string changes; existing translations for the old text are archived and the string re-enters the translation queue. All four languages are supplied in-repo in this PR, so nothing ships untranslated (Constitution IV). |
| `sso_provider_not_allowed` — text rewritten, `{providers}` removed | Same. Removing a placeholder is a source change, not a key removal, so no translation memory is lost. |
| `orgs.access_disabled_reason.default` — added | New source string, supplied in all four languages here. |
| `orgs.sso.managed_externally` — added | Same. |
| Keys removed | **None.** |

Because no key is deleted, this delivery has no Crowdin deletion semantics to manage —
a deliberate outcome of rewriting rather than restructuring the reason namespace.
Keeping one key per reason (rather than collapsing `sso_session_required` and
`sso_provider_not_allowed` into a single generic string) preserves distinct, useful
sentences and leaves `sso_email_domain_not_allowed` and `sso_password_configured`
untouched — they are already provider-agnostic and already correct.

**Alternatives considered**:

- *Keep the helpers for future per-provider copy* — rejected. Q3 is binding: the
  explanation names no identity source, for public providers and customer Okta alike.
  Speculative retention with no caller invites the leak back.
- *Keep `sso_config` in the signature but ignore it* — rejected. It keeps the leak
  path open and leaves a parameter no caller needs.
- *Collapse all SSO reasons into one message* — rejected. It discards accurate,
  reason-specific copy that no requirement asks to lose, and would delete keys, taking
  on Crowdin deletion semantics for no benefit.
- *Leave the unknown-reason behavior as-is* — rejected. It is the FR-013 defect and
  is one line to fix while the file is open.

---

## R9 — Read-only detection for the SSO settings surface

**Question**: How does `updateOrg.vue` recognize an allowlist it cannot faithfully
represent (a value outside its fixed `['google','microsoft']` set, or more than one
entry), and how is read-only presented with Unnnic?

**Decision**: Add a computed `isSsoReadOnly` that is true when
`sso_config.allowed_sso_providers` has more than one entry or contains any value
outside `SSO_PROVIDERS`. When true: disable the SSO switch, select, domain input, and
chips via Unnnic's `:disabled`; render a notice using the new
`orgs.sso.managed_externally` key; force `ssoDirty` to `false`; and make `saveChanges`
skip `updateSSOConfig` unconditionally. Stay in the Options API.

**Rationale**:

The defect is precise and visible in the current hydration:

```js
provider: config.allowed_sso_providers?.[0] ?? null,
```

`[0]` silently discards additional entries, and a value outside the fixed pair does not
match any option in `providerOptions`, so `UnnnicSelect` renders blank. From there an
ordinary save submits `allowedSSOProviders: provider ? [provider] : []` — for an
Okta-enabled organization that is either a replacement with a different provider or an
empty allowlist. Both are the outcomes FR-015 and FR-016 exist to prevent, and Product
FR-015 forbids an empty allowlist on an Okta-enabled organization outright.

The two detection conditions are exactly the two ways the form can lose information:
more entries than the single-select can hold, or an entry it has no option for. Both
derive from the form's own capability, not from a list of known Okta organizations, so
the surface needs no knowledge of Okta and adds no field to the contract — which keeps
BD-005 and FR-017 intact.

**Defence in depth, deliberately.** Four guards, because FR-016 is a data-destruction
requirement and SC-008 says *no sequence of interactions* may submit a replacement:

1. `isSsoReadOnly` disables every SSO input, so the form state cannot be edited.
2. `ssoDirty` returns `false` when read-only, so the dirty check cannot fire.
3. `saveChanges` skips `updateSSOConfig` when read-only, so even a programmatic call
   through a stale state cannot reach the API.
4. The 2FA path is a different endpoint (`account.updateAccount2FAStatus`) that never
   sends `sso_config`, so an adjacent save is structurally incapable of writing the
   allowlist.

Guard 4 means FR-016's specific scenario ("saving an adjacent setting must not replace
or clear the allowlist") is already satisfied by the API split. Guards 1–3 close the
SSO path itself. Worth noting in the PR so a reviewer does not read guards 2 and 3 as
redundant: guard 3 is the one that holds if a future refactor reintroduces a combined
save.

**Unnnic presentation**: `UnnnicSwitch`, `UnnnicSelect`, `UnnnicInput`, and
`UnnnicChip` all take `:disabled`, so read-only needs no new component and no custom
styling — disabled inputs plus one explanatory line reusing the existing
`weni-update-org__sso-helper` class and `$unnnic-*` tokens. The person still sees the
policy (US4: "can see the policy but cannot destroy it") and the domain list still
renders. No control to create, edit, test, or attach an Okta connection is added
anywhere (FR-017, SC-009).

**Options API, deliberately**: `updateOrg.vue` is an existing Options API component
and Constitution V forbids opportunistic rewrites. `isSsoReadOnly` is a `computed`
alongside `ssoDirty` and `isSaveDisabled`; the guard goes into the existing
`saveChanges`. New-code-uses-`<script setup>` does not apply to edits inside an
existing Options API file.

**FR-018 / SC-010**: for an organization whose allowlist is empty or holds a single
`google` / `microsoft` value, `isSsoReadOnly` is `false` and every code path is the one
that runs today. The existing `UpdateOrgSSO.spec.js` suite is the regression net for
that, and it must keep passing unmodified — which is a stronger and cheaper assurance
than adding new assertions about unchanged behavior.

**Alternatives considered**:

- *Add `okta` to `SSO_PROVIDERS`* — rejected. It would make the form an Okta
  configuration surface, violating BD-005 and FR-017.
- *Hide the SSO section entirely for such organizations* — rejected. US4 requires the
  administrator to be able to *see* the policy.
- *Detect from a new backend `is_managed` flag* — rejected. FR-011 and Clarification
  Q3 add no field to the organization contract, and the form's own capability is the
  honest criterion.
- *Guard only in `saveChanges`* — rejected. It leaves an editable form whose edits are
  silently dropped, which reads as a bug.

---

## R10 — Rollout

**Question**: Does door B ship behind a GrowthBook flag or unconditionally, given that
the identity service must be configured before any identifier resolves?

**Decision (2026-09-02)**: **Ship unconditionally.** Door B (User Stories 1, 2, 5) is
not gated. A well-formed `idp` always starts authentication. There is no
`enterprise-okta-direct-start` flag, no fail-closed GrowthBook read in the guard, and
no per-environment enablement flip. Merge enables door B. User Stories 3 and 4 remain
unflagged, as they always were.

**Prior decision (2026-09-01), withdrawn**: split the rollout — door B behind
`enterprise-okta-direct-start` (default off, fail closed), read from `getGrowthBook()` /
`gbInstance` because `inject` is unavailable in the guard; the two bug-fix stories
unflagged.

**Rationale for the reversal**:

The original flag existed for one risk: R2's finding that, absent the protocol mapper,
every live-session door B entry forces `prompt: 'login'`. That behavior is correct per
FR-008 and SC-013. Hiding it behind a flag delayed a working direct-start path and
added a silent fail-closed branch that is easy to ship broken (the guard appears to
work while ignoring `idp`). The delivery accepts the pre-mapper re-auth as live
behavior rather than a reason to gate. Engine/infra still owns the alias (B1) and the
mapper (B2); they affect runtime quality, not a flag flip.

User Stories 3 and 4 were never candidates for a flag. Both correct behavior that is
already shipping and already incorrect.

**Mechanism**: none. The guard does not import `@/utils/growthbook`. That file and
`src/store/featureFlags/index.js` stay unchanged and unused by this delivery.

**Residual risk, accepted**: until B2 lands, every signed-in door B visit re-authenticates.
Until B1 lands, Keycloak ignores `kc_idp_hint` and door B degrades to door A (R1).

**Alternatives considered**:

- *GrowthBook flag `enterprise-okta-direct-start`, fail closed* — adopted 2026-09-01,
  withdrawn 2026-09-02 (this reversal). It sequenced enablement behind B1/B2 and made
  a first-navigation miss look like door A.
- *Ship everything behind one flag* — rejected. It would gate two bug fixes that have
  no dependency and are wrong today.
- *Gate on an environment variable instead* — rejected. It needs a deploy to change
  and duplicates a mechanism this delivery is not using.
- *Gate door B on the presence of the `identity_provider` claim instead of a flag* —
  rejected. It self-disables neatly before the mapper lands, but it couples availability
  to a claim that is absent for legitimate password sessions even *after* the mapper
  exists, which would disable door B for exactly the door A users FR-008 cares about.

---

## Cross-cutting: observability (User Story 5, SC-011)

Not raised as a numbered question, but the design needs a decision and the spec's
"Observability reuses what exists" default constrains it.

**Decision**: Set a Sentry tag on the entry door from the router guard —
`Sentry.setTag('entry_door', 'default' | 'direct_start' | 'direct_start_rejected')` —
using the `@sentry/browser` instance already initialized in `src/main.js`. Record the
door only, never the identifier.

**Rationale**: Sentry is already initialized and already the app's diagnostics
pipeline, so this adds no dependency and no new pipeline. A tag is queryable and
attaches to every subsequent event in the session, which is what "support can tell
which door a person came through" needs.

The three values are exactly the three cases SC-011 asks to be distinguishable, and
the tag is a fixed enum — **never** the identifier, so no identity-source value, no
customer configuration, and no secret can reach Sentry. That satisfies NFR-003 by
construction rather than by redaction, and it is worth a test asserting the tag value
is one of the three literals and that no call passes the identifier.

**Alternative considered**: a Sentry breadcrumb per entry — rejected; breadcrumbs are
dropped on high-volume sessions and are harder to query than a tag. Logging the
identifier at any level — rejected; NFR-003.
