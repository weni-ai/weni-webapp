import ProfileDropdown from '@/components/Topbar/ProfileDropdown.vue';
import { ORG_ROLE_FINANCIAL } from '@/components/orgs/orgListItem.vue';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { vi } from 'vitest';
import { unnnicDropdown } from '@weni/unnnic-system';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';

const openModalAction = vi.fn();

const store = createStore({
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

const router = createRouter({
  history: createWebHistory(),
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
    global: {
      plugins: [store, router, UnnnicSystem],
      mocks: {
        $keycloak: {
          logout: keycloakLogoutMock,
        },
      },
      stubs: {
        UnnnicDropdown: unnnicDropdown,
        RouterLink: RouterLinkStub,
      },
    },
    props: {},
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
        component('optionAccount').trigger('click');

        expect(component('optionAccount').props('to')).toBe('/account/edit');
      });
    });

    describe('when the user clicks on see all orgs option', () => {
      it('redirects orgs list', () => {
        component('optionSeeAllOrgs').trigger('click');

        expect(component('optionSeeAllOrgs').props('to')).toBe('/orgs');
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
            title: wrapper.vm.$t('NAVBAR.LOGOUT'),
            description: wrapper.vm.$t('NAVBAR.LOGOUT_MESSAGE'),
            cancelText: wrapper.vm.$t('NAVBAR.CANCEL'),
            confirmText: wrapper.vm.$t('NAVBAR.LOGOUT'),
            onConfirm: expect.any(Function),
          },
        });
      });

      // TODO: This test broke after migrating to Vue Test Utils 2, but for priority it was commented out.

      // describe('when the user confirms logout', () => {
      //   it('calls keycloak logout', () => {
      //     expect(wrapper.vm.$keycloak.logout).toBe(keycloakLogoutMock);

      //     const lastConfirmationLogout = openModalAction.mock.calls
      //       .map((args) => args[1])
      //       .at(-1);

      //     const closeConfirmationModal = vi.fn();

      //     lastConfirmationLogout.data.onConfirm(closeConfirmationModal);

      //     expect(closeConfirmationModal).toHaveBeenCalled();
      //     expect(keycloakLogoutMock).toHaveBeenCalled();
      //   });
      // });
    });

    // TODO: This test broke after migrating to Vue Test Utils 2, but for priority it was commented out.

    // describe('when the user has financial role and they enter in a project', () => {
    //   beforeEach(() => {
    //     if (wrapper.vm.$route.name !== 'home') {
    //       router.push({ name: 'home', params: { projectUuid: '1234' } });
    //     }
    //   });

    //   it('should not show the billing option', () => {
    //     expect(element('optionBilling').exists()).toBeTruthy();
    //   });

    //   describe('when the user clicks on billing option', () => {
    //     it('redirects to billing page', async () => {
    //       await element('optionBilling').trigger('click');

    //       expect(wrapper.vm.$route.name).toBe('billing');
    //     });
    //   });
    // });
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
