import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import ProjectListItem from '@/components/projects/ProjectListItem.vue';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('ProjectListItem.vue', () => {
  let getters;
  let actions;
  let store;
  let wrapper;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return {
          name: 'oi',
          uuid: '12',
          inteligence_organization: 'topp',
          authorization: 'true',
        };
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

    wrapper = shallowMount(ProjectListItem, {
      localVue,
      i18n,
      store,
      router,
      propsData: {
        name: 'name',
        time: 'time',
        owner: 'pwmer',
        aiCount: 12,
        contactCount: 12,
        flowsCount: 12,
      },
      stubs: {
        RouterLink: RouterLinkStub,
        UnnnicIconSvg: true,
        ProjectListItem: true,
        InfiniteLoading: true,
        UnnnicDropdown: true,
        UnnnicDropdownItem: true,
        UnnnicToolTip: true,
        UnnnicTag: true,
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
