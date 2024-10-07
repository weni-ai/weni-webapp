import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createStore } from 'vuex';
import Projects from '@/views/org/orgs.vue';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';

vi.mock('@/api/request.js', () => {});

describe('orgs.vue', () => {
  let wrapper;
  let state;
  let store;
  let actions;

  beforeEach(() => {
    const mutations = {
      setOrgStatus(state, status) {
        state.Org.orgs.status = status;
      },
    };

    state = {
      Org: {
        orgs: { data: [org], status: 'complete' },
      },
    };

    actions = {
      clearCurrentOrg: vi.fn(),
      clearCurrentProject: vi.fn(),
    };

    store = createStore({
      state,
      mutations,
      actions,
    });

    wrapper = shallowMount(Projects, {
      global: {
        plugins: [store],
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

  // SHOULD WE TEST IT AFTER.
  // describe('tryAgain()', () => {
  //   it('should call the function tryAgain', () => {
  //     const spy = vi.spyOn(wrapper.vm.$refs.orgList, 'reloadOrganizations');
  //     expect(spy).not.toHaveBeenCalled();
  //     wrapper.vm.tryAgain();
  //     expect(spy).toHaveBeenCalledTimes(1);
  //   });
  // });

  describe('organizationsStatus() watcher', () => {
    it('Should set error true', async () => {
      store.commit('setOrgStatus', 'error');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe(true);
    });

    it('Should test loaded status for error', async () => {
      store.commit('setOrgStatus', 'loaded');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe(false);
    });

    it('Should test empty status for error', async () => {
      store.commit('setOrgStatus', 'empty');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.error).toBe(false);
    });
  });
});
