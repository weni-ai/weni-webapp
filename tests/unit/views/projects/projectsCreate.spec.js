import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import ProjectCreate from '@/views/projects/ProjectCreate.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../../__mocks__/';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('ProjectCreate.vue', () => {
  let getters;
  let state;
  let actions;
  let store;
  let wrapper;

  beforeEach(() => {
    state = {
      Project: {
        loadingCreateProject: false,
      },
    };
    getters = {
      currentOrg: jest.fn(() => org),
    };
    actions = {
      setCurrentProject: jest.fn(),
      createProject: jest.fn(),
      createProjectForOrg: jest.fn(),
    };

    store = new Vuex.Store({
      getters,
      actions,
      state,
    });

    wrapper = shallowMount(ProjectCreate, {
      localVue,
      i18n,
      store,
      router,
      stubs: {
        RouterLink: RouterLinkStub,
        UnnnicInput: true,
        UnnnicSelect: true,
        UnnnicButton: true,
        Container: true,
      },
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('sets the correct default data', () => {
    expect(typeof ProjectCreate.data).toBe('function');
    const defaultData = ProjectCreate.data();
    expect(defaultData.projectName).toBe(null);
    expect(defaultData.dateFormat).toBe('D');
    expect(defaultData.timeZone).toBe('America/Argentina/Buenos_Aires');
    expect(defaultData.loading).toBe(false);
    expect(defaultData.project).toBe(null);
  });

  it('should change route in onBack()', () => {
    const spy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.vm.onBack();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      name: 'projects',
      params: { orgUuid: getters.currentOrg().uuid },
    });
  });

  it('should be able to test onAccess function', async () => {
    wrapper.setData({
      project: {
        uuid: 'uuid',
        organization: {
          uuid: getters.currentOrg.uuid,
        },
        name: 'project name',
        flow_organization: {
          uuid: 'flow org uuid',
        },
        menu: 'project menu',
      },
    });

    expect(wrapper.vm.project).toBeDefined();

    const spy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.vm.onAccess('uuid');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      name: 'home',
      params: { projectUuid: 'uuid' },
    });

    expect(wrapper.vm.$router.history.current.path).toBe('/');
  });

  describe('canProgress()', () => {
    it('verify when not have project name and date format', () => {
      const response = wrapper.vm.canProgress;
      expect(response).toBe(false);
    });

    it('verify when have project name and date format', async () => {
      await wrapper.setData({
        projectName: 'Name',
        dateFormat: 'D',
      });
      const response = wrapper.vm.canProgress;
      expect(response).toBe(true);
    });
  });
});
