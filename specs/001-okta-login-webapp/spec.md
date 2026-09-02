# Feature Specification: Enterprise Okta login — web app slice

**Feature Branch**: `001-okta-login-webapp`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "We have a product spec and need to create our engineering spec based on that. Product Spec: Enterprise Okta login (weni-ai/vtex-cx-experience-specs, branch 003-okta-login-v2, commit 14f91f5). Inherited binding decisions BD-001 … BD-009. Scope of this spec: weni-webapp changes. Divergences: none."

## Inheritance from Product Spec

| | |
|---|---|
| **Product spec** | Enterprise Okta login — `weni-ai/vtex-cx-experience-specs`, `specs/003-okta-login/spec.md` |
| **Pinned version** | `003-okta-login-v2` (`14f91f5`) |
| **Inherited binding decisions** | BD-001 … BD-009 (all, unmodified) |
| **Scope of this spec** | `weni-webapp` changes only |
| **Divergences** | None |

The product spec is the source of truth for WHAT and WHY. This spec restates
only the slice this repository owns, and adds the repository-level behavior the
product spec deliberately left to engineering.

The product spec assigns the web app a narrow slice (Assumptions & Dependencies,
and Solution Architecture Vision → External dependencies & integrations):

> "Theme work for identity-first is required for a non-stock first step and is
> done on the **Keycloak login theme**, not by building a login page in the
> Connect web app […] The web app's in-scope slice is door B handling and
> blocked-organization copy (FR-012)."

Everything else — the identity-first first step, domain→identity-source routing,
session issuance, and per-organization policy evaluation — is owned by Engine/infra
(login theme and platform identity service) and by Connect's backend. This spec
does not restate those.

### Inherited binding decisions and what they bind here

| BD | Binding effect on this repository |
|---|---|
| **BD-001** | Single platform issuer. The app MUST NOT validate an Okta token, MUST NOT treat a customer Okta as a second issuer, and MUST NOT render a public "Login with Okta" control. |
| **BD-002** | Door A is the product; door B is required and MUST mint the same session. Door B is this repository's primary deliverable. |
| **BD-003** | Identity-first is realm-wide and lives in the login theme. The app owns no first step and MUST NOT build one. |
| **BD-004** | Routing and enforcement are two layers. The app reads the enforcement outcome; it MUST NOT infer or recompute policy locally. |
| **BD-005** | No Okta configuration UI in v1. The app MUST NOT add one, and MUST NOT let its existing SSO settings surface act as one. |
| **BD-006** | Invite-only. The app MUST NOT treat a successful login as organization membership. |
| **BD-007** | Staging-correct flow before visual polish. Third-party action appearance is untouched; the app owns no such control anyway. |
| **BD-008** | OIDC by default, SAML only by exception. The user-visible behavior in the app MUST NOT differ by protocol. |
| **BD-009** | Support domains keep a platform password. The app MUST NOT block or nudge password removal for `@weni.ai` / `@vtex.com`, and MUST NOT hard-code that policy locally. |

### Traceability

Every requirement below carries the product requirement it derives from. Product
identifiers (`FR-0xx`, `NFR-0xx`, `SC-0xx`, `BD-0xx`) always refer to the pinned
product spec; identifiers without a `Product` prefix are local to this document.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Door B: a bookmarked customer login address reaches company Okta (Priority: P1)

An IT administrator at a customer publishes a customer-specific platform login
address. A person at that customer opens it from a bookmark, a saved tab, or a
pasted link. The app recognizes that the address names a specific customer
identity source, and sends the person straight to that company's sign-in. No app
screen appears in between — no organization picker, no account chooser, no
provider list, no visible flash of the shared login. After company sign-in, the
person lands in the product exactly as if they had used door A.

**Why this priority**: This is the whole of the app's door B obligation, and the
product spec calls door B required rather than optional (Product FR-013, User
Journey 2, BD-002). Nothing else in this repository unblocks the first customer.

