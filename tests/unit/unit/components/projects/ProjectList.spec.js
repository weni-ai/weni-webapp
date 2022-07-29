import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/utils/plugins/i18n';
import ProjectList from '@/components/projects/ProjectList.vue';

const intersectionObserverMock = () => ({
  observe: () => null,
});

window.IntersectionObserver = jest
  .fn()
  .mockImplementation(intersectionObserverMock);

const localVue = createLocalVue();

localVue.use(Vuex);

let wrapper;

let actions;
let state;
let getters;
let store;

let options;

function createWrapperWithProps(props) {
  actions = {};
  getters = {};
  state = {
    Account: {
      profile: {},
    },
  };

  store = new Vuex.Store({
    actions,
    state,
    getters,
  });

  options = {
    store,
    localVue,
    i18n,
    mocks: {
      $t: () => '',
    },
    propsData: props,
    stubs: {
      ProjectListItem: true,
      UnnnicSkeletonLoading: true,
      UnnnicIconSvg: true,
    },
  };

  wrapper = mount(ProjectList, options);
}

describe('projectList.vue', () => {
  it('should change projects order when order is by lastAccess and user access project', () => {
    createWrapperWithProps({
      org: 'uuid',
      order: 'lastAccess',
    });

    wrapper.vm.projects = [{ uuid: '1' }, { uuid: '2' }];
    wrapper.vm.selectProject({ uuid: '2' });

    expect(wrapper.vm.projectsOrdered).toMatchObject([
      { uuid: '2' },
      { uuid: '1' },
    ]);
  });
});
