import account from '../../api/account';

export default {
  getPofile() {
    return account.profile();
  },
  updateProfile(store, { profile }) {
    return account.updateProfile(profile);
  },
  updatePicture(store, { file }) {
    return account.updatePicture(file);
  },
  updatePassword(store, { password }) {
    return account.updatePassword(password)
  },
  removePicture() {
    return account.removePicture();
  },
  deleteProfile(store, { password }) {
    return account.deleteProfile(password)
  },

  updateProfileLanguage(store, { language }) {
    return account.updateProfileLanguage({ language });
  },
}