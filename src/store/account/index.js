import request from '../../api/request';

const state = {
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
    const response = await request.$http().get('v1/account/my-profile/');

    commit('setProfile', response.data);
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
};

export default {
  state,
  getters,
  actions,
  mutations,
};