**Independent Test**: Open a valid customer login address while signed out and
confirm the browser leaves for the platform identity service carrying the correct
customer identity source on the first navigation, with no app view rendered in
between, and that completing sign-in lands on the normal post-login destination.

**Acceptance Scenarios**:

1. **Given** a signed-out person opens a valid customer-specific login address,
   **When** the app resolves that address, **Then** authentication starts against
   that customer's identity source and no organization, account, or provider
   choice is presented by the app.
2. **Given** company sign-in completes, **When** the person returns to the app,
   **Then** they land on the app's normal post-login destination and the session
   is indistinguishable from a door A session.
3. **Given** the person returns to the app after sign-in, **When** the app
   restores the route, **Then** the customer identity-source identifier is no
   longer present in the address in a form that starts another redirect.
4. **Given** a customer-hosted control (door C) that routes through the same
   platform address with an identifier, **When** the person uses it, **Then** the
   app behaves exactly as in scenario 1.

---

### User Story 2 - An unusable direct-start identifier degrades to the default login (Priority: P1)

Someone opens a customer login address whose identifier is missing, empty,
misspelled, expired, belongs to no configured customer, or has been hand-edited
to something hostile. The app refuses to act on it. The person continues on the
ordinary login path with no customer identity source requested. The app does not
tell them the identifier was invalid, does not name a customer, and does not
reveal whether that identifier belongs to some other customer.

**Why this priority**: Product FR-013 makes this a tenant-isolation requirement,
not an error-handling nicety. A direct-start identifier that can be edited into
another customer's identity source is a cross-tenant defect, and it ships in the
same change as User Story 1.

**Independent Test**: Exercise a list of empty, over-long, wrongly-cased,
whitespace-padded, percent-encoded, path-traversing, URL-bearing, and
script-bearing identifiers; confirm that none of them starts authentication
against a customer identity source, that every one of them lands on the default
login path, and that no app-owned message names a customer or acknowledges the
identifier.

**Acceptance Scenarios**:

1. **Given** a direct-start identifier that fails the app's accepted form,
   **When** the app resolves the address, **Then** it discards the identifier and
   starts the default login path with no customer identity source requested.
2. **Given** a well-formed identifier that matches no configured customer,
   **When** the person completes the redirect, **Then** they arrive at the shared
   login first step and the app adds no new copy about the identifier.
3. **Given** an identifier crafted to carry a URL, extra parameters, or path
   segments, **When** the app resolves the address, **Then** the destination is
   still only the platform identity service already configured for the app.
4. **Given** any rejected identifier, **When** the person continues,
   **Then** no app-owned message names a customer, an organization, or an
   identity source, and no message confirms whether the identifier exists.

---

### User Story 3 - Blocked-organization copy stops naming only Google and Microsoft (Priority: P1)

A person signs in and opens the organization list. An organization they belong to
is blocked because their current session does not satisfy that organization's
sign-in policy. Today the explanation says "Sign in with SSO (Google or
Microsoft)". For an organization that requires a customer's Okta that sentence is
simply wrong, and it is wrong in all four locales. The explanation becomes
provider-agnostic: it tells the person their current session does not satisfy the
organization and that they must sign in the way that organization requires,
without naming any provider. This deliberately drops the provider list from the
one message that carries it today, in exchange for a message that can never be
wrong and can never leak an identity-source identifier.

**Why this priority**: Product FR-012 and SC-008 make this a named deliverable,
and the wrong sentence is already shipping. It is also independently
deliverable — it needs nothing from door B.

**Independent Test**: Render a blocked organization for each blocking reason in
each of the four locales and confirm that no message names a provider and that no
identity-source identifier reaches the screen.

**Acceptance Scenarios**:

1. **Given** an organization blocked because the session does not satisfy its
   sign-in policy, **When** the person sees the explanation, **Then** the text is
   accurate whether the organization requires GitHub, Google, Microsoft, or a
   company Okta, and names none of them.
2. **Given** an organization whose allowed identity source is a customer Okta,
   **When** the person sees the explanation, **Then** no identifier or display
   name for that identity source appears in the text.
