import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import UpdateOrg from '@/components/common/RightBar/updateOrg.vue';
import account from '@/api/account';
import orgs from '@/api/orgs';
import { openAlertModal } from '@/utils/openServerErrorAlertModal';
import { org } from '../../../../__mocks__';
import { createTestingPinia } from '@pinia/testing';
import { useModalStore } from '@/store/modal';
import { useOrgStore } from '@/store/org';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/account', () => ({
  default: {
    updateAccount2FAStatus: vi.fn(),
  },
}));

vi.mock('@/api/orgs', () => ({
  default: {
    updateSSOConfig: vi.fn(),
  },
}));

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('lodash', async (importOriginal) => {
  const actual = await importOriginal();
  const lodash = actual.default ?? actual;

  return {
    ...actual,
    default: {
      ...lodash,
      get: vi.fn(),
    },
  };
});

describe('UpdateOrg.vue - onDelete method', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(UpdateOrg, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              Org: {
                orgs: {
                  data: [org],
                },
              },
            },
          }),
        ],
        mocks: {
          $t: (key, params) => {
            if (params) {
              return `${key} ${JSON.stringify(params)}`;
            }
            return key;
          },
        },
      },
      props: {
        orgUuid: org.uuid,
        activeTab: 'first',
      },
    });

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('onDelete', () => {
    it('should successfully delete organization and emit events', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';

      // Mock successful deleteOrg action
      useOrgStore().deleteOrg.mockResolvedValue();

      // Mock lodash get to return different org (not current org)
      const _ = await import('lodash');
      _.default.get.mockReturnValue('different-uuid');

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(useOrgStore().clearCurrentOrg).not.toHaveBeenCalled(); // Different org
      expect(spyShowDeleteConfirmation).toHaveBeenCalledWith(name);
      expect(wrapper.emitted('remove-org')).toBeTruthy();
      expect(wrapper.emitted('remove-org')[0]).toEqual([uuid]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should clear current org when deleting the current organization', async () => {
      const uuid = 'current-org-uuid';
      const name = 'Current Organization';

      // Mock successful deleteOrg action
      useOrgStore().deleteOrg.mockResolvedValue();

      // Mock lodash get to return the same uuid (current org)
      const _ = await import('lodash');
      _.default.get.mockReturnValue(uuid);

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(useOrgStore().clearCurrentOrg).toHaveBeenCalled();
      expect(spyShowDeleteConfirmation).toHaveBeenCalledWith(name);
      expect(wrapper.emitted('remove-org')).toBeTruthy();
      expect(wrapper.emitted('remove-org')[0]).toEqual([uuid]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should handle delete error and show alert modal', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';
      const errorResponse = {
        response: {
          data: {
            detail: 'Failed to delete organization',
          },
        },
      };

      // Mock failed deleteOrg action
      useOrgStore().deleteOrg.mockRejectedValue(errorResponse);

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(useOrgStore().clearCurrentOrg).not.toHaveBeenCalled();
      expect(spyShowDeleteConfirmation).not.toHaveBeenCalled();
      expect(wrapper.emitted('remove-org')).toBeFalsy();
      expect(wrapper.emitted('close')).toBeFalsy();
      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: 'Failed to delete organization',
      });
    });

    it('should handle delete error without response detail', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';
      const errorResponse = new Error('Network error');

      // Mock failed deleteOrg action
      useOrgStore().deleteOrg.mockRejectedValue(errorResponse);

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: undefined,
      });
    });

    it('should handle delete error with nested response structure', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';
      const errorResponse = {
        response: {
          data: {
            detail: 'Organization has active projects',
          },
        },
      };

      // Mock failed deleteOrg action
      useOrgStore().deleteOrg.mockRejectedValue(errorResponse);

      await wrapper.vm.onDelete(uuid, name);

      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: 'Organization has active projects',
      });
    });
  });

  describe('showDeleteConfirmation', () => {
    it('should open success modal with organization name', () => {
      const orgName = 'Test Organization';

      wrapper.vm.showDeleteConfirmation(orgName);

      const modalStore = useModalStore();
      expect(modalStore.openModal).toHaveBeenCalledTimes(1);
      const modalPayload = modalStore.openModal.mock.calls[0][0];
      expect(modalPayload.type).toBe('alert');
      expect(modalPayload.data).toMatchObject({
        scheme: 'feedback-green',
      });
      expect(modalPayload.data.title).toBeTruthy();
      expect(modalPayload.data.description).toContain(orgName);
    });
  });

  describe('updateOrg', () => {
    it('saves name and description and shows a success alert', async () => {
      useOrgStore().editOrg.mockResolvedValue({
        data: { name: 'New name', description: 'New description' },
      });
      wrapper.vm.formData = {
        name: 'New name',
        description: 'New description',
      };

      await wrapper.vm.updateOrg();

      expect(useOrgStore().editOrg).toHaveBeenCalledWith({
        uuid: org.uuid,
        name: 'New name',
        description: 'New description',
      });
      expect(wrapper.vm.loading).toBe(false);
      expect(openAlertModal).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    });

    it('shows a warning when save fails', async () => {
      useOrgStore().editOrg.mockRejectedValue({
        response: { data: { detail: 'Could not save' } },
      });

      await wrapper.vm.updateOrg();

      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: 'Could not save',
      });
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('openDeleteConfirmation', () => {
    it('opens a confirm modal that deletes the organization', async () => {
      useOrgStore().deleteOrg.mockResolvedValue();
      const _ = await import('lodash');
      _.default.get.mockReturnValue('other-uuid');

      wrapper.vm.openDeleteConfirmation({ uuid: 'u1', name: 'Acme' });

      const modalPayload = useModalStore().openModal.mock.calls[0][0];
      expect(modalPayload.type).toBe('confirm');

      const justClose = vi.fn();
      const setLoading = vi.fn();
      await modalPayload.data.onConfirm(justClose, { setLoading });

      expect(setLoading).toHaveBeenCalledWith(true);
      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({ uuid: 'u1' });
      expect(justClose).toHaveBeenCalled();
    });
  });

  describe('2FA confirmation helpers', () => {
    it('shows the disabled confirmation', () => {
      wrapper.vm.showDisabledConfirmation();

      expect(useModalStore().openModal).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'alert' }),
      );
    });

    it('opens a disable-confirm modal when turning 2FA off', () => {
      wrapper.vm.enable2FA = false;

      wrapper.vm.beforeUpdate2FAVerification();

      expect(useModalStore().openModal).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'confirm' }),
      );
    });

    it('shows disabled confirmation after a 2FA save that is not required', async () => {
      account.updateAccount2FAStatus.mockResolvedValue({
        data: { '2fa_required': false },
      });
      wrapper.vm.enable2FA = false;

      await wrapper.vm.update2FAVerification();

      expect(wrapper.vm.loading2FA).toBe(false);
      expect(wrapper.vm.org.enforce_2fa).toBe(false);
    });
  });
});

