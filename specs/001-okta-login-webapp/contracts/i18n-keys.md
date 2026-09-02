# Contract: i18n keys

**Feature**: `001-okta-login-webapp` | **Files**: `src/locales/en.json`, `pt_br.json`, `es.json`, `ro.json`

Every key added, changed, or removed by this delivery, with the copy for all four
locales. Constitution IV makes all four a ship gate: they land in the same change, with
identical structure and placeholders.

**Summary**: 2 keys added, 2 keys changed, 0 keys removed, 1 placeholder removed.

Copy follows the VTEX Content Guide per language — sentence case, no "please", no
personal pronouns outside confirmation modals, at most two sentences and 240 characters
per message, trailing period only on multi-sentence messages.

---

## 1. Added keys

### 1.1 `orgs.access_disabled_reason.default`

The FR-013 generic fallback for a blocking reason the app cannot map. Prevents a raw
reason code, an empty tooltip, or a missing-translation artifact from reaching the
screen.

**Placement**: first key in `orgs.access_disabled_reason` — `default` sorts before every
`sso_*` sibling, and that object is already internally alphabetical.

| Locale | Copy |
|---|---|
| `en` | `Access to this organization is unavailable. Contact the organization admin.` |
| `pt_br` | `O acesso a esta organização não está disponível. Entre em contato com o administrador da organização.` |
| `es` | `El acceso a esta organización no está disponible. Ponte en contacto con el administrador de la organización.` |
| `ro` | `Accesul la această organizație nu este disponibil. Contactează administratorul organizației.` |

Placeholders: none. Names no provider, no organization, no identity source (FR-011,
FR-012). Mirrors the existing `sso_email_domain_not_allowed` "contact the admin"
structure so it reads as a sibling rather than an error state.

### 1.2 `orgs.sso.managed_externally`

The read-only notice for an organization whose identity-source allowlist the form cannot
faithfully represent (FR-015, US4).

**Placement**: between `lockout_error` and `provider_label` in `orgs.sso` —
`l` < `m` < `p`, and that object is already internally alphabetical.

| Locale | Copy |
|---|---|
| `en` | `This organization's sign-in policy is managed by the platform team and can't be edited here.` |
| `pt_br` | `A política de login desta organização é gerenciada pela equipe da plataforma e não pode ser editada aqui.` |
| `es` | `La política de inicio de sesión de esta organización es gestionada por el equipo de la plataforma y no se puede editar aquí.` |
| `ro` | `Politica de conectare a acestei organizații este gestionată de echipa platformei și nu poate fi editată aici.` |

Placeholders: none. Single sentence, so no trailing period would be required — but the
sentence is long and compound, which the guide treats as warranting one. Names no
identity source and no provider, so it is correct for an Okta-enabled organization
without revealing that Okta is involved (FR-012, BD-005). `can't` uses the contraction
the guide prescribes for English only.

---

## 2. Changed keys

### 2.1 `orgs.access_disabled_reason.sso_session_required`

The direct cause of FR-010: the current copy hard-codes "Google or Microsoft" in all
four languages, which is simply wrong for an organization requiring a company Okta or
GitHub.

**Before**:

| Locale | Copy |
|---|---|
| `en` | `Sign in with SSO (Google or Microsoft) to access this organization` |
| `pt_br` | `Faça login com SSO (Google ou Microsoft) para acessar esta organização` |
| `es` | `Inicia sesión con SSO (Google o Microsoft) para acceder a esta organización` |
| `ro` | `Conectează-te cu SSO (Google sau Microsoft) pentru a accesa această organizație` |

**After**:

| Locale | Copy |
|---|---|
| `en` | `Your current session doesn't meet this organization's sign-in requirements. Sign in the way this organization requires.` |
| `pt_br` | `Sua sessão atual não atende aos requisitos de login desta organização. Faça login da forma exigida por esta organização.` |
| `es` | `Tu sesión actual no cumple los requisitos de inicio de sesión de esta organización. Inicia sesión de la forma que esta organización requiere.` |
| `ro` | `Sesiunea ta actuală nu îndeplinește cerințele de conectare ale acestei organizații. Conectează-te în modul cerut de această organizație.` |

Placeholders: none, before and after. Accurate whether the organization requires GitHub,
Google, Microsoft, or a company Okta, and names none of them (FR-010, US3 scenario 1).

### 2.2 `orgs.access_disabled_reason.sso_provider_not_allowed`

