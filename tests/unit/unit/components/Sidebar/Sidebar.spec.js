import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import { PROJECT_ROLE_CHATUSER } from '@/components/users/permissionsObjects';
import { PROJECT_ROLE_MODERATOR } from '../../../../../src/components/users/permissionsObjects';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/RemoteComponents.vue', () => ({
  default: {
    name: 'RemoteComponents',
    render() {
      return null;
    },
  },
}));

vi.mock('@/store/featureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: {
      newConnectPlataform: false,
      agentsTeam: false,
    },
  }),
}));

vi.mock('@/api/agent-builder', () => ({
  read: vi.fn().mockResolvedValue({ data: { brain_on: true } }),
}));

vi.mock(import('@/api/projects.js'), () => {
  return {
    default: {
      v2List: vi.fn().mockImplementation(() => ({
        data: {
          count: 2,
          next: null,
          previous: null,
          results: [
            {
              uuid: 'project-1',
              name: 'First Project',
            },
            {
              uuid: 'project-2',
              name: 'Second Project',
            },
          ],
        },
      })),
    },
  };
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      meta: {
        forceContractedSidebar: true,
      },
    },
    {
      path: '/projects/1234/insights',
      component: { template: '<section></section>' },
    },
    {
      path: '/projects/1234/agent-builder',
      component: { template: '<section></section>' },
    },
    {
      path: '/projects/1234/bothub',
      component: { template: '<section></section>' },
    },
    {
      path: '/projects/1234/push',
      component: { template: '<section></section>' },
    },
    {
      path: '/projects/1234/studio',
      component: { template: '<section></section>' },
    },
    {
      path: '/projects/1234/chats',
      component: { template: '<section></section>' },
    },
    {
      path: '/projects/1234/integrations',
      component: { template: '<section></section>' },
    },
  ],
});

let currentProject = {
  uuid: '1234',
  authorization: {
    role: PROJECT_ROLE_CHATUSER,
  },
  flow_organization: '1',
  created_at: '2024-08-22T19:51:46.782295Z',
  project_mode: 'commerce',
};

let currentOrg = {
  uuid: '5678',
  is_suspended: false,
  authorization: { role: 1 },
};

const store = createStore({
  state() {
    return {
      Project: {
        championChatbots: {
          1: {
            error: true,
          },
          2: {
            has_flows: true,
          },
        },
      },
      Account: {
        profile: {
          email: 'test@example.com',
        },
      },
    };
  },

  getters: {
    currentProject() {
      return currentProject;
    },

    currentOrg() {
      return currentOrg;
    },
  },
});

const elements = {
  sidebarOption: { name: 'SidebarOption' },
};

const setup = ({ unreadMessages = undefined } = {}) =>
  mount(Sidebar, {
    global: {
      plugins: [store, router, UnnnicSystem],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
    props: {
      unreadMessages,
    },
  });

describe('Sidebar.vue', () => {
  let wrapper;

  describe('when the user is moderator', () => {
    beforeEach(() => {
      router.push('/');

      currentProject.authorization.role = PROJECT_ROLE_MODERATOR;

      wrapper = setup();
    });

    it('should show all the sidebar options (12)', () => {
      const sidebarOptions = wrapper.findAllComponents(elements.sidebarOption);

      expect(sidebarOptions.length).toBe(12);
    });
  });

  describe('when there is unread messages', () => {
    beforeEach(() => {
      currentProject.authorization.role = PROJECT_ROLE_CHATUSER;
      currentProject.flow_organization = '2';

      wrapper = setup({ unreadMessages: 3 });
    });

    it('should set hasNotification prop to SidebarOption', () => {
      const sidebarOptions = wrapper.findAllComponents(elements.sidebarOption);

      const props = [];

      for (let i = 0; i < sidebarOptions.length; i++) {
        props.push(sidebarOptions.at(i).props());
      }

      expect(props).toContainEqual(
        expect.objectContaining({
          option: expect.objectContaining({ hasNotification: true }),
        }),
      );
    });
  });

  describe('when project is commerce and agent builder 2 is enabled', () => {
    beforeEach(() => {
      currentProject.authorization.role = PROJECT_ROLE_MODERATOR;
      currentProject.project_mode = 'commerce';

      wrapper = setup();
    });

    it('should show default options', () => {
      const sidebarOptions = wrapper.findAllComponents(elements.sidebarOption);
      expect(sidebarOptions.length).toBe(12);
    });
  });

  describe.each([
    {
      element: '[data-test="sidebar-option-inside-Insights"]',
      expectedFullPath: '/projects/1234/insights/r/init',
    },
    {
      element: '[data-test="sidebar-option-inside-Classification and Content"]',
      expectedFullPath: '/projects/1234/bothub/r/init',
    },
    {
      element: '[data-test="sidebar-option-inside-Flows"]',
      expectedFullPath: '/projects/1234/push/r/init',
    },
    {
      element: '[data-test="sidebar-option-inside-Studio"]',
      expectedFullPath: '/projects/1234/studio/r/init',
    },
    {
      element: '[data-test="sidebar-option-inside-Chats"]',
      expectedFullPath: '/projects/1234/chats/r/init',
    },
    {
      element: '[data-test="sidebar-option-inside-Applications"]',
      expectedFullPath: '/projects/1234/integrations/r/init',
    },
  ])('when the user clicks on $element', ({ element, expectedFullPath }) => {
    beforeEach(async () => {
      currentProject.authorization.role = PROJECT_ROLE_MODERATOR;

      wrapper = setup();
      router.push('/');

      await router.isReady();

      wrapper.find(element).trigger('click');

      await flushPromises();
    });

    it(`should redirect to ${expectedFullPath}`, async () => {
      expect(router.currentRoute.value.fullPath).toBe(expectedFullPath);
    });
  });
});
