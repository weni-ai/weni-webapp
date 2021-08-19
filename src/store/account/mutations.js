import i18n from '../../utils/plugins/i18n';

export default {
  PROFILE_REQUEST: (state) => (state.loading = true),
  PROFILE_SUCCESS: (state, profile) => {
    state.profile = profile;
    state.loading = false;
  },
  PROFILE_ERROR: (state, profileError) => {
    state.error = profileError;
    state.loading = false;
  },

  UPDATE_PROFILE_REQUEST: (state) => (state.loadingUpdate = true),
  UPDATE_PROFILE_SUCCESS: (state, profile) => {
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
    const languages = {
      'en-us': 'en',
      'pt-br': 'pt-br',
    };

    state.profile.language = language;
    i18n.locale = languages[language];
  },
};
