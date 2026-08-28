import { shallowMount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemChats from '../SystemChats.vue';
import ChatsFederatedModule from '../modules/ChatsFederatedModule.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '../../store/Shared';
import { tryImportWithRetries } from '@/utils/moduleFederation';

const { mockRouterAfterEach, mockRouterUnsubscribe, mockMountChatsApp } =
  vi.hoisted(() => {
    const mockRouterAfterEach = vi.fn();
    const mockRouterUnsubscribe = vi.fn();

    const mockMountChatsApp = vi.fn().mockResolvedValue({
      app: {
        unmount: vi.fn(),
      },
      router: {
        afterEach: mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe),
        replace: vi.fn(),
        resolve: vi.fn((target) => ({
          fullPath: target?.path || '/',
          name: target?.name || 'home',
          params: target?.params || {},
          query: target?.query || {},
        })),
        currentRoute: { value: { fullPath: '/', name: 'home', params: {}, query: {} } },
      },
    });

    return {
      mockRouterAfterEach,
      mockRouterUnsubscribe,
      mockMountChatsApp,
    };
  });

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountChatsApp),
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
      path: '/:projectUuid/chats/:internal+',
      name: 'chats',
    },
  ],
});

describe('SystemChats', () => {
  let wrapper;

  const getFm = () => wrapper.findComponent(ChatsFederatedModule);

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

    return shallowMount(SystemChats, {
      props: {
        modelValue: true,
        routeNames: ['chats'],
        containerId: 'chats-app',
      },
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          ChatsFederatedModule: false,
        },
      },
      attachTo: document.body,
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRouterAfterEach.mockReturnValue(mockRouterUnsubscribe);
    vi.mocked(tryImportWithRetries).mockResolvedValue(mockMountChatsApp);

    wrapper = createWrapper();

    await router.push({
      name: 'chats',
      params: { projectUuid: 'test-uuid', internal: ['init'] },
    });
    await flushPromises();
  });

  afterEach(() => {
    wrapper?.unmount();
    document.getElementById('chats-app')?.remove();
  });

  it('mounts chats app when modelValue is true', async () => {
    await getFm().vm.mount();
    await flushPromises();

    expect(mockMountChatsApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="chats-app"]').exists()).toBe(true);
  });

  it('does not render iframe when module federation fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.mocked(tryImportWithRetries).mockResolvedValue(null);

    await getFm().vm.unmount();
    await getFm().vm.mount();
    await flushPromises();

    expect(wrapper.find('[data-testid="chats-iframe"]').exists()).toBe(false);
    expect(getFm().vm.useIframe).toBe(false);
    expect(getFm().vm.app).toBe(null);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to mount chats app');

    consoleErrorSpy.mockRestore();
  });
});
