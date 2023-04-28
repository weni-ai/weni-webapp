import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Settings from '@/views/settings.vue';
import { PROJECT_ROLE_CHATUSER } from '@/components/users/permissionsObjects';

window.configs = {
  MODULE_CHATS: 'https://chats',
};

const localVue = createLocalVue();

localVue.use(Vuex);

const externalSystem = {
  props: {
    routes: Array,
  },
  render(h) {
    return h('span');
  },
  methods: {
    init() {
      return this.routes;
    },

    reset() {},
  },
};

const spyExternalSystemInit = jest.spyOn(externalSystem.methods, 'init');
const spyExternalSystemReset = jest.spyOn(externalSystem.methods, 'reset');

const $route = {
  name: 'settingsProject',
  fullPath: 'project',
  params: {
    projectUuid: '1',
  },
};

const wrapper = shallowMount(Settings, {
  store: new Vuex.Store({
    state: {
      currentProject: {
        menu: { chat: [] },
        authorization: { role: 1 },
      },
    },
    getters: {
      currentProject: (state) => state.currentProject,
    },
    mutations: {
      setCurrentProject(state, value) {
        state.currentProject = value;
      },
    },
  }),

  localVue,

  mocks: {
    $route,
    $router: {
      replace(href) {
        wrapper.vm.$route.name = href.name;
      },
    },
    $t: () => 'text',
  },

  stubs: {
    'unnnic-card': true,
    'external-system': externalSystem,
  },
});

describe('settings.vue', () => {
  it('it should call the project external system init method', async () => {
    $route.name = 'settingsProject';
    $route.fullPath = 'project';

    await wrapper.vm.$nextTick();

    expect(spyExternalSystemInit).lastReturnedWith(['settingsProject']);
  });

  it('it should call the chats external system init method', async () => {
    $route.name = 'settingsChats';
    $route.fullPath = 'chats';

    await wrapper.vm.$nextTick();

    expect(spyExternalSystemInit).lastReturnedWith(['settingsChats']);
  });

  it('it should not call system external reset method due projectUuid is not defined', async () => {
    wrapper.vm.$route.params.projectUuid = '';

    await wrapper.vm.$nextTick();

    expect(spyExternalSystemReset).toHaveBeenCalledTimes(0);
  });

  it('it should call system external reset method two times, project and chats modules, due projectUuid is defined', async () => {
    wrapper.vm.$route.params.projectUuid = '2';

    await wrapper.vm.$nextTick();

    expect(spyExternalSystemReset).toHaveBeenCalledTimes(2);
  });

  it('it should redirect user to the first valid tab if they try to enter in a non existent page', async () => {
    wrapper.vm.$route.name = 'NonExistentPage';

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$route.name).toBe(wrapper.vm.pages[0].href.name);
  });

  it('it should hide modules but chats if user authorization role is chat user', async () => {
    wrapper.vm.$store.commit('setCurrentProject', {
      menu: { chat: [] },
      authorization: {
        role: PROJECT_ROLE_CHATUSER,
      },
    });

    expect(wrapper.vm.hideModulesButChats).toBeTruthy();
  });
});