3. **Given** an organization whose allowed identity source is Google or
   Microsoft, **When** the person sees the explanation, **Then** it reads as a
   correct, natural sentence without the provider list it carries today.
4. **Given** any of the four supported locales, **When** the explanation renders,
   **Then** it is present, translated, and carries the same placeholders as every
   other locale.

---

### User Story 4 - Existing SSO settings cannot silently break an Okta-enabled organization (Priority: P2)

An administrator of an organization that implantation has configured for company
Okta opens the organization's existing SSO settings. That form only knows how to
express Google and Microsoft. Today it would show a blank provider selection for
that organization, and saving would replace or clear the customer Okta allowlist —
turning an enforcing organization into one that accepts a different provider, or
one with an empty allowlist. Instead, the form presents the configuration as
read-only for organizations it cannot faithfully represent, so the administrator
can see the policy but cannot destroy it.

**Why this priority**: Product FR-015 forbids an empty identity-source allowlist
on an Okta-enabled organization, and Product FR-006 forbids one customer's source
satisfying another's organization. The current form can produce both outcomes from
an ordinary save. It is P2 rather than P1 only because no customer can hit it
until implantation enables the first Okta organization — but it must ship before
that moment, not after.

**Independent Test**: Render the organization settings for an organization whose
allowlist holds a value the form does not offer, and confirm the SSO section is
read-only and that no save path can submit a replacement or empty allowlist for it.

**Acceptance Scenarios**:

1. **Given** an organization whose allowed identity source is a value the form
   does not offer, **When** an administrator opens SSO settings, **Then** the
   configuration is shown as read-only and cannot be submitted.
2. **Given** that same organization, **When** the administrator changes an
   adjacent setting the form does own, **Then** saving that setting MUST NOT
   replace or clear the identity-source allowlist.
3. **Given** an organization whose allowed identity source is Google or
   Microsoft, **When** an administrator opens SSO settings, **Then** the form
   behaves exactly as it does today.
4. **Given** any organization, **When** an administrator looks for a way to
   create, edit, or test an Okta connection, **Then** no such control exists.

---

### User Story 5 - Support can tell which door a person came through (Priority: P3)

A support engineer investigates a failed or surprising login. They can tell
whether the person arrived through the ordinary login path or through a
direct-start customer address, and whether a direct-start identifier was accepted
or rejected — without any customer's identity configuration, identifiers, or
secrets being exposed to them or to any other customer.

**Why this priority**: The product spec's cross-cutting observability requirement
asks support to distinguish door A from door B and C, and NFR-003 constrains how.
It is genuinely useful but nothing blocks on it, and it is the smallest slice here.

**Independent Test**: Trigger an accepted and a rejected direct-start entry and
confirm each is distinguishable in the app's existing diagnostics, and that
neither records an identity-source secret or another customer's configuration.

**Acceptance Scenarios**:

1. **Given** a person enters through a direct-start address, **When** support
   inspects the session's diagnostics, **Then** the entry door is identifiable.
2. **Given** a direct-start identifier is rejected, **When** support inspects
   diagnostics, **Then** the rejection is identifiable and distinct from a normal
   door A entry.
3. **Given** any recorded diagnostic, **When** support reads it, **Then** it
   contains no identity-provider secret and no other customer's configuration.

### Edge Cases

Derived from the product spec's Edge Cases, filtered to what this repository can
observe or cause.

- **Already signed in, opens door B**: a person with a live platform session
  opens a customer direct-start address. The session is reused only when it came
  from the identity source the address names; otherwise the app re-authenticates
  against the named source (FR-008). A platform password session therefore never
  walks through a company sign-in door.
- **Signed-in person opens a door B address for a different customer**: the
  requested identity source and the session's identity source disagree, so the
  app re-authenticates. It MUST NOT silently present the current session as
  satisfying the requested one.
- **Session's identity source is unknown to the app**: if the app cannot
  determine which identity source produced the current session, it MUST treat
  that as a mismatch and re-authenticate. Unknown MUST NOT resolve to reuse.