const SSO_READ_ONLY_MATRIX = [
  { allowed_sso_providers: [], expected: false },
  { allowed_sso_providers: ['google'], expected: false },
  { allowed_sso_providers: ['microsoft'], expected: false },
  { allowed_sso_providers: undefined, expected: false },
  { allowed_sso_providers: ['okta-acme'], expected: true },
  { allowed_sso_providers: ['google', 'microsoft'], expected: true },
  { allowed_sso_providers: ['google', 'okta-acme'], expected: true },
];

function buildOrgWithProviders(allowedSsoProviders, ssoOverrides = {}) {
  const sso_config = {
    is_enabled: false,
    allowed_email_domains: [],
    ...ssoOverrides,
  };

  if (allowedSsoProviders === undefined) {
    delete sso_config.allowed_sso_providers;
  } else {
    sso_config.allowed_sso_providers = allowedSsoProviders;
  }

  return {
    ...org,
    sso_config,
  };
}

function mountUpdateOrg(orgData, activeTab = 'second') {
  return shallowMount(UpdateOrg, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            Org: {
              orgs: {
                data: [orgData],
              },
            },
          },
        }),
      ],
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        UnnnicTab: {
          name: 'UnnnicTab',
          template:
            '<div><slot /><slot name="tab-panel-first" /><slot name="tab-panel-second" /></div>',
        },
        UnnnicSwitch: {
          name: 'UnnnicSwitch',
          props: ['disabled', 'textRight', 'modelValue'],
          template: '<div />',
        },
        UnnnicSelect: {
          name: 'UnnnicSelect',
          props: ['disabled', 'modelValue', 'options', 'placeholder'],
          template: '<div />',
        },
        UnnnicInput: {
          name: 'UnnnicInput',
          props: [
            'disabled',
            'modelValue',
            'label',
            'placeholder',
            'iconRight',
            'errors',
          ],
          template: '<div />',
        },
        UnnnicChip: {
          name: 'UnnnicChip',
          props: ['disabled', 'text', 'type', 'isSelected'],
          template: '<div />',
        },
        UnnnicFormElement: {
          name: 'UnnnicFormElement',
          props: ['label'],
          template: '<div><slot /></div>',
        },
        UnnnicButton: true,
        UnnnicTag: true,
      },
    },
    props: {
      orgUuid: orgData.uuid,
      activeTab,
    },
  });
}

