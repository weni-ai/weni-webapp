const baseURL = 'http://api-connect.push.al';
import request from './request.js';

export default {
  profile() {
    const token = window.parent.Luigi.auth().store.getAuthData();
    return request.$http(baseURL, token.accessToken).get('/v1/account/my-profile/');
  },
  updateProfile(profile) {
    const token = window.parent.Luigi.auth().store.getAuthData();
    return request.$http(baseURL, token.accessToken).patch('/v1/account/my-profile/', profile);
  },
  updatePicture(file) {
    const token = window.parent.Luigi.auth().store.getAuthData();
    var formData = new FormData();
    formData.append("file", file);
        
    return request.$http(
      baseURL, 
      token.accessToken, 
      { 'Content-Type': 'multipart/form-data' }
    ).post('/v1/account/my-profile/upload_photo/', formData );
  },
  updatePassword(password) {
    const token = window.parent.Luigi.auth().store.getAuthData();
    return request.$http(baseURL, token.accessToken).post('/v1/account/my-profile/change_password/', { password });
  },
  removePicture() {
    const token = window.parent.Luigi.auth().store.getAuthData();
    return request.$http(baseURL, token.accessToken).delete('/v1/account/my-profile/delete_photo/');
  },
};