import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createStore } from 'vuex';

import ProjectListItem from '@/components/projects/ProjectListItem.vue';
import { PROJECT_COMMERCE } from '@/utils/constants';

import { project, authorizations } from '../../../__mocks__/index';

vi.mock('@/store/featureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: {
      newConnectPlataform: false,
      agentsTeam: false
    },
    instance: {
      context: {}
    },
    isWeniProjectOn: vi.fn().mockReturnValue(false)
  })
}));

vi.mock('@/api/brain', () => ({
  customization: {
    get: vi.fn().mockResolvedValue({ data: { team: { human_support: true } } })
  }
}));

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

    store = createStore({
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
      global: {
        plugins: [store],
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
      },
      props: {
        project: {
          ...project,
          project_mode: PROJECT_COMMERCE
        },
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
        title: 'Intelligences',
        icon: 'neurology',
        scheme: 'aux-blue',
        count: 12,
      },
      {
        title: 'Flows',
        icon: 'account_tree',
        scheme: 'aux-purple',
        count: 12,
      },
      {
        title: 'Contacts',
        icon: 'person',
        scheme: 'aux-lemon',
        count: 12,
      },
    ]);
  });

  it('test if you can change members', () => {
    expect(wrapper.vm.canManageMembers).toBeTruthy();
  });

  describe('isEnabledSettings', () => {
    it('should return true when neither feature is enabled', async () => {
      await wrapper.setData({
        isOrgEnabledAgentBuilder2: false,
        isProjectEnabledAgentBuilder2: false
      });

      expect(wrapper.vm.isEnabledSettings).toBe(true);
    });

    it('should return false when all disabling conditions are met', async () => {
      await wrapper.setData({
        isOrgEnabledAgentBuilder2: true,
        isProjectEnabledAgentBuilder2: true,
        isEnabledUserNewPlatform: true,
        isAgentBuilder2: true,
        isHumanServiceEnabled: false
      });

      expect(wrapper.vm.isEnabledSettings).toBe(false);
    });

    it('should return true when human service is enabled', async () => {
      await wrapper.setData({
        isOrgEnabledAgentBuilder2: true,
        isProjectEnabledAgentBuilder2: true,
        isEnabledUserNewPlatform: true,
        isAgentBuilder2: true,
        isHumanServiceEnabled: true
      });

      expect(wrapper.vm.isEnabledSettings).toBe(true);
    });
  });
});
