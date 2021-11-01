import account from '../../api/account';
import sendAllIframes from '../../utils/plugins/sendAllIframes';

export default {
  async fetchProfile({ commit }) {
    commit('PROFILE_REQUEST');

    try {
      const response = await account.profile();

      commit('PROFILE_SUCCESS', response.data);
      commit('SET_ACCOUNT_LANGUAGE', response.data.language);
    } catch (e) {
      commit('PROFILE_ERROR', e);
    }
  },

  async updateProfile({ commit }, data) {
    try {
      commit('UPDATE_PROFILE_REQUEST');
      const response = await account.updateProfile(data);
      commit('UPDATE_PROFILE_SUCCESS', response.data);
    } catch (e) {
      commit('UPDATE_PROFILE_ERROR', e);
    }
  },

  async updateAccountLanguage({ commit }, { language }) {
    if (language === 'en') language = 'en-us';

    /* temporary: waiting back-end support */
    if (language === 'es') {
      commit('SET_ACCOUNT_LANGUAGE', language);
      return;
    }
    /* temporary */

    await account.updateLanguage(language);

    sendAllIframes('setLanguage', {
      language,
    });

    commit('SET_ACCOUNT_LANGUAGE', language);
  },

  async updateProfilePicture({ commit }, { file }) {
    commit('UPDATE_PROFILE_PICTURE_REQUEST');
    try {
      const {
        data: { photo },
      } = await account.updatePicture(file);

      commit('UPDATE_PROFILE_PICTURE_SUCCESS', photo);
    } catch (error) {
      commit('UPDATE_PROFILE_PICTURE_ERROR', error);
    }
  },

  async removeProfilePicture({ commit }) {
    commit('DELETE_PROFILE_PICTURE_REQUEST');

    try {
      await account.deletePicture();
      commit('DELETE_PROFILE_PICTURE_SUCCESS');
    } catch (error) {
      commit('DELETE_PROFILE_PICTURE_ERROR', error);
    }
  },
};
