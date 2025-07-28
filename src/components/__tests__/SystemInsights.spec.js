import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemInsights from '../SystemInsights.vue';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSharedStore } from '../../store/Shared';

const mockMountInsightsApp = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    unmount: vi.fn(),
  }),
);

vi.mock('@/utils/moduleFederation', () => ({
  tryImportWithRetries: vi.fn().mockResolvedValue(mockMountInsightsApp),
}));

vi.mock('@/store/Shared', () => ({
  useSharedStore: vi.fn().mockReturnValue({
    current: {
      project: { uuid: 'test-uuid' },
    },
    auth: {
      token: 'mock-token',
    },
  }),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:projectUuid/insights',
      name: 'insights',
    },
  ],
});

describe('SystemInsights', () => {
  let wrapper;
  let sharedStore;
  let featureFlagsStore;

  beforeEach(async () => {
    wrapper = shallowMount(SystemInsights, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
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

    await router.push({
      name: 'insights',
      params: { projectUuid: 'test-uuid' },
    });

    featureFlagsStore = useFeatureFlagsStore();
    featureFlagsStore.flags = {
      insightsMF: true,
    };

    sharedStore = useSharedStore();
    sharedStore.auth.token = 'mock-token';
    sharedStore.current.project.uuid = 'test-uuid';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders loading state when insights app is not mounted', async () => {
    wrapper.vm.insightsApp = null;
    wrapper.vm.useIframe = false;

    await wrapper.vm.$nextTick();

    expect(
      wrapper.findComponent('[data-testid="insights-loading"]').exists(),
    ).toBe(true);
  });

  it('mounts insights app when modelValue is true and feature flag is enabled', async () => {
    wrapper.vm.insightsApp = null;
    wrapper.vm.useIframe = false;

    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(mockMountInsightsApp).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="insights-app"]').exists()).toBe(true);
  });

  it('falls back to iframe when feature flag is disabled', async () => {
    wrapper.vm.insightsApp = null;
    wrapper.vm.useIframe = true;

    await wrapper.vm.$nextTick();
    expect(
      wrapper.findComponent('[data-testid="insights-iframe"]').exists(),
    ).toBe(true);
  });

  it('sets insights app to null when component is unmounted', async () => {
    await wrapper.vm.mount();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.insightsApp).not.toBe(null);
    await wrapper.vm.unmount();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.insightsApp).toBe(null);
  });

  it('does not render when token is missing', async () => {
    sharedStore.auth.token = null;

    await wrapper.vm.mount();

    expect(wrapper.find('[data-testid="insights-app"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="insights-iframe"]').exists()).toBe(
      false,
    );
  });

  it('does not render when current project is missing', async () => {
    sharedStore.current.project.uuid = null;

    await wrapper.vm.mount();

    expect(wrapper.find('[data-testid="insights-app"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="insights-iframe"]').exists()).toBe(
      false,
    );
  });
});