- **Redirect loop**: the post-sign-in return lands back on the direct-start
  address, which starts the redirect again. This MUST NOT happen (Constitution
  principle II: no new redirect loops in the router gate).
- **Double entry**: a person opens two tabs on the same direct-start address, or
  reloads mid-redirect. Each attempt is independent; the app MUST NOT queue,
  duplicate, or interleave redirects within a single tab.
- **Session expiry on a direct-start address**: an expired session is treated as
  signed out; the app MUST NOT skip the requested identity source because a stale
  session exists.
- **Abandoned company sign-in**: the person closes the identity provider without
  completing. The app MUST NOT hold a partial session or a pending direct-start
  state that fires later.
- **Identity provider unavailable or slow**: the app surfaces the existing generic
  sign-in failure. It MUST NOT retry against a different identity source and MUST
  NOT fall back to a path that skips the requested one.
- **Blocked reason the app does not recognize**: the backend returns a blocking
  reason with no matching message. The app MUST show a safe generic explanation
  rather than a raw reason code, an empty tooltip, or a missing-translation string.
- **Identity source the app does not recognize**: the backend returns an allowlist
  entry with no known label. The app MUST NOT echo it verbatim to the screen
  (Product NFR-003).
- **Organization with an empty allowlist and no Okta enablement**: today the app
  renders it as it always has. This delivery MUST NOT change that rendering or
  that behavior (Product FR-017, SC-011).
- **Organization membership**: a successful sign-in through any door MUST NOT
  cause the app to present an organization the person was not authorized into
  (Product FR-008, FR-009, BD-006).

## Requirements *(mandatory)*

### Functional Requirements

#### Door B — direct-start entry

- **FR-001**: The app MUST accept a customer-specific direct-start entry address
  formed as the app's existing entry address plus a single reserved query
  parameter carrying an identifier for one customer identity source, and MUST
  begin authentication against that identity source. No new route is introduced.
  *(Product FR-013, User Journey 2, BD-002; Clarification Q1)*
- **FR-002**: On a direct-start entry the app MUST NOT render any view that lets
  the person choose an account, an organization, an identity provider, or a
  destination, and MUST NOT briefly display one before redirecting.
  *(Product User Journey 2 scenario 1, BD-003)*
- **FR-003**: A direct-start identifier MUST be validated against a strictly
  bounded accepted form before it is used. Validation is syntactic only: the app
  MUST NOT hold, fetch, or consult a list of configured customers, and MUST NOT
  make a pre-authentication call to resolve the identifier. An identifier failing
  validation MUST be discarded, and the app MUST continue on the default login
  path with no customer identity source requested.
  *(Product FR-013; Clarification Q1)*
- **FR-004**: The app MUST NOT use a direct-start identifier to construct or
  influence any destination other than the platform identity service already
  configured for the app. A direct-start identifier MUST NOT be able to add,
  remove, or override any other parameter of that redirect. *(Product FR-013, BD-001)*
- **FR-005**: The app MUST NOT display any new message that names a customer, an
  identity source, or an organization when a direct-start identifier is rejected,
  and MUST NOT confirm whether an identifier exists or belongs to another
  customer. Rejected entries fall back to the existing generic sign-in failure
  behavior, which the app does not own. *(Product FR-013, NFR-003)*
- **FR-006**: A session established through a direct-start entry MUST be
  identical in kind to a session established through the default login path, and
  organization access MUST be evaluated from it identically. The app MUST NOT
  keep door-specific session state. *(Product FR-005, SC-003)*
- **FR-007**: After authentication completes, the app MUST return the person to
  its normal post-login destination, and the direct-start identifier MUST NOT
  remain in the address in a form that starts a further redirect.
  *(Product User Journey 2; Constitution II — no redirect loops)*
- **FR-008**: When a direct-start entry is made while a session already exists,
  the app MUST reuse that session only if it was established by the identity
  source the address names. If the sources differ, or if the app cannot determine
  which source established the session, it MUST re-authenticate against the named
  source. *(Product FR-005, FR-007, BD-009; Clarification Q2)*
