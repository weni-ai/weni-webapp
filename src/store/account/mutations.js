import i18n from '../../utils/plugins/i18n';

export default {
  setProfile: (state, profile) => (state.profile = profile),

  setProfilePicture: (state, picture) => (state.profile.photo = picture),

  SET_ACCOUNT_LOADING: (state, loading) => {
    state.loading = loading;
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
