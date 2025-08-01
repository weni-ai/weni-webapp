import { useSharedStore } from '../Shared';

function setSharedUser(profile) {
  const sharedStore = useSharedStore();

  sharedStore.setUser({
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    language: profile.language,
  });
}

function setSharedLanguage(language) {
  const sharedStore = useSharedStore();

  sharedStore.setLanguage(language);
}

export default {
  PROFILE_REQUEST: (state) => (state.loading = true),
  PROFILE_SUCCESS: (state, profile) => {
    setSharedUser(profile);

    state.profile = profile;
    state.loading = false;
  },
  PROFILE_ERROR: (state, profileError) => {
    state.error = profileError;
    state.loading = false;
  },

  UPDATE_PROFILE_REQUEST: (state) => (state.loadingUpdate = true),
  UPDATE_PROFILE_SUCCESS: (state, profile) => {
    setSharedUser(profile);

    state.profile = profile;
    state.loadingUpdate = false;
  },
  UPDATE_PROFILE_ERROR: (state, profileError) => {
    state.error = profileError;
    state.loadingUpdate = false;
  },

  UPDATE_PROFILE_PICTURE_REQUEST: (state) => (state.photoLoading = true),
  UPDATE_PROFILE_PICTURE_SUCCESS: (state, picture) => {
    state.profile.photo = picture;
    state.photoLoading = false;
  },
  UPDATE_PROFILE_PICTURE_ERROR: (state, updatePictureError) => {
    state.error = updatePictureError;
    state.photoLoading = false;
  },

  DELETE_PROFILE_PICTURE_REQUEST: (state) => (state.photoLoading = true),
  DELETE_PROFILE_PICTURE_SUCCESS: (state) => {
    state.profile.photo = null;
    state.photoLoading = false;
  },
  DELETE_PROFILE_PICTURE_ERROR: (state, updatePictureError) => {
    state.error = updatePictureError;
    state.photoLoading = false;
  },

  SET_ACCOUNT_LANGUAGE: (state, language) => {
    state.profile.language = language;

    setSharedLanguage(language);
  },

  UPDATE_PROFILE_INITIAL_INFO_SUCCESS: (state, last_update_profile) => {
    state.profile.last_update_profile = last_update_profile;
  },

  UPDATE_PROFILE_INITIAL_INFO_ERROR: (state, error) => {
    state.error = error;
  },

  UPDATE_PROFILE_2FA_STATUS: (state, status) => {
    state.profile.has_2fa = status;
  },

  UPDATE_EMAIL_PREFERENCES: (
    state,
    { receiveOrganization, receiveProject },
  ) => {
    state.profile.send_email_setup.receive_organization_emails =
      receiveOrganization;
    state.profile.send_email_setup.receive_project_emails = receiveProject;
  },
};
