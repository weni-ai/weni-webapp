import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import UpdateOrg from '@/components/common/RightBar/updateOrg.vue';
import orgs from '@/api/orgs';
import Unnnic from '@weni/unnnic-system';

vi.mock('@/api/orgs', () => ({
  default: {
    updateSSOConfig: vi.fn(),
  },
}));

vi.mock('@/api/account', () => ({
  default: {
    updateAccount2FAStatus: vi.fn(),
  },
}));

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

function buildOrg(overrides = {}) {
  return {
    uuid: '123',
    name: 'Acme',
    description: 'Acme org',
    enforce_2fa: false,
    sso_config: {
      is_enabled: false,
      allowed_email_domains: [],
      allowed_sso_providers: [],
    },
    ...overrides,
  };
}

function mountComponent(org) {
  const store = createStore({
    state: {
      Org: { orgs: { data: [org] } },
    },
    actions: {
      editOrg: vi.fn(),
      getOrgs: vi.fn(),
      deleteOrg: vi.fn(),
      setCurrentOrg: vi.fn(),
      clearCurrentOrg: vi.fn(),
      clearCurrentProject: vi.fn(),
      openModal: vi.fn(),
    },
  });

  return shallowMount(UpdateOrg, {
    global: {
      plugins: [store],
      mocks: {
        $t: (key) => key,
      },
    },
    props: {
      orgUuid: org.uuid,
      activeTab: 'second',
    },
  });
}

