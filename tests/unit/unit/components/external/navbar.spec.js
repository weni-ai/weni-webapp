import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import navbar from '@/components/external/navbar.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';

import { profile } from '../../../__mocks__';
const localVue = createLocalVue();
localVue.use(Vuex);
jest.mock('@/services/Keycloak.js', () => {});

describe('navbar.vue', () => {
  let wrapper;

  let actions;
  let store;
  let state;

  beforeEach(() => {
    actions = {
      closeModal: jest.fn(),
    };
    state = {
      Account: {
        profile,
      },
    };
    store = new Vuex.Store({
      actions,
      state,
    });
    wrapper = shallowMount(navbar, {
      localVue,
      i18n,
      propsData: {},
      store,
      mocks: {
        $t: () => 'some specific text',
        $keycloack: {
          logout: jest.fn(),
        },
      },
      stubs: {
        unnnicAutoComplete: true,
        projectSelect: true,
        unnnicToolTip: true,
        unnnicIconSvg: true,
        RouterLink: RouterLinkStub,
        unnnicLanguageSelect: true,
        unnnicDropdown: true,
        avatar: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('calls closeAccountMenu', async () => {
    await wrapper.vm.closeAccountMenu();
    expect(wrapper.vm.dropdownOpen).toBeFalsy;
  });

  it('verify computed imageBackground', () => {
    const res = wrapper.vm.imageBackground;
    expect(res).toBeFalsy;
  });

  it('verify computed language', () => {
    const res = wrapper.vm.language;
    expect(res).toBeTruthy;
  });
});
