import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';

import { useAccountStore } from '@/store/account';
import { useSharedStore } from '@/store/Shared';
import accountApi from '@/api/account';
import sendAllIframes from '@/utils/plugins/sendAllIframes';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/account', () => ({
  default: {
    profile: vi.fn(),
    updateProfile: vi.fn(),
    updateLanguage: vi.fn(),
    updatePicture: vi.fn(),
    deletePicture: vi.fn(),
    addInitialData: vi.fn(),
    getCompanyInfo: vi.fn(),
  },
}));

vi.mock('@/utils/plugins/sendAllIframes', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      locale: 'en',
    },
  },
}));

const baseProfile = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  language: 'pt-br',
  photo: 'photo-url',
  last_update_profile: '2024-01-01T00:00:00Z',
  has_2fa: false,
  send_email_setup: {
    receive_organization_emails: true,
    receive_project_emails: false,
  },
};

describe('useAccountStore', () => {
  let accountStore;
  let sharedStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    accountStore = useAccountStore();
    sharedStore = useSharedStore();
    vi.clearAllMocks();
    i18n.global.locale = 'en';
  });

  describe('initial state and getters', () => {
    it('exposes the default state', () => {
      expect(accountStore.loading).toBe(true);
      expect(accountStore.profile).toBeNull();
      expect(accountStore.loadingUpdate).toBeNull();
      expect(accountStore.error).toBeUndefined();
      expect(accountStore.photoLoading).toBeUndefined();
      expect(accountStore.additionalInformation).toEqual({
        status: null,
        data: {},
      });
    });

    it('user getter mirrors profile', () => {
      expect(accountStore.user).toBeNull();

      accountStore.profile = { ...baseProfile };

      expect(accountStore.user).toEqual(baseProfile);
    });
  });

  describe('mutation-equivalent functions', () => {
    it('PROFILE_REQUEST sets loading to true', () => {
      accountStore.loading = false;
      accountStore.PROFILE_REQUEST();
      expect(accountStore.loading).toBe(true);
    });

    it('PROFILE_SUCCESS syncs Shared user, sets profile and clears loading', () => {
      const setUserSpy = vi.spyOn(sharedStore, 'setUser');

      accountStore.PROFILE_SUCCESS(baseProfile);

      expect(setUserSpy).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        language: 'pt-br',
      });
      expect(accountStore.profile).toEqual(baseProfile);
      expect(accountStore.loading).toBe(false);
    });

    it('PROFILE_ERROR stores the error and clears loading', () => {
      const error = new Error('profile failed');
      accountStore.PROFILE_ERROR(error);
      expect(accountStore.error).toBe(error);
      expect(accountStore.loading).toBe(false);
    });

    it('clearLoading clears loading without setting an error', () => {
      expect(accountStore.loading).toBe(true);
      expect(accountStore.error).toBeUndefined();

      accountStore.clearLoading();

      expect(accountStore.loading).toBe(false);
      expect(accountStore.error).toBeUndefined();
      expect(accountStore.profile).toBeNull();
    });

    it('UPDATE_PROFILE_REQUEST sets loadingUpdate to true', () => {
      accountStore.UPDATE_PROFILE_REQUEST();
      expect(accountStore.loadingUpdate).toBe(true);
    });

    it('UPDATE_PROFILE_SUCCESS syncs Shared user, sets profile and clears loadingUpdate', () => {
      const setUserSpy = vi.spyOn(sharedStore, 'setUser');

      accountStore.UPDATE_PROFILE_SUCCESS(baseProfile);

      expect(setUserSpy).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        language: 'pt-br',
      });
      expect(accountStore.profile).toEqual(baseProfile);
      expect(accountStore.loadingUpdate).toBe(false);
    });

    it('UPDATE_PROFILE_ERROR stores the error and clears loadingUpdate', () => {
      const error = new Error('update failed');
      accountStore.UPDATE_PROFILE_ERROR(error);
      expect(accountStore.error).toBe(error);
      expect(accountStore.loadingUpdate).toBe(false);
    });

    it('UPDATE_PROFILE_PICTURE_REQUEST sets photoLoading to true', () => {
      accountStore.UPDATE_PROFILE_PICTURE_REQUEST();
      expect(accountStore.photoLoading).toBe(true);
    });

    it('UPDATE_PROFILE_PICTURE_SUCCESS updates photo and clears photoLoading', () => {
      accountStore.profile = { ...baseProfile };
      accountStore.UPDATE_PROFILE_PICTURE_SUCCESS('new-photo');
      expect(accountStore.profile.photo).toBe('new-photo');
      expect(accountStore.photoLoading).toBe(false);
    });

    it('UPDATE_PROFILE_PICTURE_ERROR stores the error and clears photoLoading', () => {
      const error = new Error('picture failed');
      accountStore.UPDATE_PROFILE_PICTURE_ERROR(error);
      expect(accountStore.error).toBe(error);
      expect(accountStore.photoLoading).toBe(false);
    });

    it('DELETE_PROFILE_PICTURE_REQUEST sets photoLoading to true', () => {
      accountStore.DELETE_PROFILE_PICTURE_REQUEST();
      expect(accountStore.photoLoading).toBe(true);
    });

    it('DELETE_PROFILE_PICTURE_SUCCESS clears photo and photoLoading', () => {
      accountStore.profile = { ...baseProfile };
      accountStore.DELETE_PROFILE_PICTURE_SUCCESS();
      expect(accountStore.profile.photo).toBeNull();
      expect(accountStore.photoLoading).toBe(false);
    });

    it('DELETE_PROFILE_PICTURE_ERROR stores the error and clears photoLoading', () => {
      const error = new Error('delete failed');
      accountStore.DELETE_PROFILE_PICTURE_ERROR(error);
      expect(accountStore.error).toBe(error);
      expect(accountStore.photoLoading).toBe(false);
    });

    it('SET_ACCOUNT_LANGUAGE updates profile language and Shared language', () => {
      const setLanguageSpy = vi.spyOn(sharedStore, 'setLanguage');
      accountStore.profile = { ...baseProfile };

      accountStore.SET_ACCOUNT_LANGUAGE('es');

      expect(accountStore.profile.language).toBe('es');
      expect(setLanguageSpy).toHaveBeenCalledWith('es');
    });

    it('UPDATE_PROFILE_INITIAL_INFO_SUCCESS updates last_update_profile', () => {
      accountStore.profile = { ...baseProfile };
      accountStore.UPDATE_PROFILE_INITIAL_INFO_SUCCESS('2025-01-01T00:00:00Z');
      expect(accountStore.profile.last_update_profile).toBe(
        '2025-01-01T00:00:00Z',
      );
    });

    it('UPDATE_PROFILE_INITIAL_INFO_ERROR stores the error', () => {
      const error = new Error('initial info failed');
      accountStore.UPDATE_PROFILE_INITIAL_INFO_ERROR(error);
      expect(accountStore.error).toBe(error);
    });

    it('UPDATE_PROFILE_2FA_STATUS updates has_2fa', () => {
      accountStore.profile = { ...baseProfile };
      accountStore.UPDATE_PROFILE_2FA_STATUS(true);
      expect(accountStore.profile.has_2fa).toBe(true);
    });

    it('UPDATE_EMAIL_PREFERENCES updates send_email_setup flags', () => {
      accountStore.profile = {
        ...baseProfile,
        send_email_setup: {
          receive_organization_emails: true,
          receive_project_emails: false,
        },
      };

      accountStore.UPDATE_EMAIL_PREFERENCES({
        receiveOrganization: false,
        receiveProject: true,
      });

      expect(accountStore.profile.send_email_setup).toEqual({
        receive_organization_emails: false,
        receive_project_emails: true,
      });
    });
  });

  describe('fetchProfile', () => {
    it('maps en-us to en for i18n and syncs Shared on success', async () => {
      const setUserSpy = vi.spyOn(sharedStore, 'setUser');
      const setLanguageSpy = vi.spyOn(sharedStore, 'setLanguage');
      const profileData = {
        ...baseProfile,
        language: 'en-us',
        last_update_profile: '2024-01-01T00:00:00Z',
      };
      accountApi.profile.mockResolvedValue({ data: profileData });

      await accountStore.fetchProfile();

      expect(accountStore.loading).toBe(false);
      expect(accountStore.profile).toEqual(profileData);
      expect(i18n.global.locale).toBe('en');
      expect(accountStore.profile.language).toBe('en-us');
      expect(setUserSpy).toHaveBeenCalled();
      expect(setLanguageSpy).toHaveBeenCalledWith('en-us');
      expect(accountApi.getCompanyInfo).not.toHaveBeenCalled();
    });

    it('keeps non en-us locale values as-is', async () => {
      accountApi.profile.mockResolvedValue({
        data: { ...baseProfile, language: 'es' },
      });

      await accountStore.fetchProfile();

      expect(i18n.global.locale).toBe('es');
      expect(accountStore.profile.language).toBe('es');
    });

    it('loads company info when last_update_profile is missing', async () => {
      let resolveCompanyInfo;
      accountApi.profile.mockResolvedValue({
        data: { ...baseProfile, last_update_profile: null },
      });
      accountApi.getCompanyInfo.mockReturnValue(
        new Promise((resolve) => {
          resolveCompanyInfo = resolve;
        }),
      );

      const fetchPromise = accountStore.fetchProfile();
      await flushPromises();

      expect(accountStore.additionalInformation.status).toBe('loading');

      resolveCompanyInfo({
        data: [{ name: 'Acme', sector: 'Tech' }],
      });
      await fetchPromise;
      await flushPromises();

      expect(accountStore.additionalInformation.status).toBe('loaded');
      expect(accountStore.additionalInformation.data).toEqual({
        name: 'Acme',
        sector: 'Tech',
      });
    });

    it('keeps empty company data when response is not a non-empty array', async () => {
      accountApi.profile.mockResolvedValue({
        data: { ...baseProfile, last_update_profile: null },
      });
      accountApi.getCompanyInfo.mockResolvedValue({ data: [] });

      await accountStore.fetchProfile();
      await flushPromises();

      expect(accountStore.additionalInformation.status).toBe('loaded');
      expect(accountStore.additionalInformation.data).toEqual({});
    });

    it('sets company info status to error when getCompanyInfo rejects', async () => {
      accountApi.profile.mockResolvedValue({
        data: { ...baseProfile, last_update_profile: null },
      });
      accountApi.getCompanyInfo.mockRejectedValue(new Error('company failed'));

      await accountStore.fetchProfile();
      await flushPromises();

      expect(accountStore.additionalInformation.status).toBe('error');
    });

    it('stores the error when profile request fails', async () => {
      const error = new Error('fetch failed');
      accountApi.profile.mockRejectedValue(error);

      await accountStore.fetchProfile();

      expect(accountStore.error).toBe(error);
      expect(accountStore.loading).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('preserves existing last_update_profile on success', async () => {
      accountStore.profile = {
        ...baseProfile,
        last_update_profile: 'existing-value',
      };
      accountApi.updateProfile.mockResolvedValue({
        data: {
          ...baseProfile,
          first_name: 'Updated',
          last_update_profile: 'ignored-from-api',
        },
      });

      await accountStore.updateProfile({ first_name: 'Updated' });

      expect(accountStore.loadingUpdate).toBe(false);
      expect(accountStore.profile.first_name).toBe('Updated');
      expect(accountStore.profile.last_update_profile).toBe('existing-value');
    });

    it('stores the error when update fails', async () => {
      const error = new Error('update failed');
      accountApi.updateProfile.mockRejectedValue(error);

      await accountStore.updateProfile({ first_name: 'Updated' });

      expect(accountStore.error).toBe(error);
      expect(accountStore.loadingUpdate).toBe(false);
    });
  });

  describe('updateAccountLanguage', () => {
    it('broadcasts language before calling the API and maps en-us for i18n', async () => {
      const callOrder = [];
      accountStore.profile = { ...baseProfile };

      sendAllIframes.mockImplementation(() => {
        callOrder.push('iframe');
      });
      accountApi.updateLanguage.mockImplementation(async () => {
        callOrder.push('api');
      });

      await accountStore.updateAccountLanguage({ language: 'en-us' });

      expect(i18n.global.locale).toBe('en');
      expect(accountStore.profile.language).toBe('en-us');
      expect(sharedStore.user.language).toBe('en-us');
      expect(sendAllIframes).toHaveBeenCalledWith('setLanguage', {
        language: 'en-us',
      });
      expect(accountApi.updateLanguage).toHaveBeenCalledWith('en-us');
      expect(callOrder).toEqual(['iframe', 'api']);
    });

    it('keeps non en-us locale values as-is before the API call', async () => {
      accountStore.profile = { ...baseProfile };

      await accountStore.updateAccountLanguage({ language: 'es' });

      expect(i18n.global.locale).toBe('es');
      expect(accountStore.profile.language).toBe('es');
      expect(sendAllIframes).toHaveBeenCalledWith('setLanguage', {
        language: 'es',
      });
      expect(accountApi.updateLanguage).toHaveBeenCalledWith('es');
    });
  });

  describe('updateProfilePicture', () => {
    it('updates the photo on success', async () => {
      accountStore.profile = { ...baseProfile };
      accountApi.updatePicture.mockResolvedValue({
        data: { photo: 'new-photo-url' },
      });

      await accountStore.updateProfilePicture({ file: new File([], 'a.png') });

      expect(accountStore.profile.photo).toBe('new-photo-url');
      expect(accountStore.photoLoading).toBe(false);
    });

    it('stores the error and rethrows when update fails', async () => {
      const error = new Error('picture failed');
      accountStore.profile = { ...baseProfile };
      accountApi.updatePicture.mockRejectedValue(error);

      await expect(
        accountStore.updateProfilePicture({ file: new File([], 'a.png') }),
      ).rejects.toThrow(error);

      expect(accountStore.error).toBe(error);
      expect(accountStore.photoLoading).toBe(false);
    });
  });

  describe('removeProfilePicture', () => {
    it('clears the photo on success', async () => {
      accountStore.profile = { ...baseProfile };
      accountApi.deletePicture.mockResolvedValue({});

      await accountStore.removeProfilePicture();

      expect(accountStore.profile.photo).toBeNull();
      expect(accountStore.photoLoading).toBe(false);
    });

    it('stores the error without rethrowing when delete fails', async () => {
      const error = new Error('delete failed');
      accountStore.profile = { ...baseProfile };
      accountApi.deletePicture.mockRejectedValue(error);

      await expect(accountStore.removeProfilePicture()).resolves.toBeUndefined();

      expect(accountStore.error).toBe(error);
      expect(accountStore.photoLoading).toBe(false);
    });
  });

  describe('addInitialInfo', () => {
    it('returns the user payload on success', async () => {
      const userResponse = { phone: '+5511999999999' };
      accountApi.addInitialData.mockResolvedValue({
        data: { user: userResponse },
      });

      const result = await accountStore.addInitialInfo({
        company: { name: 'Acme' },
        user: { phone: '+5511999999999' },
      });

      expect(result).toEqual(userResponse);
      expect(accountApi.addInitialData).toHaveBeenCalledWith({
        company: { name: 'Acme' },
        user: { phone: '+5511999999999' },
      });
    });

    it('stores the error and rethrows when the request fails', async () => {
      const error = new Error('initial info failed');
      accountApi.addInitialData.mockRejectedValue(error);

      await expect(
        accountStore.addInitialInfo({
          company: { name: 'Acme' },
          user: { phone: '+5511999999999' },
        }),
      ).rejects.toThrow(error);

      expect(accountStore.error).toBe(error);
    });
  });

  describe('preference setters', () => {
    it('updateProfile2FAStatus updates has_2fa', () => {
      accountStore.profile = { ...baseProfile };

      accountStore.updateProfile2FAStatus(true);

      expect(accountStore.profile.has_2fa).toBe(true);
    });

    it('updateEmailPreferences updates send_email_setup flags', () => {
      accountStore.profile = {
        ...baseProfile,
        send_email_setup: {
          receive_organization_emails: true,
          receive_project_emails: false,
        },
      };

      accountStore.updateEmailPreferences({
        receiveOrganization: false,
        receiveProject: true,
      });

      expect(accountStore.profile.send_email_setup).toEqual({
        receive_organization_emails: false,
        receive_project_emails: true,
      });
    });
  });
});
