import { createLocalVue, mount } from '@vue/test-utils';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import { PROJECT_ROLE_CHATUSER } from '@/components/users/permissionsObjects';
import { PROJECT_ROLE_MODERATOR } from '../../../../../src/components/users/permissionsObjects';

const localVue = createLocalVue();

localVue.use(UnnnicSystem);
localVue.use(VueRouter);
localVue.use(Vuex);

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

const router = new VueRouter({
  routes: [
    {
      path: '/',
      meta: {
        forceContractedSidebar: true,
      },
    },
  ],
});

let currentProject = {
  uuid: '1234',
  authorization: {
    role: PROJECT_ROLE_CHATUSER,
  },
  flow_organization: '1',
};

let currentOrg = {
  uuid: '5678',
};

const store = new Vuex.Store({
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
    localVue,
    router,
    store,

    propsData: {
      unreadMessages,
    },

    mocks: {
      $t: (key) => key,
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
});
