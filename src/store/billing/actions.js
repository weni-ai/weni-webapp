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

  closeOrganizationPlan(store, { organizationUuid }) {
    return orgs.closeOrgPlan({ organizationUuid });
  },
  reactiveOrganizationPlan(store, { organizationUuid }) {
    return orgs.reactiveOrgPlan({ organizationUuid });
  },

  saveOrganizationAdditionalInformation(
    store,
    {
      organizationUuid,
      personal_identification_number,
      extra_integration,
      additional_billing_info,
    },
  ) {
    return orgs.saveOrganizationAdditionalInformation({
      organizationUuid,
      personal_identification_number,
      extra_integration,
      additional_billing_info,
    });
  },

  billingPricing() {
    return orgs.billingPricing();
  },

  activeContactsLimitForFree() {
    return orgs.activeContactsLimitForFree();
  },

  organizationLimit(store, data) {
    return orgs.organizationLimit(data);
  },

  organizationUniqueInvoice(
    store,
    { organizationUuid, randomId, after, before },
  ) {
    return orgs.organizationUniqueInvoice({
      organizationUuid,
      randomId,
      after,
      before,
    });
  },
  getContactActiveDetailed(store, { projectUUID, start_date, end_date }) {
    return orgs.getContactActiveDetailed({
      projectUUID,
      start_date,
      end_date,
    });
  },
};
