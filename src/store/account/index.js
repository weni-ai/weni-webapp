import request from '../../api/request';
import i18n from '../../utils/plugins/i18n';

const state = {
  loading: null,
  profile: null,
};

const getters = {
  authToken() {
    return '';
  },

  profile(state) {
    return state.profile;
  },
};

const actions = {
  async fetchProfile({ commit }) {
    commit('SET_ACCOUNT_LOADING', true);

    try {
      const response = await request.$http().get('v1/account/my-profile/');

      commit('setProfile', response.data);
      commit('SET_ACCOUNT_LOADING', false);
      commit('SET_ACCOUNT_LANGUAGE', response.data.language);
    } catch (e) {
      console.log(e);
    }
  },

  async updateAccountLanguage({ commit }, { language }) {
    if (language === 'en') {
      language = 'en-us';
    }

    await request.$http().put('v1/account/my-profile/change_language/', {
      language,
    });

    commit('SET_ACCOUNT_LANGUAGE', language);
  },

  async updateProfilePicture({ commit }, { file }) {
    var formData = new FormData();
    formData.append('file', file);

    const response = await request
      .$http({
        'Content-Type': 'multipart/form-data',
      })
      .post('v1/account/my-profile/upload_photo/', formData);

    commit('setProfilePicture', response.data.photo);
  },

  async removeProfilePicture({ commit }) {
    await request.$http().delete('v1/account/my-profile/delete_photo/');

    commit('setProfilePicture', null);
  },
};

const mutations = {
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

export default {
  state,
  getters,
  actions,
  mutations,
};
