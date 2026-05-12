import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemIntegrations from '../SystemIntegrations.vue';
import FederatedModule from '../modules/FederatedModule.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '../../store/Shared';

const {
  mockRouterAfterEach,
  mockRouterUnsubscribe,
  mockMountIntegrationsApp,
} = vi.hoisted(() => {
  const mockRouterAfterEach = vi.fn();
  const mockRouterUnsubscribe = vi.fn();

  const mockMountIntegrationsApp = vi.fn().mockResolvedValue({
    app: {
      unmount: vi.fn(),
    },
    router: {
      afterEach: mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe),
      replace: vi.fn(),
    },
  });

  return {
    mockRouterAfterEach,
    mockRouterUnsubscribe,
    mockMountIntegrationsApp,
  };
});

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountIntegrationsApp),
}));

vi.mock('@/store/Shared', () => ({
  useSharedStore: vi.fn().mockReturnValue({
    current: {
      project: { uuid: 'test-uuid' },
    },
    auth: {
      token: 'mock-token',
    },
    setIsActiveFederatedModule: vi.fn(),
  }),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:projectUuid/settings/channels/:internal+',
      name: 'settingsChannels',
    },
  ],
});

describe('SystemIntegrations', () => {
  let wrapper;
  let sharedStore;

  const getFm = () => wrapper.findComponent(FederatedModule);

  const createWrapper = (storeOverrides = {}) => {
    const defaultStore = {
      current: {
        project: { uuid: 'test-uuid' },
      },
      auth: {
        token: 'mock-token',
      },
      setIsActiveFederatedModule: vi.fn(),
    };

    useSharedStore.mockReturnValue({
      ...defaultStore,
      ...storeOverrides,
    });

    return shallowMount(SystemIntegrations, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          FederatedModule: false,
          ExternalSystem: {
            name: 'ExternalSystem',
            template: '<div class="external-system"></div>',
            methods: {
              init: vi.fn(),
              reset: vi.fn(),
            },
          },
        },
      },
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe);

    wrapper = createWrapper();

    await router.push({
      name: 'settingsChannels',
      params: { projectUuid: 'test-uuid', internal: ['init'] },
    });

    sharedStore = useSharedStore();
    sharedStore.auth.token = 'mock-token';
    sharedStore.current.project.uuid = 'test-uuid';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders loading state when integrations app is not mounted', async () => {
    getFm().vm.app = null;
    getFm().vm.useIframe = false;

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .findComponent('[data-testid="settingsChannels-loading"]')
        .exists(),
    ).toBe(true);
  });

  it('mounts integrations app when modelValue is true', async () => {
    getFm().vm.app = null;
    getFm().vm.useIframe = false;

    await getFm().vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockMountIntegrationsApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="settingsChannels-app"]').exists()).toBe(
      true,
    );
  });

  it('falls back to iframe when module federation fails', async () => {
    getFm().vm.app = null;
    getFm().vm.useIframe = true;

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .findComponent('[data-testid="settingsChannels-iframe"]')
        .exists(),
    ).toBe(true);
  });

  it('sets integrations app to null when component is unmounted', async () => {
    await getFm().vm.mount();
    await wrapper.vm.$nextTick();

    expect(getFm().vm.app).not.toBe(null);

    await getFm().vm.unmount();
    await wrapper.vm.$nextTick();

    expect(getFm().vm.app).toBe(null);
  });

  it('does not render when token is missing', async () => {
    wrapper.unmount();

    wrapper = createWrapper({
      auth: {
        token: null,
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="settingsChannels-app"]').exists()).toBe(
      false,
    );
    expect(
      wrapper.find('[data-testid="settingsChannels-iframe"]').exists(),
    ).toBe(false);
  });

  it('does not render when current project is missing', async () => {
    wrapper.unmount();

    wrapper = createWrapper({
      current: {
        project: { uuid: null },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="settingsChannels-app"]').exists()).toBe(
      false,
    );
    expect(
      wrapper.find('[data-testid="settingsChannels-iframe"]').exists(),
    ).toBe(false);
  });

  it('sets up router sync when mounting integrations app', async () => {
    await getFm().vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockRouterAfterEach).toHaveBeenCalled();
    expect(getFm().vm.routerUnsubscribe).toBe(mockRouterUnsubscribe);
  });

  it('dispatches updateRoute event when module router changes', async () => {
    await getFm().vm.mount();
    await wrapper.vm.$nextTick();

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const afterEachCallback = mockRouterAfterEach.mock.calls[0][0];

    afterEachCallback({
      path: '/discovery',
      query: { filter: 'value1' },
      fullPath: '/discovery?filter=value1',
    });

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'updateRoute',
        detail: {
          path: 'settingsChannels/discovery',
          query: { filter: 'value1' },
        },
      }),
    );

    dispatchEventSpy.mockRestore();
  });

  it('cleans up router subscription on unmount', async () => {
    await getFm().vm.mount();
    await wrapper.vm.$nextTick();

    expect(getFm().vm.routerUnsubscribe).toBe(mockRouterUnsubscribe);

    await getFm().vm.unmount();

    expect(mockRouterUnsubscribe).toHaveBeenCalled();
    expect(getFm().vm.routerUnsubscribe).toBe(null);
    expect(getFm().vm.moduleRouter).toBe(null);
  });

  it('unmounts when project uuid changes', async () => {
    await getFm().vm.mount();
    await wrapper.vm.$nextTick();

    expect(getFm().vm.app).not.toBe(null);

    wrapper.unmount();
    wrapper = createWrapper({
      current: {
        project: { uuid: 'new-uuid' },
      },
    });

    await wrapper.vm.$nextTick();

    expect(getFm().vm.app).toBe(null);
  });
});
