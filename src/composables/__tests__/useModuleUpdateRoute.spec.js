import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import {
  normalizeModuleInternalPath,
  useModuleUpdateRoute,
} from '../useModuleUpdateRoute';

describe('normalizeModuleInternalPath', () => {
  it('returns absolute path for deep links', () => {
    expect(normalizeModuleInternalPath(['apps', 'my'])).toBe('/apps/my');
    expect(normalizeModuleInternalPath('apps/my')).toBe('/apps/my');
  });

  it('returns undefined for init and force-reload paths', () => {
    expect(normalizeModuleInternalPath(['init'])).toBeUndefined();
    expect(normalizeModuleInternalPath('init')).toBeUndefined();
    expect(normalizeModuleInternalPath(['init', 'force'])).toBeUndefined();
    expect(normalizeModuleInternalPath(['r', 'init'])).toBeUndefined();
    expect(normalizeModuleInternalPath('r/init')).toBeUndefined();
  });

  it('preserves absolute paths', () => {
    expect(normalizeModuleInternalPath('/apps/discovery')).toBe(
      '/apps/discovery',
    );
  });
});

describe('useModuleUpdateRoute', () => {
  let router;
  let TestComponent;

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/projects/:projectUuid/settings/channels/:internal+',
          name: 'settingsChannels',
          component: { template: '<div />' },
        },
      ],
    });

    TestComponent = {
      template: '<div />',
      setup() {
        const { getInitialModuleRoute } = useModuleUpdateRoute('settingsChannels');
        return { getInitialModuleRoute };
      },
    };

    await router.push({
      name: 'settingsChannels',
      params: {
        projectUuid: 'test-uuid',
        internal: ['apps', 'my'],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getInitialModuleRoute returns absolute path for deep links', async () => {
    const wrapper = mount(TestComponent, {
      global: { plugins: [router] },
    });

    expect(wrapper.vm.getInitialModuleRoute()).toEqual({
      path: '/apps/my',
      query: {},
    });
  });

  it('getInitialModuleRoute returns undefined for init paths', async () => {
    await router.push({
      name: 'settingsChannels',
      params: {
        projectUuid: 'test-uuid',
        internal: ['init'],
      },
    });

    const wrapper = mount(TestComponent, {
      global: { plugins: [router] },
    });

    expect(wrapper.vm.getInitialModuleRoute()).toBeUndefined();
  });

  it('handleUpdateRoute skips replace when URL already matches', async () => {
    const replaceSpy = vi.spyOn(router, 'replace');

    mount(TestComponent, {
      global: { plugins: [router] },
    });

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: 'settingsChannels/apps/my',
          query: {},
        },
      }),
    );

    await flushPromises();

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('handleUpdateRoute updates host route when module path changes', async () => {
    mount(TestComponent, {
      global: { plugins: [router] },
    });

    window.dispatchEvent(
      new CustomEvent('updateRoute', {
        detail: {
          path: 'settingsChannels/apps/discovery',
          query: { filter: 'active' },
        },
      }),
    );

    await flushPromises();

    expect(router.currentRoute.value.params.internal).toEqual([
      'apps',
      'discovery',
    ]);
    expect(router.currentRoute.value.query).toEqual({ filter: 'active' });
  });
});
