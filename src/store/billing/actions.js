import orgs from '../../api/orgs';

export default {
  getOrgInvoices(
    store,
    {
      organizationUuid,
      ordering,
      search,
      start_due_date,
      end_due_date,
      payment_status,
      offset = 0,
      limit = 20,
    },
  ) {
    return orgs.getOrgInvoices({
      organizationUuid,
      ordering,
      search,
      start_due_date,
      end_due_date,
      payment_status,
      offset,
      limit,
    });
  },

  getActiveContacts(store, { organizationUuid, after, before }) {
    return orgs.getActiveContacts({ organizationUuid, after, before });
  },

  setupIntent(store, { organizationUuid }) {
    return orgs.setupIntent({ organizationUuid });
  },

  removeCreditCard(store, { organizationUuid }) {
    return orgs.removeCreditCard({ organizationUuid });
  },

  changeOrganizationPlan(store, { organizationUuid, plan }) {
    return orgs.changeOrganizationPlan({ organizationUuid, plan });
  },
};
