import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import ProjectCreate from '@/views/projects/ProjectCreate.vue';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('ProjectCreate.vue', () => {
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

  it('should change path to /projects/list', () => {
    const onBack = jest.spyOn(wrapper.vm, 'onBack');
    wrapper.vm.onBack();
    expect(onBack).toHaveBeenCalled();
    expect(wrapper.vm.$router.history.current.path).toBe('/projects/list');
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

    const onAccess = jest.spyOn(wrapper.vm, 'onAccess');
    wrapper.vm.onAccess();
    expect(onAccess).toHaveBeenCalled();
    expect(wrapper.vm.$router.history.current.path).toBe('/home');
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
