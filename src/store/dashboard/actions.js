import dashboard from '../../api/dashboard';

export default {
  getStatus(store, { orgId, projectUuid }) {
    return dashboard.status(orgId, projectUuid);
  },

  // eslint-disable-next-line no-unused-vars
  getNewsletterList(store, { orgId, projectUuid, page = 1, limit = 10 }) {
    const offset = limit * (page - 1);
    return dashboard.newsletterList(orgId, offset, limit);
  },

  newsletter(store, { orgId, id }) {
    return dashboard.newsletter(orgId, id);
  },
};