- **FR-009**: The app MUST NOT render a public control that starts enterprise
  Okta, and MUST NOT offer a way to discover, list, or enumerate configured
  customer identity sources. *(Product FR-001, BD-001, NFR — scale & performance)*

#### Blocked-organization explanation

- **FR-010**: The explanation shown for an organization blocked because the
  session does not satisfy its sign-in policy MUST be provider-agnostic. It MUST
  NOT name Google and Microsoft as the only options, and MUST remain accurate
  when the required source is GitHub or a company Okta. *(Product FR-012, SC-008)*
- **FR-011**: A blocked-organization explanation MUST NOT name the identity
  source the organization requires — not a customer Okta, and not a public
  provider. It refers to the required sign-in generically, so no identifier,
  brand name, or display name is needed and no new field is added to the
  organization contract. *(Product NFR-003, FR-012; Clarification Q3)*
- **FR-012**: Because no identity source is named, no identity-source identifier
  may reach the interface by any path, including sources the app does not
  recognize. *(Product NFR-003; Clarification Q3)*
- **FR-013**: Any blocking reason the app cannot map to a message MUST render a
  safe generic explanation, never a raw reason code, an empty string, or a
  missing-translation artifact. *(Product NFR-003, Edge Cases → data)*
- **FR-014**: Every string added or changed by this delivery MUST exist in
  English, Portuguese (Brazil), Spanish, and Romanian with identical nested
  structure, identical placeholders, and snake_case keys in alphabetical order,
  and MUST follow the VTEX Content Guide for each language.
  *(Product NFR-005, Design Vision → localization; Constitution IV)*

#### Organization SSO settings surface

- **FR-015**: The existing organization SSO settings surface MUST NOT be able to
  replace, clear, or partially represent an identity-source allowlist whose
  contents it cannot express. For such an organization it MUST present the
  configuration as read-only. *(Product FR-011, FR-015, BD-005)*
- **FR-016**: Saving any adjacent organization setting MUST NOT write an
  identity-source allowlist the surface did not faithfully load — in particular
  it MUST NOT submit an empty allowlist for an organization that had a non-empty
  one. *(Product FR-015 — empty allowlist forbidden on an Okta-enabled org)*
- **FR-017**: The app MUST NOT add any interface to create, edit, test, or
  attach an Okta connection. *(Product FR-011, SC-006, BD-005)*
- **FR-018**: For organizations without customer-Okta enablement, this delivery
  MUST NOT change how the app renders the organization, how it evaluates access,
  or how it renders SSO settings — including organizations whose allowlist or
  email-domain list is already empty. *(Product FR-017, SC-011)*

#### Boundaries this delivery must not cross

- **FR-019**: The app MUST NOT call a customer Okta, validate an Okta token, or
  act as a second identity issuer. *(Product Solution Architecture Vision, BD-001)*
- **FR-020**: The app MUST NOT build, host, or replace the shared login first
  step. Email entry, domain checking, the password step, and the GitHub, Google,
  and Microsoft actions remain owned by the login theme.
  *(Product FR-001, FR-002, BD-003, Assumptions & Dependencies)*
- **FR-021**: The app MUST NOT decide organization access locally, MUST NOT infer
  sign-in policy from an identity-source identifier, and MUST NOT grant or imply
  organization membership from a successful sign-in.
  *(Product FR-008, FR-009, BD-004, BD-006)*
- **FR-022**: The app MUST NOT hard-code the support-domain exception. Whether a
  `@weni.ai` or `@vtex.com` person may enter an Okta-configured organization is
  decided upstream and only rendered here. *(Product FR-016, BD-009)*

### Key Entities *(include if feature involves data)*

- **Direct-start identifier**: A short, opaque token appearing in a
  customer-specific entry address that names exactly one customer identity
  source. It is not a customer name, an organization identifier, a domain, or a
  destination. The app validates its form, forwards it, and otherwise treats it
  as meaningless.