describe('UpdateOrg.vue - SSO settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mounted initialization', () => {
    it('hydrates the SSO form from the org config', () => {
      const org = buildOrg({
        sso_config: {
          is_enabled: true,
          allowed_email_domains: ['acme.com'],
          allowed_sso_providers: ['google'],
        },
      });

      const wrapper = mountComponent(org);

      expect(wrapper.vm.ssoForm).toEqual({
        isEnabled: true,
        provider: 'google',
        domains: ['acme.com'],
        domainInput: '',
      });
    });
  });

  describe('addDomain', () => {
    it('normalizes valid domains to lowercase and clears the input', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = '  Acme.COM ';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual(['acme.com']);
      expect(wrapper.vm.ssoForm.domainInput).toBe('');
    });

    it('rejects domains with @ and keeps the input', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = '  @Acme.COM ';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual([]);
      expect(wrapper.vm.ssoForm.domainInput).toBe('  @Acme.COM ');
      expect(wrapper.vm.domainInputError).toBe(
        wrapper.vm.$t('orgs.sso.invalid_domain'),
      );
    });

    it('ignores empty values and duplicates', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domains = ['acme.com'];

      wrapper.vm.ssoForm.domainInput = '   ';
      wrapper.vm.addDomain();
      wrapper.vm.ssoForm.domainInput = 'acme.com';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual(['acme.com']);
    });
  });

  describe('onDomainKeydown', () => {
    it('adds the domain on Enter, space, and comma', () => {
      const wrapper = mountComponent(buildOrg());

      ['Enter', ' ', ','].forEach((key) => {
        wrapper.vm.ssoForm.domainInput = 'acme.com';
        wrapper.vm.onDomainKeydown({ key, preventDefault: vi.fn() });

        expect(wrapper.vm.ssoForm.domains).toContain('acme.com');
        expect(wrapper.vm.ssoForm.domainInput).toBe('');
      });

      expect(wrapper.vm.ssoForm.domains).toEqual(['acme.com']);
    });

    it('calls addDomain on Enter, space, and comma', () => {
      const wrapper = mountComponent(buildOrg());
      const addDomainSpy = vi.spyOn(wrapper.vm, 'addDomain');

      wrapper.vm.ssoForm.domainInput = 'acme.com';

      ['Enter', ' ', ','].forEach((key) => {
        const event = { key, preventDefault: vi.fn() };
        wrapper.vm.onDomainKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      expect(addDomainSpy).toHaveBeenCalledTimes(3);
    });

    it('does nothing for other keys', () => {
      const wrapper = mountComponent(buildOrg());
      const addDomainSpy = vi.spyOn(wrapper.vm, 'addDomain');
      const event = { key: 'a', preventDefault: vi.fn() };

      wrapper.vm.onDomainKeydown(event);

      expect(addDomainSpy).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('does not add a domain on space when the input is empty', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.onDomainKeydown({ key: ' ', preventDefault: vi.fn() });

      expect(wrapper.vm.ssoForm.domains).toEqual([]);
    });
  });

  describe('domain validation', () => {
    it('adds gmail.com and clears the input', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = 'gmail.com';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual(['gmail.com']);
      expect(wrapper.vm.ssoForm.domainInput).toBe('');
    });

    it('rejects @gmail.com', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = '@gmail.com';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual([]);
      expect(wrapper.vm.ssoForm.domainInput).toBe('@gmail.com');
      expect(wrapper.vm.domainInputError).toBe(
        wrapper.vm.$t('orgs.sso.invalid_domain'),
      );
    });

    it('rejects full email addresses', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = 'user@gmail.com';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual([]);
      expect(wrapper.vm.domainInputError).toBe(
        wrapper.vm.$t('orgs.sso.invalid_domain'),
      );
    });

    it('rejects domains without a TLD', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = 'gmail';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual([]);
      expect(wrapper.vm.domainInputError).toBe(
        wrapper.vm.$t('orgs.sso.invalid_domain'),
      );
    });

    it('returns no error when the input is empty', () => {
      const wrapper = mountComponent(buildOrg());

      expect(wrapper.vm.domainInputError).toBe(false);
    });
  });

  describe('domain input UX', () => {
    it('adds a domain when addDomain is triggered from the icon handler', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = 'acme.com';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual(['acme.com']);
      expect(wrapper.vm.ssoForm.domainInput).toBe('');
    });

    it('accepts multi-level domains', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = 'sub.domain.co.uk';
      wrapper.vm.addDomain();

      expect(wrapper.vm.ssoForm.domains).toEqual(['sub.domain.co.uk']);
    });
  });

  describe('removeDomain', () => {
    it('removes the given domain', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domains = ['acme.com', 'other.com'];
      wrapper.vm.removeDomain('acme.com');

      expect(wrapper.vm.ssoForm.domains).toEqual(['other.com']);
    });
  });

  describe('ssoValid', () => {
    it('is valid when SSO is disabled', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.isEnabled = false;

      expect(wrapper.vm.ssoValid).toBe(true);
    });

    it('requires a provider and at least one domain when enabled', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.isEnabled = true;
      wrapper.vm.ssoForm.provider = null;
      wrapper.vm.ssoForm.domains = [];
      expect(wrapper.vm.ssoValid).toBe(false);

      wrapper.vm.ssoForm.provider = 'google';
      expect(wrapper.vm.ssoValid).toBe(false);

      wrapper.vm.ssoForm.domains = ['acme.com'];
      expect(wrapper.vm.ssoValid).toBe(true);
    });
  });

  describe('isSaveDisabled', () => {
    it('is disabled when nothing changed', () => {
      const wrapper = mountComponent(buildOrg());

      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('is disabled when the SSO change is invalid', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.isEnabled = true;

      expect(wrapper.vm.ssoDirty).toBe(true);
      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('is enabled when the SSO change is valid', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.isEnabled = true;
      wrapper.vm.ssoForm.provider = 'google';
      wrapper.vm.ssoForm.domains = ['acme.com'];

      expect(wrapper.vm.isSaveDisabled).toBe(false);
    });

    it('is enabled when only 2FA changed', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.enable2FA = true;

      expect(wrapper.vm.isSaveDisabled).toBe(false);
    });

    it('is disabled when there is invalid uncommitted domain input', () => {
      const wrapper = mountComponent(buildOrg());

      wrapper.vm.ssoForm.domainInput = '@gmail.com';

      expect(wrapper.vm.domainInputError).toBeTruthy();
      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });
  });

  describe('saveChanges', () => {
    it('persists the SSO config and shows a success toast', async () => {
      const org = buildOrg();
      const wrapper = mountComponent(org);

      orgs.updateSSOConfig.mockResolvedValue({
        data: {
          is_enabled: true,
          allowed_email_domains: ['acme.com'],
          allowed_sso_providers: ['google'],
        },
      });

      wrapper.vm.ssoForm.isEnabled = true;
      wrapper.vm.ssoForm.provider = 'google';
      wrapper.vm.ssoForm.domains = ['acme.com'];

      await wrapper.vm.saveChanges();

      expect(orgs.updateSSOConfig).toHaveBeenCalledWith({
        organizationUuid: '123',
        isEnabled: true,
        allowedEmailDomains: ['acme.com'],
        allowedSSOProviders: ['google'],
      });
      expect(Unnnic.unnnicCallAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({ scheme: 'feedback-green' }),
        }),
      );
      expect(wrapper.vm.isSaveDisabled).toBe(true);
    });

    it('shows the lockout error toast and skips 2FA on a 400 response', async () => {
      const org = buildOrg({ enforce_2fa: false });
      const wrapper = mountComponent(org);

      orgs.updateSSOConfig.mockRejectedValue({
        response: { status: 400, data: { detail: 'locked out' } },
      });

      const spy2FA = vi.spyOn(wrapper.vm, 'beforeUpdate2FAVerification');

      wrapper.vm.ssoForm.isEnabled = true;
      wrapper.vm.ssoForm.provider = 'google';
      wrapper.vm.ssoForm.domains = ['acme.com'];
      wrapper.vm.enable2FA = true;

      await wrapper.vm.saveChanges();

      expect(Unnnic.unnnicCallAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            scheme: 'feedback-red',
            title: 'SSO login required for at least one admin',
          }),
        }),
      );
      expect(spy2FA).not.toHaveBeenCalled();
    });

    it('runs the 2FA flow when only 2FA changed', async () => {
      const wrapper = mountComponent(buildOrg({ enforce_2fa: false }));

      const spy2FA = vi
        .spyOn(wrapper.vm, 'beforeUpdate2FAVerification')
        .mockImplementation(() => {});

      wrapper.vm.enable2FA = true;

      await wrapper.vm.saveChanges();

      expect(orgs.updateSSOConfig).not.toHaveBeenCalled();
      expect(spy2FA).toHaveBeenCalled();
    });
  });
});