Removes the `{providers}` placeholder. This is the only placeholder removal in the
delivery and the reason `SSO_PROVIDER_LABELS` and `formatAllowedProviders` become dead
code (research R8).

**Before**:

| Locale | Copy |
|---|---|
| `en` | `Sign in with an allowed SSO provider to access this organization: {providers}` |
| `pt_br` | `Faça login com um provedor de SSO permitido para acessar esta organização: {providers}` |
| `es` | `Inicia sesión con un proveedor SSO permitido para acceder a esta organización: {providers}` |
| `ro` | `Conectează-te cu un furnizor SSO permis pentru a accesa această organizație: {providers}` |

**After**:

| Locale | Copy |
|---|---|
| `en` | `Your current sign-in method isn't allowed in this organization. Sign in the way this organization requires.` |
| `pt_br` | `Seu método de login atual não é permitido nesta organização. Faça login da forma exigida por esta organização.` |
| `es` | `Tu método de inicio de sesión actual no está permitido en esta organización. Inicia sesión de la forma que esta organización requiere.` |
| `ro` | `Metoda ta actuală de conectare nu este permisă în această organizație. Conectează-te în modul cerut de această organizație.` |

Placeholders: `{providers}` **removed**; none remain. This is the deliberate trade
Clarification Q3 makes — dropping the provider list from the one message that carries it
today, in exchange for a message that can never be wrong and can never leak an
identity-source identifier (FR-011, FR-012, SC-005, SC-006).

The distinct wording from 2.1 is intentional: this reason is about the *method used*
being disallowed, 2.1 is about the *session* not meeting requirements. Both stay
provider-agnostic, and keeping them separate preserves accurate reason-specific copy
without collapsing keys.

---

## 3. Removed keys

**None.**

`sso_credential_unavailable`, `sso_email_domain_not_allowed`, and
`sso_password_configured` are untouched: they are already provider-agnostic and already
correct.

Deliberate — rewriting rather than restructuring the reason namespace means no Crowdin
deletion semantics to manage (§5).

---

## 4. Placeholder inventory after the delivery

Every key in `orgs.access_disabled_reason` is placeholder-free:

| Key | Placeholders |
|---|---|
| `default` | none |
| `sso_credential_unavailable` | none |
| `sso_email_domain_not_allowed` | none |
| `sso_password_configured` | none |
| `sso_provider_not_allowed` | none *(was `{providers}`)* |
| `sso_session_required` | none |

`orgs.sso.managed_externally`: none.

No key touched by this delivery takes an interpolation parameter, which is what makes
SC-006 ("zero identity-source identifiers reachable on screen") verifiable by
inspection: there is no parameter through which one could arrive.

---

## 5. Crowdin implications

| Change | Effect |
|---|---|
| `sso_session_required` rewritten | Source string changes; the previous translations are archived and the string re-enters the queue. All four languages ship here, so nothing is untranslated at any point |
| `sso_provider_not_allowed` rewritten, `{providers}` dropped | Same. Removing a placeholder is a source change, not a key removal — no translation memory is lost |
| `default` added | New source string, all four languages supplied here |
| `managed_externally` added | Same |
| Keys removed | None, so there is nothing for Crowdin to delete or archive by key |

Translations are managed through Crowdin and no npm translation script is added
(Constitution IV).

---

## 6. Parity enforcement

`src/locales/__tests__/localeParity.spec.js` (research R7) asserts:

1. Identical **ordered** key sequence at every nesting level across all four files.
2. Identical placeholder-name set for every leaf key — tolerating ICU
   `plural` / `selectordinal` / `select` blocks and excluding vue-i18n's literal escape
   `{'@'}`, which is live today in `orgs.sso.invalid_domain`.

Measured baseline before the change: 1013 keys per file, zero key differences, zero
placeholder mismatches, zero ordered-sequence divergences. Both invariants hold today,
so the test passes on landing and fails only on drift.

Expected after the change: 1015 keys per file, all invariants still holding.

**Repo-wide alphabetical ordering is not asserted.** 244 of 318 objects violate it
today, identically in all four files; enforcing it would mean re-sorting most of the
locale tree and invalidating Crowdin context on unrelated strings. Both objects this
delivery touches are already internally alphabetical, and both new keys are inserted in
their correct alphabetical position (§1.1, §1.2), so Constitution IV is honored where
this delivery has authority. Full justification in research R7.

---

## 7. Requirements covered

FR-010, FR-011, FR-012, FR-013, FR-014, FR-015; SC-005, SC-006, SC-007.