- **Entry door**: How a person arrived — the ordinary login path, or a
  direct-start address. Observable to the app only for the purpose of FR-006 and
  User Story 5; it MUST NOT alter the resulting session.
- **Organization access outcome**: The per-organization decision the app receives
  and renders — whether access is active or blocked, and why. Produced upstream;
  the app never computes it.
- **Session identity source**: Which identity source established the current
  session. Read by the app only to decide FR-008 reuse-versus-re-authenticate,
  and never rendered. When it cannot be determined, it is treated as a mismatch.
- **Supported locale set**: English, Portuguese (Brazil), Spanish, Romanian. All
  four are a ship gate, not a follow-up.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid customer direct-start addresses reach the platform
  identity service carrying the correct identity source on the first navigation,
  with no app view rendered in between. *(FR-001, FR-002; Product SC-007)*
- **SC-002**: 100% of a documented set of at least 12 malformed, empty,
  over-long, mis-cased, whitespace-padded, encoded, path-bearing, URL-bearing,
  and script-bearing identifiers are rejected without starting authentication
  against any customer identity source. *(FR-003, FR-004; Product FR-013)*
- **SC-003**: Zero direct-start entries produce a redirect loop, measured by every
  door B path completing in a single redirect to the identity service and a single
  return. *(FR-007; Constitution II)*
- **SC-004**: A session created through a direct-start address and a session
  created through the ordinary login path are indistinguishable to every consumer
  of session state in the app. *(FR-006; Product SC-003, FR-005)*
- **SC-005**: Zero blocked-organization messages in any of the four locales name
  an identity provider. *(FR-010, FR-011; Product SC-008)*
- **SC-006**: Zero identity-source identifiers and zero raw blocking reason codes
  are reachable on screen, across every reason and every identity source the
  backend can return, including values the app does not recognize.
  *(FR-011, FR-012, FR-013; Product NFR-003)*
- **SC-013**: Zero direct-start entries reuse a session established by an
  identity source other than the one the address names, including entries where
  the session's identity source cannot be determined. *(FR-008; Clarification Q2)*
- **SC-007**: The four locale files carry an identical key set and identical
  placeholders after this delivery, verified mechanically rather than by review.
  *(FR-014; Constitution IV)*
- **SC-008**: No sequence of interactions with organization SSO settings can
  submit a replacement or empty identity-source allowlist for an organization
  whose allowlist the surface cannot express. *(FR-015, FR-016; Product FR-015)*
- **SC-009**: No interface exists anywhere in the app to create, edit, test, or
  attach an Okta connection. *(FR-017; Product SC-006)*
- **SC-010**: For organizations without customer-Okta enablement, organization
  rendering, access behavior, and SSO settings behavior are byte-for-byte
  unchanged from before this delivery. *(FR-018; Product SC-011)*
- **SC-011**: Support can distinguish an ordinary entry, an accepted direct-start
  entry, and a rejected direct-start entry from existing diagnostics, with zero
  identity-provider secrets and zero other-customer configuration recorded.
  *(User Story 5; Product NFR-003)*
- **SC-012**: Test coverage does not drop on any file this delivery touches, and
  every changed behavior in the router gate, the authentication path, and the
  organization chrome ships with tests. *(Constitution VI)*

## Assumptions

Assumptions made where the product spec left engineering to decide, and
dependencies this repository cannot satisfy alone.

### Ownership and dependencies

- The shared login first step — email, the password step, and the GitHub, Google,
  and Microsoft actions — is delivered by Engine/infra on the Keycloak login
  theme. This spec assumes the theme ships that step; nothing here substitutes
  for it.
- Domain→identity-source mapping and per-organization policy evaluation are
  configured by implantation on the platform identity service and enforced by
  Connect's backend. The app consumes the outcome.
- The organization list API already returns a per-organization access status, a
  blocking reason, and the organization's SSO configuration. This delivery
  assumes those fields keep their current meaning and adds no field to that
  contract (Clarification Q3).
