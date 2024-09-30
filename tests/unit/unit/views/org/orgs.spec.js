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
    state = {
      Org: {
        orgs: { data: [org] },
      },
    };

    actions = {
      clearCurrentOrg: vi.fn(),
      clearCurrentProject: vi.fn(),
    };

    store = createStore({
      state,
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
    it('Should set error true', () => {
      wrapper.vm.organizationsStatus = 'error';
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.error).toBe(true);
      });
    });

    it('Should test loaded status for error', () => {
      wrapper.vm.organizationsStatus = 'loaded';
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.error).toBe(false);
      });
    });

    it('Should test empty status for error', () => {
      wrapper.vm.organizationsStatus = 'empty';
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.error).toBe(false);
      });
    });
  });
});
