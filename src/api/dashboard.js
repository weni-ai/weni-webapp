import request from './request.js';

export default {
    status() {
        return request.$http().get('/v1/dashboard/status-service/');
    },

    newsletterList(page = 1, limit = 10) {
        const offset = limit*(page - 1);
        return request.$http().get(`/v1/dashboard/newsletter/?offset=${offset}&limit=${limit}`);
    },

    newsletterRead(id) {
        return request.$http().get(`/v1/dashboard/newsletter/${id}`);
    },
};