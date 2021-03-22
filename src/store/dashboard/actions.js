import dashboard from '../../api/dashboard';

export default {
  getStatus(store, { orgId, projectUuid }) {
    return dashboard.status(orgId, projectUuid)
  },
    
  getNewsletterList(store, { orgId, projectUuid, page = 1, limit = 10 }) {
    const offset = limit*(page - 1);
    return dashboard.status(orgId, projectUuid, offset, limit)
  },
    
  newsletter(store, { orgId, id }) {
    return dashboard.newsletter(orgId, id)
  },
};