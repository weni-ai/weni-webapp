import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import account from '@/api/account';
import sendAllIframes from '@/utils/plugins/sendAllIframes';
import i18n from '@/utils/plugins/i18n';
import { useSharedStore } from '@/store/Shared';

export const useAccountStore = defineStore('account', () => {
  const loading = ref(true);
  const profile = ref(null);
  const loadingUpdate = ref(null);
  const error = ref();
  const photoLoading = ref();
  const additionalInformation = reactive({
    status: null,
    data: {},
  });

  const user = computed(() => profile.value);

  function setSharedUser(updatedProfile) {
    const sharedStore = useSharedStore();

    sharedStore.setUser({
      firstName: updatedProfile.first_name,
      lastName: updatedProfile.last_name,
      email: updatedProfile.email,
      language: updatedProfile.language,
    });
  }

  function setSharedLanguage(language) {
    const sharedStore = useSharedStore();
    sharedStore.setLanguage(language);
  }

  function PROFILE_REQUEST() {
    loading.value = true;
  }

  function PROFILE_SUCCESS(updatedProfile) {
    setSharedUser(updatedProfile);
    profile.value = updatedProfile;
    loading.value = false;
  }

  function PROFILE_ERROR(profileError) {
    error.value = profileError;
    loading.value = false;
  }

  function clearLoading() {
    loading.value = false;
  }

  function UPDATE_PROFILE_REQUEST() {
    loadingUpdate.value = true;
  }

  function UPDATE_PROFILE_SUCCESS(updatedProfile) {
    setSharedUser(updatedProfile);
    profile.value = updatedProfile;
    loadingUpdate.value = false;
  }

  function UPDATE_PROFILE_ERROR(profileError) {
    error.value = profileError;
    loadingUpdate.value = false;
  }

  function UPDATE_PROFILE_PICTURE_REQUEST() {
    photoLoading.value = true;
  }

  function UPDATE_PROFILE_PICTURE_SUCCESS(picture) {
    profile.value.photo = picture;
    photoLoading.value = false;
  }

  function UPDATE_PROFILE_PICTURE_ERROR(updatePictureError) {
    error.value = updatePictureError;
    photoLoading.value = false;
  }

  function DELETE_PROFILE_PICTURE_REQUEST() {
    photoLoading.value = true;
  }

  function DELETE_PROFILE_PICTURE_SUCCESS() {
    profile.value.photo = null;
    photoLoading.value = false;
  }

  function DELETE_PROFILE_PICTURE_ERROR(updatePictureError) {
    error.value = updatePictureError;
    photoLoading.value = false;
  }

  function SET_ACCOUNT_LANGUAGE(language) {
    profile.value.language = language;
    setSharedLanguage(language);
  }

  function UPDATE_PROFILE_INITIAL_INFO_SUCCESS(lastUpdateProfile) {
    profile.value.last_update_profile = lastUpdateProfile;
  }

  function UPDATE_PROFILE_INITIAL_INFO_ERROR(initialInfoError) {
    error.value = initialInfoError;
  }

  function UPDATE_PROFILE_2FA_STATUS(status) {
    profile.value.has_2fa = status;
  }

  function UPDATE_EMAIL_PREFERENCES({ receiveOrganization, receiveProject }) {
    profile.value.send_email_setup.receive_organization_emails =
      receiveOrganization;
    profile.value.send_email_setup.receive_project_emails = receiveProject;
  }

  async function fetchProfile() {
    PROFILE_REQUEST();

    try {
      const response = await account.profile();

      PROFILE_SUCCESS(response.data);

      const language = response.data.language;
      i18n.global.locale = language === 'en-us' ? 'en' : language;
      SET_ACCOUNT_LANGUAGE(language);

      if (!response.data.last_update_profile) {
        additionalInformation.status = 'loading';

        account
          .getCompanyInfo()
          .then(({ data }) => {
            additionalInformation.status = 'loaded';

            if (data instanceof Array && data.length) {
              additionalInformation.data = data[0];
            }
          })
          .catch(() => {
            additionalInformation.status = 'error';
          });
      }
    } catch (profileError) {
      PROFILE_ERROR(profileError);
    }
  }

  async function updateProfile(data) {
    try {
      UPDATE_PROFILE_REQUEST();
      const response = await account.updateProfile(data);
      UPDATE_PROFILE_SUCCESS({
        ...response.data,
        last_update_profile: profile.value.last_update_profile,
      });
    } catch (profileError) {
      UPDATE_PROFILE_ERROR(profileError);
    }
  }

  async function updateAccountLanguage({ language }) {
    i18n.global.locale = language === 'en-us' ? 'en' : language;
    SET_ACCOUNT_LANGUAGE(language);
    sendAllIframes('setLanguage', {
      language,
    });

    await account.updateLanguage(language);
  }

  async function updateProfilePicture({ file }) {
    UPDATE_PROFILE_PICTURE_REQUEST();
    try {
      const {
        data: { photo },
      } = await account.updatePicture(file);

      UPDATE_PROFILE_PICTURE_SUCCESS(photo);
    } catch (updatePictureError) {
      UPDATE_PROFILE_PICTURE_ERROR(updatePictureError);
      throw updatePictureError;
    }
  }

  async function removeProfilePicture() {
    DELETE_PROFILE_PICTURE_REQUEST();

    try {
      await account.deletePicture();
      DELETE_PROFILE_PICTURE_SUCCESS();
    } catch (deletePictureError) {
      DELETE_PROFILE_PICTURE_ERROR(deletePictureError);
    }
  }

  async function addInitialInfo({ company, user: initialUser }) {
    try {
      const {
        data: { user: userResponse },
      } = await account.addInitialData({ company, user: initialUser });

      return userResponse;
    } catch (initialInfoError) {
      UPDATE_PROFILE_INITIAL_INFO_ERROR(initialInfoError);
      throw initialInfoError;
    }
  }

  function updateProfile2FAStatus(status) {
    UPDATE_PROFILE_2FA_STATUS(status);
  }

  function updateEmailPreferences({ receiveOrganization, receiveProject }) {
    UPDATE_EMAIL_PREFERENCES({ receiveOrganization, receiveProject });
  }

  return {
    loading,
    profile,
    loadingUpdate,
    error,
    photoLoading,
    additionalInformation,
    user,
    PROFILE_REQUEST,
    PROFILE_SUCCESS,
    PROFILE_ERROR,
    clearLoading,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_ERROR,
    UPDATE_PROFILE_PICTURE_REQUEST,
    UPDATE_PROFILE_PICTURE_SUCCESS,
    UPDATE_PROFILE_PICTURE_ERROR,
    DELETE_PROFILE_PICTURE_REQUEST,
    DELETE_PROFILE_PICTURE_SUCCESS,
    DELETE_PROFILE_PICTURE_ERROR,
    SET_ACCOUNT_LANGUAGE,
    UPDATE_PROFILE_INITIAL_INFO_SUCCESS,
    UPDATE_PROFILE_INITIAL_INFO_ERROR,
    UPDATE_PROFILE_2FA_STATUS,
    UPDATE_EMAIL_PREFERENCES,
    fetchProfile,
    updateProfile,
    updateAccountLanguage,
    updateProfilePicture,
    removeProfilePicture,
    addInitialInfo,
    updateProfile2FAStatus,
    updateEmailPreferences,
  };
});
