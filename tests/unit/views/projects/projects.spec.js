import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import Projects from '@/views/projects/projects.vue';
import i18n from '@/utils/plugins/i18n';
import org from '../../../__mocks__/org';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

jest.mock('@/services/SecurityService.js', () => {});
jest.mock('@/api/request.js', () => {});

describe('Projects.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return org;
      },
    };
    actions = {
      setCurrentProject: jest.fn(),
    };

    store = new Vuex.Store({
      getters,
      actions,
    });

    wrapper = shallowMount(Projects, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        ProjectList: true,
        ProjectLoading: true,
        RightSideBar: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('openManageMembers()', () => {
    it('Set isMemberManagementBarOpen true', () => {
      wrapper.vm.openManageMembers();
      expect(wrapper.vm.isMemberManagementBarOpen).toBe(true);
    });
  });

  describe('openViewMembers()', () => {
    it('Set isMemberViewerBarOpen true', () => {
      wrapper.vm.openViewMembers();
      expect(wrapper.vm.isMemberViewerBarOpen).toBe(true);
    });
  });

  describe('selectProject()', () => {
    it('If there are route in params', () => {
      wrapper.vm.selectProject({ uuid: '' }, '/orgs');
      expect(wrapper.vm.$router.history.current.path).toBe('/orgs');
      expect(wrapper.emitted('set-sidebar-expanded'));
    });
  });

  describe('loadingProject()', () => {
    it('Test loading projects', () => {
      wrapper.vm.loadingProject(true);
      expect(wrapper.vm.loadingProjects).toBe(true);
    });
  });

  describe('loadingProject()', () => {
    it('Test loading projects', () => {
      wrapper.vm.loadingProject(true);
      expect(wrapper.vm.loadingProjects).toBe(true);
    });
  });
});