function findByProp(wrapper, name, prop, value) {
  const matches = wrapper.findAllComponents({ name });
  const components = matches.wrappers ?? [...matches];

  return components.find((component) => component.props(prop) === value);
}

describe('UpdateOrg.vue - SSO read-only', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isSsoReadOnly', () => {
    it.each(SSO_READ_ONLY_MATRIX)(
      'is $expected when allowed_sso_providers is $allowed_sso_providers',
      ({ allowed_sso_providers, expected }) => {
        const wrapper = mountUpdateOrg(
          buildOrgWithProviders(allowed_sso_providers),
        );

        expect(wrapper.vm.isSsoReadOnly).toBe(expected);
      },
    );
  });

  describe('read-only rendering', () => {
    it('disables SSO controls, shows the managed-externally notice, and keeps the domain list visible', async () => {
      const wrapper = mountUpdateOrg(
        buildOrgWithProviders(['okta-acme'], {
          is_enabled: true,
          allowed_email_domains: ['acme.com'],
        }),
      );

      await wrapper.vm.$nextTick();

      const ssoSwitch = findByProp(
        wrapper,
        'UnnnicSwitch',
        'textRight',
        i18n.global.t('orgs.sso.enable'),
      );
      const providerSelect = wrapper.findComponent({ name: 'UnnnicSelect' });
      const domainInput = findByProp(
        wrapper,
        'UnnnicInput',
        'label',
        i18n.global.t('orgs.sso.allowed_domains'),
      );
      const chips = wrapper.findAllComponents({ name: 'UnnnicChip' });

      expect(ssoSwitch.props('disabled')).toBe(true);
      expect(providerSelect.props('disabled')).toBe(true);
      expect(domainInput.props('disabled')).toBe(true);
      expect(chips.length).toBeGreaterThan(0);
      for (let i = 0; i < chips.length; i += 1) {
        expect(chips.at(i).props('disabled')).toBe(true);
        expect(chips.at(i).props('text')).toBe('acme.com');
      }
      expect(wrapper.text()).toContain(
        i18n.global.t('orgs.sso.managed_externally'),
      );
    });
  });

  describe('write guards', () => {
    it('reports ssoDirty as false when read-only', () => {
      const wrapper = mountUpdateOrg(
        buildOrgWithProviders(['okta-acme'], {
          is_enabled: true,
          allowed_email_domains: ['acme.com'],
        }),
      );

      wrapper.vm.ssoForm.provider = 'google';
      wrapper.vm.ssoForm.domains = [];

      expect(wrapper.vm.ssoDirty).toBe(false);
    });

    it('does not call updateSSOConfig when read-only even after a programmatic ssoForm mutation', async () => {
      const wrapper = mountUpdateOrg(
        buildOrgWithProviders(['okta-acme'], {
          is_enabled: true,
          allowed_email_domains: ['acme.com'],
        }),
      );

      wrapper.vm.ssoForm.isEnabled = false;
      wrapper.vm.ssoForm.provider = 'google';
      wrapper.vm.ssoForm.domains = [];

      await wrapper.vm.saveChanges();

      expect(orgs.updateSSOConfig).toHaveBeenCalledTimes(0);
    });

    it('saves 2FA without writing sso_config when read-only', async () => {
      account.updateAccount2FAStatus.mockResolvedValue({
        data: { '2fa_required': true },
      });

      const wrapper = mountUpdateOrg(
        buildOrgWithProviders(['okta-acme'], {
          is_enabled: true,
          allowed_email_domains: ['acme.com'],
        }),
      );

      wrapper.vm.enable2FA = true;

      await wrapper.vm.saveChanges();

      expect(account.updateAccount2FAStatus).toHaveBeenCalledTimes(1);
      expect(account.updateAccount2FAStatus).toHaveBeenCalledWith(
        true,
        org.uuid,
      );
      expect(orgs.updateSSOConfig).toHaveBeenCalledTimes(0);
    });
  });
});
