import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import i18n from '@/utils/plugins/i18n';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

jest.mock('@/api/request.js', () => {});

describe('orgList.vue', () => {
  let wrapper;
  let store;
  let actions;

  beforeEach(() => {
    actions = {
      getOrgs: jest.fn(),
      deleteOrg: jest.fn(),
      setCurrentOrg: jest.fn(),
      clearCurrentOrg: jest.fn(),
      clearCurrentProject: jest.fn(),
      openModal: jest.fn(),
    };

    store = new Vuex.Store({
      actions,
    });

    wrapper = shallowMount(OrgList, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        OrgListItem: true,
        NewInfiniteLoading: true,
        UnnnicSkeletonLoading: true,
        RightSideBar: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('onNavigateToBilling', () => {
    const spySelectOrg = jest.spyOn(wrapper.vm, 'selectOrg');
    const spyRouter = jest.spyOn(wrapper.vm.$router, 'push');

    wrapper.vm.onNavigateToBilling({ uuid: 12 });

    expect(spySelectOrg).toHaveBeenCalledTimes(1);
    expect(spyRouter).toHaveBeenCalledTimes(1);
  });
});
