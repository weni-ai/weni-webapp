import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import ProjectCreate from '@/views/projects/ProjectCreate.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../../__mocks__/';

const localVue = createLocalVue();

localVue.use(Vuex);

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
      stubs: {
        UnnnicInput: true,
        UnnnicSelect: true,
        UnnnicButton: true,
        UnnnicInputNext: true,
        Container: true,
      },
      mocks: {
        $t: () => 'some specific text',
        $router: {
          push: jest.fn(),
        },
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
    expect(defaultData.timeZone).toBe('America/Sao_Paulo');
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
  });
});
