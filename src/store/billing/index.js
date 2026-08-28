import { defineStore } from 'pinia';
import orgs from '@/api/orgs';

export const useBillingStore = defineStore('Billing', () => {
  function getOrgInvoices({
    organizationUuid,
    ordering,
    search,
    start_due_date,
    end_due_date,
    payment_status,
    offset = 0,
    limit = 20,
  }) {
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
  }

  function getActiveContacts({ organizationUuid, after, before }) {
    return orgs.getActiveContacts({ organizationUuid, after, before });
  }

  function setupIntent({ organizationUuid }) {
    return orgs.setupIntent({ organizationUuid });
  }

  function removeCreditCard({ organizationUuid }) {
    return orgs.removeCreditCard({ organizationUuid });
  }

  function closeOrganizationPlan({ organizationUuid }) {
    return orgs.closeOrgPlan({ organizationUuid });
  }

  function reactiveOrganizationPlan({ organizationUuid }) {
    return orgs.reactiveOrgPlan({ organizationUuid });
  }

  function saveOrganizationAdditionalInformation({
    organizationUuid,
    personal_identification_number,
    extra_integration,
    additional_billing_info,
  }) {
    return orgs.saveOrganizationAdditionalInformation({
      organizationUuid,
      personal_identification_number,
      extra_integration,
      additional_billing_info,
    });
  }

  function billingPricing() {
    return orgs.billingPricing();
  }

  function activeContactsLimitForFree() {
    return orgs.activeContactsLimitForFree();
  }

  function organizationUniqueInvoice({
    organizationUuid,
    randomId,
    after,
    before,
  }) {
    return orgs.organizationUniqueInvoice({
      organizationUuid,
      randomId,
      after,
      before,
    });
  }

  function getContactActiveDetailed({ projectUUID, after, before }) {
    return orgs.getContactActiveDetailed({
      projectUUID,
      after,
      before,
    });
  }

  return {
    getOrgInvoices,
    getActiveContacts,
    setupIntent,
    removeCreditCard,
    closeOrganizationPlan,
    reactiveOrganizationPlan,
    saveOrganizationAdditionalInformation,
    billingPricing,
    activeContactsLimitForFree,
    organizationUniqueInvoice,
    getContactActiveDetailed,
  };
});
