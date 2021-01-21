import request from './request.js';

export default {
  profile() {
    return request.$http().get('v1/account/my-profile/');
  },
  updateProfile(profile) {
    return request.$http().patch('v1/account/my-profile/', profile);
  },
  updatePicture(file) {
    var formData = new FormData();
    formData.append("file", file);
        
    return request.$http(
      { 'Content-Type': 'multipart/form-data' }
    ).post('v1/account/my-profile/upload_photo/', formData );
  },
  updatePassword(password) {
    return request.$http().post('v1/account/my-profile/change_password/', { password });
  },
  removePicture() {
    return request.$http().delete('v1/account/my-profile/delete_photo/');
  },
  deleteProfile(password) {
    return request.$http().delete('v1/account/my-profile/', { password });
  },
};