import request from '../../api/request';
import account from '../../api/account';

export default {
  async fetchProfile({ commit }) {
    commit('SET_ACCOUNT_LOADING', true);

    try {
      const response = await account.profile();

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
