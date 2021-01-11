const baseURL = 'http://api-connect.push.al';
import request from './request.js';

export default {
    profile() {
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token.accessToken).get('/v1/account/my-profile/');
    },
};