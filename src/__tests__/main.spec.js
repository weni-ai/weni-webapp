import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CHATS_ORIGIN = 'https://chats.example.com';
const APP_ORIGIN = 'http://localhost:3000';

const { mockGetEnv, mockInitializeGrowthBook, mockCreateApp } = vi.hoisted(
  () => ({
    mockGetEnv: vi.fn((name) => {
      if (name === 'MODULES_YAML') {
        return { chats: `${CHATS_ORIGIN}/` };
      }
      return '';
    }),
    mockInitializeGrowthBook: vi.fn(() => Promise.resolve()),
    mockCreateApp: vi.fn(() => ({
      use: vi.fn(),
      mixin: vi.fn(),
      provide: vi.fn(),
      mount: vi.fn(),
    })),
  }),
);

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createApp: mockCreateApp,
  };
});

vi.mock('@sentry/browser', () => ({
  init: vi.fn(),
}));

vi.mock('@sentry/integrations', () => ({
  Vue: vi.fn(),
}));

vi.mock('@/app.vue', () => ({ default: { name: 'App' } }));
vi.mock('@/router', () => ({ default: {} }));
vi.mock('@/utils/plugins/i18n', () => ({ default: {} }));
vi.mock('vue-debounce', () => ({ default: {} }));
vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({})),
}));
vi.mock('@/store/theme', () => ({ useThemeStore: vi.fn() }));
vi.mock('@/store/org', () => ({ useOrgStore: vi.fn() }));
vi.mock('@/store/project', () => ({ useProjectStore: vi.fn() }));
vi.mock('@/services/Keycloak', () => ({
  default: { plugin: {} },
}));
vi.mock('@/utils/plugins/UnnnicSystem', () => ({ default: {} }));
vi.mock('@/utils/env', () => ({ default: mockGetEnv }));
vi.mock('@/utils/growthbook', () => ({
  gbKey: Symbol('gb'),
  gbInstance: {},
  initializeGrowthBook: mockInitializeGrowthBook,
}));
vi.mock('@weni/unnnic-system/dist/style.css', () => ({}));

describe('main.js mobile pre-redirect', () => {
  let assignedHref;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetModules();
    assignedHref = undefined;

    window.ontouchstart = () => {};
    Object.defineProperty(window, 'screen', {
      configurable: true,
      value: { width: 375 },
    });
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    });

    const mockLocation = {
      href: `${APP_ORIGIN}/orgs?idp=acme-okta&utm_source=email`,
      origin: APP_ORIGIN,
    };

    Object.defineProperty(window, 'location', {
      configurable: true,
      get() {
        return assignedHref === undefined ? mockLocation : assignedHref;
      },
      set(value) {
        assignedHref = value;
      },
    });
  });

  afterEach(() => {
    delete window.ontouchstart;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('still hard-navigates to chats and strips idp from the packaged redirect', async () => {
    await import('@/main.js');

    expect(assignedHref).toBeDefined();
    const destination = new URL(assignedHref);
    expect(destination.origin).toBe(CHATS_ORIGIN);

    const redirect = destination.searchParams.get('redirect');
    expect(redirect).toBeTruthy();
    expect(redirect).not.toMatch(/(^|[?&])idp=/);
    expect(redirect).not.toContain('acme-okta');
    expect(redirect).toContain('orgs');
    expect(redirect).toContain('utm_source=email');
  });
});
