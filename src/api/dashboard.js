import request from './request.js';

export default {
    status() {
        return request.$http().get('/v1/dashboard/status-service/');
    },

    newsletterList(orgId, offset, limit) {
        return request.$http().get(`/v1/dashboard/newsletter/?offset=${offset}&limit=${limit}`);
    },

    newsletter(orgId, id) {
        return request.$http().get(`/v1/dashboard/newsletter/${id}`);
    },
};