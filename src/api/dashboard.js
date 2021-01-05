const baseURL = 'http://api-connect.push.al';
import request from './request.js';

export default {
    status() {
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token.accessToken).get('/v1/dashboard/status-service/');
    },

    newsletterList(page = 1, limit = 10) {
        const offset = limit*(page - 1);
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token.accessToken).get(`/v1/dashboard/newsletter/?offset=${offset}&limit=${limit}`);
    },

    newsletterRead(id) {
        const token = window.parent.Luigi.auth().store.getAuthData();
        return request.$http(baseURL, token).get(`/v1/dashboard/newsletter/${id}`);
    },
};