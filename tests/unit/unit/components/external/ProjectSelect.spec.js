import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import ProjectSelect from '@/components/external/ProjectSelect.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';

import { org, project } from '../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('ProjectSelect.vue', () => {
  let wrapper;
  let getters;
  let state;
  let store;

  beforeEach(() => {
    state = {
      Project: {
        projects: [],
      },
    };
    getters = {
      currentProject() {
        return project;
      },
      org() {
        return org;
      },
    };
    store = new Vuex.Store({ state, getters });
    wrapper = shallowMount(ProjectSelect, {
      localVue,
      i18n,
      props: {
        org,
      },
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicAutoComplete: true,
        projectSelect: true,
        UnnnicToolTip: true,
        UnnnicIconSvg: true,
        RouterLink: RouterLinkStub,
        UnnnicLanguageSelect: true,
        UnnnicDropdown: true,
        avatar: true,
        UnnnicSelect: true,
        UnnnicFormElement: true,
        UnnnicInput: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
