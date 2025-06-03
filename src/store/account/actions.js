import account from '../../api/account';
import sendAllIframes from '../../utils/plugins/sendAllIframes';
import i18n from '../../utils/plugins/i18n';

export default {
  async fetchProfile({ commit, state }) {
    commit('PROFILE_REQUEST');

    try {
      const response = await account.profile();

      commit('PROFILE_SUCCESS', response.data);

      const language = response.data.language;
      i18n.global.locale = language === 'en-us' ? 'en' : language;
      commit('SET_ACCOUNT_LANGUAGE', language);

      if (!response.data.last_update_profile) {
        state.additionalInformation.status = 'loading';

        account
          .getCompanyInfo()
          .then(({ data }) => {
            state.additionalInformation.status = 'loaded';

            if (data instanceof Array && data.length) {
              state.additionalInformation.data = data[0];
            }
          })
          .catch(() => {
            state.additionalInformation.status = 'error';
          });
      }
    } catch (e) {
      commit('PROFILE_ERROR', e);
    }
  },

  async updateProfile({ commit, state }, data) {
    try {
      commit('UPDATE_PROFILE_REQUEST');
      const response = await account.updateProfile(data);
      commit('UPDATE_PROFILE_SUCCESS', {
        ...response.data,
        last_update_profile: state.profile.last_update_profile,
      });
    } catch (e) {
      commit('UPDATE_PROFILE_ERROR', e);
    }
  },

  async updateAccountLanguage({ commit }, { language }) {
    const lastLanguage = i18n.global.locale;
    i18n.global.locale = language === 'en-us' ? 'en' : language;
    commit('SET_ACCOUNT_LANGUAGE', language);

    const { data } = await account.updateLanguage(language);

    const dataLanguage = data?.language === 'en-us' ? 'en' : data?.language;

    if (dataLanguage !== language) {
      i18n.global.locale = lastLanguage;
      commit('SET_ACCOUNT_LANGUAGE', lastLanguage);
    }

    sendAllIframes('setLanguage', {
      language,
    });
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
      throw error;
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

  async addInitialInfo({ commit }, { company, user }) {
    try {
      const {
        data: { user: userResponse },
      } = await account.addInitialData({ company, user });

      return userResponse;
    } catch (error) {
      commit('UPDATE_PROFILE_INITIAL_INFO_ERROR', error);
      throw error;
    }
  },

  updateProfile2FAStatus({ commit }, status) {
    commit('UPDATE_PROFILE_2FA_STATUS', status);
  },

  updateEmailPreferences({ commit }, { receiveOrganization, receiveProject }) {
    commit('UPDATE_EMAIL_PREFERENCES', { receiveOrganization, receiveProject });
  },
};
