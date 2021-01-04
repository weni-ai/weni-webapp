const baseURL = 'http://api-connect.push.al';
import request from './request.js';

export default {
    status() {
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token.accessToken).get('/v1/dashboard/status-service/');
    },

    newsletterList() {
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token).get('/v1/dashboard_newsletter_list');
    },

    newsletterRead(id) {
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token).get(`/v1/dashboard_newsletter_read/${id}`);
    },
};