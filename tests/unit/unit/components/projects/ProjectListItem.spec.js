import { vi } from 'vitest';
import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import ProjectListItem from '@/components/projects/ProjectListItem.vue';
import i18n from '@/utils/plugins/i18n';
import { project, authorizations } from '../../../__mocks__/index';

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
      setCurrentProject: vi.fn(),
      createProject: vi.fn(),
      createOrUpdateProjectAuthorization: vi.fn(),
    };

    store = new Vuex.Store({
      getters,
      actions,
      modules: {
        Account: {
          state: {
            profile: {
              username: 'test',
            },
          },
        },
      },
    });

    wrapper = shallowMount(ProjectListItem, {
      localVue,
      i18n,
      store,
      router,
      props: {
        project,
        name: 'name',
        time: 'time',
        owner: 'pwmer',
        aiCount: 12,
        contactCount: 12,
        flowsCount: 12,
        authorizations,
        pendingAuthorizations: {
          count: 0,
          users: [],
        },
      },
      stubs: {
        RouterLink: RouterLinkStub,
        UnnnicIconSvg: true,
        ProjectListItem: true,
        InfiniteLoading: true,
        UnnnicCardProject: true,
        UnnnicButton: true,
        UnnnicMultiSelect: true,
        UnnnicDropdown: true,
        UnnnicInput: true,
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
    expect(wrapper.element).toMatchSnapshot();
  });

  it('test onclick', async () => {
    await wrapper.vm.onClick('route');
    expect(wrapper.emitted().click).toBeTruthy();
  });

  it('test computed statuList', async () => {
    await wrapper.setData({
      aiCount: 12,
      flowsCount: 12,
      contactCount: 12,
    });

    expect(wrapper.vm.statusList).toEqual([
      {
        title: 'some specific text',
        icon: 'neurology',
        scheme: 'aux-blue',
        count: 12,
      },
      {
        title: 'some specific text',
        icon: 'account_tree',
        scheme: 'aux-purple',
        count: 12,
      },
      {
        title: 'some specific text',
        icon: 'person',
        scheme: 'aux-lemon',
        count: 12,
      },
    ]);
  });

  it('test if you can change members', () => {
    expect(wrapper.vm.canManageMembers).toBeTruthy();
  });
});