- FR-008 requires the app to know which identity source established the current
  session. This spec assumes that is readable from the session the platform
  identity service already issues. If it is not, FR-008's stated fallback applies
  — undeterminable means re-authenticate — and confirming that this does not
  produce a re-authentication on every door B entry for an already-signed-in
  person is a plan-phase obligation.
- The app already delegates login entirely to the platform identity service and
  hosts no login page. This delivery does not change that.

### Repository anchors

Named so the plan phase starts from the right surfaces, not to prescribe a design:

- The single authentication gate is the router's global navigation guard; it is
  the only place login is currently started. Adding conditions there carries the
  Constitution's no-redirect-loop obligation.
- The platform identity client is initialized exactly once, lazily, from that
  guard. Constitution principle II forbids a second initialization.
- Blocked-organization messaging resolves through one shared helper and one
  locale namespace, consumed by the organization card and the organization list.
  That helper currently maps only `google` and `microsoft` to labels and falls
  through to the raw identifier for anything else — the direct cause of FR-012.
- One of the four locale strings for the session-required reason hard-codes
  "Google or Microsoft" in every language — the direct cause of FR-010.
- The organization SSO settings surface offers a fixed two-provider choice and
  loads the organization's first allowlist entry into it. An allowlist entry
  outside that pair cannot round-trip, which is the defect FR-015 and FR-016
  close.

### Behavioral defaults chosen here

- **Rejection is silent**: the app adds no new copy for a rejected direct-start
  identifier. Product FR-013 forbids a distinct "invalid link" message, so the
  app degrades to the ordinary login path and lets the existing generic sign-in
  failure — owned by the login theme — be the only feedback.
- **Validation is syntactic and bounded**: the app enforces a strict accepted
  form for the identifier and does not hold a list of customers. Resolving an
  identifier to a real customer is the identity service's job; the app's
  responsibility is refusing to forward anything that could carry a payload
  (Clarification Q1).
- **Return destination**: after a direct-start sign-in the person lands on the
  app's existing default post-login destination unless the address itself carried
  a destination the app already supports today. This delivery introduces no new
  destination mechanism.
- **Observability reuses what exists**: entry-door visibility is expressed
  through the diagnostics the app already sends, not a new pipeline.
- **Copy strategy**: the session-required explanation is rewritten once,
  provider-agnostically, rather than branching per identity source. Fewer strings
  means four locales stay honest. A consequence of Clarification Q3 is that the
  message which lists allowed providers today stops doing so, and its
  provider-list placeholder is removed rather than left unused.
- **No dependency additions**: nothing in this slice justifies a new package.

### Explicitly out of scope for this repository

Restated from the product spec so the plan phase does not re-litigate them: a
public "Login with Okta" control; a merchant-facing Okta configuration surface;
SCIM, group-to-role sync, or deprovisioning; just-in-time organization
membership; a login page in the web app; Okta token validation in the app;
per-customer identity realms; other enterprise identity providers; and visual
refinement of the login theme.

## Clarifications

### Session 2026-09-01

- **Q1**: What is the shape of the door B direct-start address, and is a
  syntactic check on the identifier sufficient before redirecting, or must the
  app confirm it against an authoritative source first? → **A**: A single
  reserved query parameter on the app's existing entry address, with syntactic
  validation only. No new route, no pre-authentication lookup, and no
  customer list held in the app. Resolving the identifier stays the identity
  service's responsibility. (FR-001, FR-003)
- **Q2**: When someone with a live platform session opens a door B address, does
  the app reuse that session? → **A**: Only when the session was established by
  the identity source the address names. On any mismatch — including a session
  whose identity source the app cannot determine — the app re-authenticates
  against the named source. A platform password session never satisfies a
  company sign-in door. (FR-008, SC-013)
- **Q3**: In a blocked-organization explanation, how is a customer Okta referred
  to? → **A**: It is not. The explanation names no identity source at all, for
  customer Okta and public providers alike. No display name is added to the
  organization API contract, and the provider-list placeholder in today's copy is
  removed. (FR-011, FR-012, SC-005)

## Open Questions

None. All clarifications are resolved above.
