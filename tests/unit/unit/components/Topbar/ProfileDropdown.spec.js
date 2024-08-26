import ProfileDropdown from '@/components/Topbar/ProfileDropdown.vue';
import { createLocalVue, mount } from '@vue/test-utils';
import { ORG_ROLE_FINANCIAL } from '@/components/orgs/orgListItem.vue';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

vi.mock('@/utils/plugins/i18n.js', () => {
  return { default: { t: (key) => key } };
});

const localVue = createLocalVue();

localVue.use(UnnnicSystem);
localVue.use(VueRouter);
localVue.use(Vuex);

const openModalAction = vi.fn();

const store = new Vuex.Store({
  state() {
    return {
      Account: {
        profile: {
          first_name: 'Mary',
          last_name: 'Ana',
          photo: 'img-url.com',
        },
      },
    };
  },

  getters: {
    org() {
      return {
        uuid: '5678',
        authorization: {
          role: ORG_ROLE_FINANCIAL,
        },
      };
    },
  },

  actions: {
    openModal: openModalAction,
  },
});

const router = new VueRouter({
  routes: [
    {
      path: '/account/edit',
      name: 'account',
    },
    {
      path: '/orgs',
      name: 'orgs',
    },
    {
      path: '/:projectUuid/home',
      name: 'home',
    },
    {
      path: '/orgs/:orgUuid/billing',
      name: 'billing',
    },
  ],
});

const keycloakLogoutMock = vi.fn();

const setup = () =>
  mount(ProfileDropdown, {
    localVue,
    store,
    router,

    propsData: {},

    mocks: {
      $t: (key) => key,
      $keycloak: {
        logout: keycloakLogoutMock,
      },
    },
  });

const elements = {
  profileImage: '[data-test="profile-image"]',
  fallbackProfileImage: { name: 'ProfilePictureDefault' },
  languageSelector: { name: 'ProfileLanguageSelector' },
  dropdownTrigger: '[data-test="dropdown-trigger"]',
  optionAccount: '[data-test="account"]',
  optionSeeAllOrgs: '[data-test="see-all-orgs"]',
  optionBilling: '[data-test="billing"]',
  optionLogout: '[data-test="logout"]',
};

const globalOptions = ['optionAccount', 'optionSeeAllOrgs', 'optionLogout'];

describe('ProfileDropdown.vue', () => {
  let wrapper;

  const component = (element) => wrapper.findComponent(elements[element]);
  const element = (element) => wrapper.find(elements[element]);

  beforeEach(() => {
    wrapper = setup();
  });

  it('does not initially show any options or the language selector', () => {
    globalOptions.forEach((globalOption) => {
      expect(element(globalOption).exists()).toBeFalsy();
    });

    expect(element('optionBilling').exists()).toBeFalsy();

    expect(component('languageSelector').exists()).toBeFalsy();
  });

  describe('when the user clicks on profile dropdown', () => {
    beforeEach(() => {
      element('dropdownTrigger').trigger('click');
    });

    it('should show all the global options', () => {
      globalOptions.forEach((globalOption) => {
        expect(element(globalOption).exists()).toBeTruthy();
      });
    });

    it('should not show the billing option', () => {
      expect(element('optionBilling').exists()).toBeFalsy();
    });

    it('should show the language selector', () => {
      expect(component('languageSelector').exists()).toBeTruthy();
    });

    describe('when the user clicks on account option', () => {
      it('redirects to account page', () => {
        element('optionAccount').trigger('click');

        expect(wrapper.vm.$route.name).toBe('account');
      });
    });

    describe('when the user clicks on see all orgs option', () => {
      it('redirects orgs list', () => {
        element('optionSeeAllOrgs').trigger('click');

        expect(wrapper.vm.$route.name).toBe('orgs');
      });
    });

    describe('when the user clicks on logout option', () => {
      beforeEach(() => {
        element('optionLogout').trigger('click');
      });

      it('show logout confirmation modal', () => {
        expect(
          openModalAction.mock.calls.map((args) => args[1]),
        ).toContainEqual({
          type: 'confirm',
          data: {
            icon: 'logout',
            scheme: 'feedback-red',
            title: 'NAVBAR.LOGOUT',
            description: 'NAVBAR.LOGOUT_MESSAGE',
            cancelText: 'NAVBAR.CANCEL',
            confirmText: 'NAVBAR.LOGOUT',
            onConfirm: expect.any(Function),
          },
        });
      });

      describe('when the user confirms logout', () => {
        it('calls keycloak logout', () => {
          const lastConfirmationLogout = openModalAction.mock.calls
            .map((args) => args[1])
            .at(-1);

          const closeConfirmationModal = vi.fn();

          lastConfirmationLogout.data.onConfirm(closeConfirmationModal);

          expect(closeConfirmationModal).toHaveBeenCalled();
          expect(keycloakLogoutMock).toHaveBeenCalled();
        });
      });
    });

    describe('when the user has financial role and they enter in a project', () => {
      beforeEach(() => {
        if (wrapper.vm.$route.name !== 'home') {
          router.push({ name: 'home', params: { projectUuid: '1234' } });
        }
      });

      it('should not show the billing option', () => {
        expect(element('optionBilling').exists()).toBeTruthy();
      });

      describe('when the user clicks on billing option', () => {
        it('redirects to billing page', () => {
          element('optionBilling').trigger('click');

          expect(wrapper.vm.$route.name).toBe('billing');
        });
      });
    });
  });

  describe('when an error occours in the profile image', () => {
    beforeEach(() => {
      element('profileImage').trigger('error');
    });

    it('should show the fallback profile image', () => {
      expect(component('fallbackProfileImage').exists());
      expect(component('fallbackProfileImage').props()).toEqual({ text: 'MA' });
    });
  });
});
