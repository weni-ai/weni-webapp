import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidDirectStartIdentifier, navigationGuard } from '@/router';

const { keycloakService, sentryMock } = vi.hoisted(() => ({
  keycloakService: {
    isAuthenticated: vi.fn(),
    keycloak: {
      login: vi.fn(),
      tokenParsed: {},
    },
  },
  sentryMock: {
    setTag: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

vi.mock('@/services/Keycloak', () => ({ default: keycloakService }));

vi.mock('@sentry/browser', () => sentryMock);

const FROM = {
  name: undefined,
  path: '/',
  hash: '',
  query: {},
  params: {},
  matched: [],
};

function authRoute({
  query = {},
  hash = '',
  name = 'orgs',
  path = '/orgs',
  params = {},
  matched,
} = {}) {
  return {
    name,
    path,
    hash,
    query,
    params,
    matched: matched ?? [{ meta: { requiresAuth: true } }],
    meta: { requiresAuth: true },
  };
}

function sentryPayload() {
  return JSON.stringify([
    ...sentryMock.setTag.mock.calls,
    ...sentryMock.captureException.mock.calls,
    ...sentryMock.captureMessage.mock.calls,
  ]);
}

describe('isValidDirectStartIdentifier', () => {
  const rejections = [
    { id: 'R1', value: undefined },
    { id: 'R2', value: '' },
    { id: 'R3', value: 'a' },
    { id: 'R4', value: 'a'.repeat(64) },
    { id: 'R5', value: 'Acme-Okta' },
    { id: 'R6', value: 'ACME-OKTA' },
    { id: 'R7', value: ' acme-okta ' },
    { id: 'R8', value: 'acme okta' },
    { id: 'R9', value: 'acme/okta' },
    { id: 'R10', value: 'acme#okta' },
    { id: 'R11', value: 'acme&kc_idp_hint=other' },
    { id: 'R12', value: '\0acme' },
    { id: 'R13', value: '../../admin' },
    { id: 'R14', value: 'https://evil.example.com' },
    { id: 'R15', value: '//evil.example.com' },
    { id: 'R16', value: 'javascript:alert(1)' },
    { id: 'R17', value: '<script>alert(1)</script>' },
    { id: 'R18', value: 'acme.okta' },
    { id: 'R19', value: 'acme_okta' },
    { id: 'R20', value: '-acme' },
    { id: 'R21', value: ['acme-okta', 'other'] },
  ];

  const acceptances = [
    { id: 'A1', value: 'acme-okta' },
    { id: 'A2', value: 'a1' },
  ];

  it.each(rejections)('$id is rejected without repair', ({ value }) => {
    expect(isValidDirectStartIdentifier(value)).toBe(false);
  });

  it.each(acceptances)('$id is accepted as-is', ({ value }) => {
    expect(isValidDirectStartIdentifier(value)).toBe(true);
  });

  it('does not trim, fold case, or unescape a rejected value into an accepted one', () => {
    expect(isValidDirectStartIdentifier(' acme-okta ')).toBe(false);
    expect(isValidDirectStartIdentifier('Acme-Okta')).toBe(false);
    expect(isValidDirectStartIdentifier('acme%2Fokta')).toBe(false);
    expect(isValidDirectStartIdentifier('acme-okta')).toBe(true);
  });
});

describe('navigationGuard door B', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    keycloakService.isAuthenticated.mockResolvedValue(false);
    keycloakService.keycloak.tokenParsed = {};
    vi.stubGlobal(
      'location',
      new URL('https://dash.weni.ai/orgs?idp=acme-okta'),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls login exactly once with idpHint and redirectUri when signed out with an accepted identifier', async () => {
    const next = vi.fn();

    await navigationGuard(
      authRoute({ query: { idp: 'acme-okta' } }),
      FROM,
      next,
    );

    expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(1);
    expect(keycloakService.keycloak.login).toHaveBeenCalledWith({
      idpHint: 'acme-okta',
      redirectUri: 'https://dash.weni.ai/orgs',
    });
    expect(next).not.toHaveBeenCalled();
  });

  describe('prompt: login on FR-008 branches', () => {
    beforeEach(() => {
      keycloakService.isAuthenticated.mockResolvedValue(true);
    });

    it("passes prompt: 'login' when the live session identity_provider differs from the identifier", async () => {
      keycloakService.keycloak.tokenParsed = {
        identity_provider: 'other-okta',
      };
      const next = vi.fn();

      await navigationGuard(
        authRoute({ query: { idp: 'acme-okta' } }),
        FROM,
        next,
      );

      expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(1);
      expect(keycloakService.keycloak.login.mock.calls[0][0]).toEqual({
        idpHint: 'acme-okta',
        prompt: 'login',
        redirectUri: 'https://dash.weni.ai/orgs',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      { label: 'absent', identity_provider: undefined },
      { label: 'empty', identity_provider: '' },
      { label: 'non-string', identity_provider: 1 },
    ])(
      "passes prompt: 'login' when the claim is $label",
      async ({ identity_provider }) => {
        keycloakService.keycloak.tokenParsed = { identity_provider };
        const next = vi.fn();

        await navigationGuard(
          authRoute({ query: { idp: 'acme-okta' } }),
          FROM,
          next,
        );

        expect(keycloakService.keycloak.login.mock.calls[0][0].prompt).toBe(
          'login',
        );
        expect(keycloakService.keycloak.login.mock.calls[0][0].idpHint).toBe(
          'acme-okta',
        );
      },
    );

    it('passes no prompt on the signed-out accepted-identifier branch', async () => {
      keycloakService.isAuthenticated.mockResolvedValue(false);
      const next = vi.fn();

      await navigationGuard(
        authRoute({ query: { idp: 'acme-okta' } }),
        FROM,
        next,
      );

      const options = keycloakService.keycloak.login.mock.calls[0][0];
      expect(options).toEqual({
        idpHint: 'acme-okta',
        redirectUri: 'https://dash.weni.ai/orgs',
      });
      expect(options).not.toHaveProperty('prompt');
    });
  });

  describe('redirect-loop prevention', () => {
    it('hands login a redirectUri free of idp while preserving origin, path, other query parameters, and the fragment', async () => {
      vi.stubGlobal(
        'location',
        new URL(
          'https://dash.weni.ai/orgs?idp=acme-okta&utm_source=email#section',
        ),
      );
      const next = vi.fn();

      await navigationGuard(
        authRoute({
          query: { idp: 'acme-okta', utm_source: 'email' },
          hash: '#section',
        }),
        FROM,
        next,
      );

      expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(1);
      expect(keycloakService.keycloak.login.mock.calls[0][0].redirectUri).toBe(
        'https://dash.weni.ai/orgs?utm_source=email#section',
      );
      expect(
        keycloakService.keycloak.login.mock.calls[0][0].redirectUri,
      ).not.toMatch(/[?&]idp=/);
    });

    it('calls login zero times on a second guard invocation on the stripped address', async () => {
      const next = vi.fn();

      await navigationGuard(
        authRoute({ query: { idp: 'acme-okta' } }),
        FROM,
        next,
      );

      expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(1);
      const redirectUri =
        keycloakService.keycloak.login.mock.calls[0][0].redirectUri;
      expect(redirectUri).not.toMatch(/[?&]idp=/);

      keycloakService.keycloak.login.mockClear();
      keycloakService.isAuthenticated.mockResolvedValue(true);
      vi.stubGlobal('location', new URL(redirectUri));
      const secondNext = vi.fn();

      await navigationGuard(authRoute({ query: {} }), FROM, secondNext);

      expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(0);
      expect(secondNext).toHaveBeenCalled();
    });
  });

  it('reuses the session when the claim equals the identifier and strips idp while preserving other query parameters', async () => {
    keycloakService.isAuthenticated.mockResolvedValue(true);
    keycloakService.keycloak.tokenParsed = {
      identity_provider: 'acme-okta',
    };
    const next = vi.fn();
    const to = authRoute({
      query: { idp: 'acme-okta', utm_source: 'email', tab: 'home' },
    });

    await navigationGuard(to, FROM, next);

    expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toEqual({
      ...to,
      query: { utm_source: 'email', tab: 'home' },
    });
    expect(next.mock.calls[0][0].query).not.toHaveProperty('idp');
  });

  it('accepts idp alongside a hostile redirect_uri sibling that never influences the Keycloak destination', async () => {
    vi.stubGlobal(
      'location',
      new URL(
        'https://dash.weni.ai/?idp=acme-okta&redirect_uri=https://evil.example.com',
      ),
    );
    const next = vi.fn();

    await navigationGuard(
      authRoute({
        path: '/',
        query: {
          idp: 'acme-okta',
          redirect_uri: 'https://evil.example.com',
        },
      }),
      FROM,
      next,
    );

    expect(isValidDirectStartIdentifier('acme-okta')).toBe(true);
    expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(1);
    const { idpHint, redirectUri } =
      keycloakService.keycloak.login.mock.calls[0][0];
    expect(idpHint).toBe('acme-okta');
    expect(redirectUri).toBe(
      'https://dash.weni.ai/?redirect_uri=https%3A%2F%2Fevil.example.com',
    );
    expect(new URL(redirectUri).origin).toBe('https://dash.weni.ai');
    expect(new URL(redirectUri).hostname).not.toBe('evil.example.com');
  });

  describe('existing guard paths', () => {
    it('still clears the #state= fragment even when a valid door B identifier is present', async () => {
      keycloakService.isAuthenticated.mockResolvedValue(true);
      keycloakService.keycloak.tokenParsed = {
        identity_provider: 'other-okta',
      };
      const next = vi.fn();
      const to = authRoute({
        query: { idp: 'acme-okta' },
        hash: '#state=oauth-callback',
      });

      await navigationGuard(to, FROM, next);

      expect(next).toHaveBeenCalledWith({ ...to, hash: '' });
      expect(keycloakService.keycloak.login).not.toHaveBeenCalled();
    });

    it('still force-remounts matching externals', async () => {
      keycloakService.isAuthenticated.mockResolvedValue(true);
      const next = vi.fn();

      await navigationGuard(
        authRoute({
          name: 'studio',
          path: '/projects/abc/studio/init',
          params: { projectUuid: 'abc', internal: 'init' },
        }),
        { ...FROM, name: 'studio' },
        next,
      );

      expect(next).toHaveBeenCalledWith({
        name: 'studio',
        params: { internal: ['init', 'force'] },
      });
    });

    it('still calls login with no arguments on an unauthenticated door A navigation', async () => {
      const next = vi.fn();

      await navigationGuard(authRoute({ query: {} }), FROM, next);

      expect(keycloakService.keycloak.login).toHaveBeenCalledTimes(1);
      expect(keycloakService.keycloak.login.mock.calls[0]).toEqual([]);
      expect(next).not.toHaveBeenCalled();
    });

    it('still short-circuits afterKeycloakInitialization on /register', async () => {
      const afterKeycloakInitialization = vi.fn();
      const next = vi.fn();

      await navigationGuard(
        {
          path: '/register',
          hash: '',
          query: { idp: 'acme-okta' },
          params: {},
          matched: [{ meta: { afterKeycloakInitialization } }],
          meta: {},
        },
        FROM,
        next,
      );

      expect(afterKeycloakInitialization).toHaveBeenCalledTimes(1);
      expect(afterKeycloakInitialization).toHaveBeenCalledWith(false, next);
      expect(keycloakService.keycloak.login).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('entry-door diagnostics', () => {
    it('tags door A as default and never records the identifier', async () => {
      await navigationGuard(authRoute({ query: {} }), FROM, vi.fn());

      expect(sentryMock.setTag).toHaveBeenCalledWith('entry_door', 'default');
      expect(sentryMock.setTag.mock.calls).toHaveLength(1);
      expect(sentryPayload()).not.toContain('acme-okta');
    });

    it('tags an accepted identifier as direct_start and never records the identifier', async () => {
      await navigationGuard(
        authRoute({ query: { idp: 'acme-okta' } }),
        FROM,
        vi.fn(),
      );

      expect(sentryMock.setTag).toHaveBeenCalledWith(
        'entry_door',
        'direct_start',
      );
      expect(sentryMock.setTag.mock.calls).toHaveLength(1);
      expect(
        sentryMock.setTag.mock.calls[0].every(
          (arg) => arg === 'entry_door' || arg === 'direct_start',
        ),
      ).toBe(true);
      expect(sentryPayload()).not.toContain('acme-okta');
    });

    it('tags a rejected identifier as direct_start_rejected and never records the identifier', async () => {
      await navigationGuard(
        authRoute({ query: { idp: 'Acme-Okta' } }),
        FROM,
        vi.fn(),
      );

      expect(sentryMock.setTag).toHaveBeenCalledWith(
        'entry_door',
        'direct_start_rejected',
      );
      expect(sentryMock.setTag.mock.calls).toHaveLength(1);
      expect(sentryPayload()).not.toContain('Acme-Okta');
      expect(keycloakService.keycloak.login.mock.calls[0]).toEqual([]);
    });

    it('tags a rejected identifier as direct_start_rejected when already authenticated', async () => {
      keycloakService.isAuthenticated.mockResolvedValue(true);
      const next = vi.fn();

      await navigationGuard(
        authRoute({ query: { idp: 'Acme-Okta' } }),
        FROM,
        next,
      );

      expect(sentryMock.setTag).toHaveBeenCalledWith(
        'entry_door',
        'direct_start_rejected',
      );
      expect(keycloakService.keycloak.login).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(sentryPayload()).not.toContain('Acme-Okta');
    });
  });

  it('calls next without login when the route does not require auth', async () => {
    const next = vi.fn();

    await navigationGuard(
      {
        name: 'privacy_policy',
        path: '/privacy-policy',
        hash: '',
        query: {},
        params: {},
        matched: [{ meta: {} }],
        meta: {},
      },
      FROM,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(keycloakService.keycloak.login).not.toHaveBeenCalled();
  });
});
