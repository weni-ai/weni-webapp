import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import Projects from '@/views/projects/projects';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('Projects.vue', () => {
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
      stubs: {
        RouterLink: RouterLinkStub,
      },
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  // it('sets the correct default data', () => {
  //   expect(typeof Projects.data).toBe('function');
  //   const defaultData = Projects.data();
  //   expect(defaultData.order).toBe('');
  //   expect(defaultData.loading).toBe(false);
  //   expect(defaultData.verifyMozilla).toBe('');
  // });

  // it('correctly sets the order when created', () => {
  //   expect(wrapper.vm.$data.order).toBeDefined();
  // });

  // it('correctly sets the order when created', () => {
  //   expect(wrapper.vm.$data.order).toBeDefined();
  // });

  // it('should test select project', () => {
  //   wrapper.vm.selectProject(
  //     {
  //       uuid: '92893ca9-211d-4d4b-bf2c-a746889c556a',
  //       name: 'TESTE',
  //       menu: {
  //         inteligence: 'https://ai-staging.weni.ai/',
  //         flows: 'https://flows-staging.weni.ai/',
  //         chat: [],
  //       },
  //       organization: {
  //         uuid: 'b6af2c3b-15f8-4316-817e-5d847eb10026',
  //       },
  //       flow_organization: {
  //         uuid: 'afb5f963-0c83-4c87-93fa-f773cc211548',
  //       },
  //     },
  //     '/home',
  //   );
  // });
});
