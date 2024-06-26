import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import Projects from '@/views/org/orgs.vue';
import i18n from '@/utils/plugins/i18n';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

jest.mock('@/api/request.js', () => {});

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
      clearCurrentOrg: jest.fn(),
      clearCurrentProject: jest.fn(),
    };

    store = new Vuex.Store({
      state,
      actions,
    });

    wrapper = shallowMount(Projects, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        OrgList,
        SkeletonLoading: true,
        UnnnicButton: true,
        UnnnicIconSvg: true,
        UnnnicInput: true,
        UnnnicSkeletonLoading: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  // SHOULD WE TEST IT AFTER.
  // describe('tryAgain()', () => {
  //   it('should call the function tryAgain', () => {
  //     const spy = jest.spyOn(wrapper.vm.$refs.orgList, 'reloadOrganizations');
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
