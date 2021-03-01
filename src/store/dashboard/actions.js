import dashboard from '../../api/dashboard';

export default {
  getStatus(store, { orgId }) {
    return dashboard.status(orgId)
  },
    
  getNewsletterList(store, { orgId, page = 1, limit = 10 }) {
    const offset = limit*(page - 1);
    return dashboard.status(orgId, offset, limit)
  },
    
  newsletter(store, { orgId, id }) {
    return dashboard.newsletter(orgId, id)
  },
};