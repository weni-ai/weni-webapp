import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Projects from '@/views/org/orgs.vue';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';
import profile from '../../../__mocks__/profile';
import { useOrgStore } from '@/store/org';

vi.mock('@/api/request.js', () => ({}));

describe('orgs.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Projects, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              account: {
                profile,
              },
              Org: {
                orgs: { data: [org], status: 'complete' },
              },
            },
          }),
        ],
        stubs: {
          RouterLink: RouterLinkStub,
          OrgList,
          SkeletonLoading: true,
          UnnnicButton: true,
          UnnnicIconSvg: true,
          UnnnicInput: true,
          UnnnicSkeletonLoading: true,
        },
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('organizationsStatus() watcher', () => {
    it('Should set error true', async () => {
      useOrgStore().orgs.status = 'error';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe(true);
    });

    it('Should test loaded status for error', async () => {
      useOrgStore().orgs.status = 'loaded';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe(false);
    });

    it('Should test empty status for error', async () => {
      useOrgStore().orgs.status = 'empty';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe(false);
    });
  });
});
