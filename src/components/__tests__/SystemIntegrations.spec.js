import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemIntegrations from '../SystemIntegrations.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '@/store/Shared';

const mockMountIntegrationsApp = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    unmount: vi.fn(),
  }),
);

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountIntegrationsApp),
}));

const sharedStoreMock = vi.hoisted(() => {
  const { reactive } = require('vue');
  return reactive({
    current: {
      project: { uuid: 'test-uuid' },
    },
    auth: {
      token: 'mock-token',
    },
  });
});

vi.mock('@/store/Shared', () => ({
  useSharedStore: vi.fn().mockReturnValue(sharedStoreMock),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:projectUuid/integrations',
      name: 'integrations',
    },
  ],
});

describe('SystemIntegrations', () => {
  let wrapper;
  let sharedStore;

  beforeEach(async () => {
    wrapper = shallowMount(SystemIntegrations, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia(), router],
      },
    });

    await router.push({
      name: 'integrations',
      params: { projectUuid: 'test-uuid' },
    });

    sharedStore = useSharedStore();
    sharedStore.auth.token = 'mock-token';
    sharedStore.current.project.uuid = 'test-uuid';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders loading state when integrations app is not mounted', async () => {
    wrapper.vm.integrationsApp = null;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.findComponent('[data-testid="integrations-loading"]').exists(),
    ).toBe(true);
  });

  it('mounts integrations app when modelValue is true', async () => {
    wrapper.vm.integrationsApp = null;

    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockMountIntegrationsApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="integrations-app"]').exists()).toBe(true);
  });

  it('falls back to iframe when feature flag is disabled', async () => {
    wrapper.vm.integrationsApp = null;
    wrapper.vm.useIframe = true;

    await wrapper.vm.$nextTick();
    expect(
      wrapper.findComponent('[data-testid="integrations-iframe"]').exists(),
    ).toBe(true);
  });

  it('sets integrations app to null when component is unmounted', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.integrationsApp).not.toBe(null);
    await wrapper.vm.unmount();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.integrationsApp).toBe(null);
  });

  it('does not render when token is missing', async () => {
    sharedStore.auth.token = null;

    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="integrations-app"]').exists()).toBe(
      false,
    );
  });

  it('does not render when current project is missing', async () => {
    sharedStore.current.project.uuid = null;

    await wrapper.vm.mount();

    expect(wrapper.find('[data-testid="integrations-app"]').exists()).toBe(
      false,
    );
  });
});
