import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import ProjectList from '@/components/projects/ProjectList.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../../__mocks__/';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('ProjectList.vue', () => {
  let getters;
  let actions;
  let store;
  let wrapper;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return org;
      },
    };
    actions = {
      setCurrentProject: jest.fn(),
      createProject: jest.fn(),
    };

    store = new Vuex.Store({
      getters,
      actions,
    });

    wrapper = shallowMount(ProjectList, {
      localVue,
      i18n,
      store,
      router,
      propsData: {
        org: 'ORG UUID',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        UnnnicIconSvg: true,
        ProjectListItem: true,
        InfiniteLoading: true,
        UnnnicSkeletonLoading: true,
      },
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
