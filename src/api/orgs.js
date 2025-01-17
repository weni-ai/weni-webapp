import request from './request.js';
import billingHttp from './BillingApiInstance.js';
import getEnv from '../utils/env.js';

function forceHttps(completeURL) {
  const url = new URL(completeURL);

  url.protocol = 'https:';

  return url.toString();
}

export default {
  list({ next, ordering }) {
    if (next) {
      return request.$http().get(forceHttps(next));
    }

    return request.$http().get('/v2/organizations/', {
      params: {
        ordering,
      },
    });
  },

  createOrg({
    name,
    description,
    organization_billing_plan,
    authorizations,
    project,
    stripeCustomer,
  }) {
    return request.$http().post('/v2/organizations/', {
      organization: {
        name,
        description,
        organization_billing_plan,
        customer: stripeCustomer,
        authorizations,
      },
      project: {
        name: project.name,
        description: project.description,
        date_format: project.dateFormat,
        timezone: project.timezone,
        template: !!project.templateUuid,
        uuid: project.templateUuid,
        globals: project.globals,
        brain_on: project.brainOn,
      },
    });
  },

  getOrg({ uuid }) {
    return request.$http().get(`/v1/organization/org/${uuid}/`);
  },

  editOrg(uuid, name, description) {
    return request.$http().patch(`/v1/organization/org/${uuid}/`, {
      name,
      description,
    });
  },

  deleteOrg(uuid) {
    return request.$http().delete(`/v1/organization/org/${uuid}/`);
  },

  billingPricing() {
    return request.$http().get('/v1/organization/org/billing/precification/');
  },

  activeContactsLimitForFree() {
    return request
      .$http()
      .get('/v1/organization/org/billing/active-contacts-limit/');
  },

  organizationLimit({ organizationUuid }) {
    // Use the billing url, if it does not exist, consider the previous format via root api.
    const { http, url } = getEnv('BILLING_API_URL')
      ? {
          http: billingHttp,
          url: `/api/v1/orgs/${organizationUuid}/organization-on-limit/`,
        }
      : {
          http: request.$http(),
          url: `/v1/organization/org/billing/organization-on-limit/${organizationUuid}/`,
        };

    return http.get(url);
  },

  getActiveContacts({ organizationUuid, after, before }) {
    /* "projects": [
      {
        "project_uuid": "string",
        "project_name": "string",
        "active_contacts": "integer"
      }
    ] */

    // Use the billing url, if it does not exist, consider the previous format via root api.

    const { http, url, params } = getEnv('BILLING_API_URL')
      ? {
          http: billingHttp,
          url: `/api/v1/orgs/${organizationUuid}/active-contacts/`,
          params: { start_date: after, end_date: before },
        }
      : {
          http: request.$http(),
          url: `/v1/organization/org/grpc/contact-active/${organizationUuid}/`,
          params: { after, before },
        };
    return http.get(url, {
      params,
    });
  },

  setupIntentWithOrg({ organizationUuid }) {
    return request
      .$http()
      .get(`/v1/organization/org/invoice/setup_intent/${organizationUuid}/`);
  },

  setupIntent() {
    return request.$http().post('/v1/billing/setup-intent/');
  },

  setupPlan({ plan, customer }) {
    return request.$http().post('v1/billing/setup-plan/', {
      plan: plan.toLowerCase(),
      customer,
    });
  },

  plansPricing() {
    return request.$http().get('/v1/organization/org/billing/precification/');
  },

  removeCreditCard({ organizationUuid }) {
    return request
      .$http()
      .get(`/v1/organization/org/remove-card-setup/${organizationUuid}/`);
  },

  changeOrganizationPlan({ organizationUuid, plan }) {
    return request
      .$http()
      .patch(`/v1/organization/org/billing/change-plan/${organizationUuid}/`, {
        organization_billing_plan: plan.toLowerCase(),
      });
  },

  getOrgInvoices({
    organizationUuid,
    ordering,
    search,
    start_due_date,
    end_due_date,
    payment_status,
    offset,
    limit,
  }) {
    return request.$http().get('/v1/organization/invoice/', {
      params: {
        organization: organizationUuid,
        ordering,
        search,
        start_due_date,
        end_due_date,
        payment_status,
        offset,
        limit,
      },
    });
  },

  getMembers(uuid, offset, limit, search) {
    const searchQuery = search && search.length > 0 ? `&search=${search}` : '';
    return request
      .$http()
      .get(
        `/v1/organization/authorizations/?organization=${uuid}&limit=${limit}&offset=${offset}${searchQuery}`,
      );
  },

  addAuthorization(orgId, username, role) {
    return request
      .$http()
      .put(`/v1/organization/authorizations/${orgId}/${username}/`, {
        role: role,
      });
  },

  removeAuthorization(orgId, username) {
    return request
      .$http()
      .delete(`/v1/organization/authorizations/${orgId}/${username}/`);
  },

  changeAuthorization(orgId, username, role) {
    return request
      .$http()
      .patch(`/v1/organization/authorizations/${orgId}/${username}/`, {
        role: role,
      });
  },

  createRequestPermission({ organizationUuid, email, role }) {
    return request.$http().post('/v1/organization/request-permission/', {
      organization: organizationUuid,
      email,
      role,
    });
  },

  deleteRequestPermission({ id, organization }) {
    return request
      .$http()
      .delete(`/v1/organization/request-permission/${id}/`, {
        params: {
          organization,
        },
      });
  },

  listRequestPermission({ organization, page = 1, limit = 20 }) {
    const offset = limit * (page - 1);

    return request.$http().get('/v1/organization/request-permission/', {
      params: {
        organization,
        offset,
        limit,
      },
    });
  },

  leaveOrg(orgId, userId) {
    return request
      .$http()
      .delete(
        `/v1/organization/authorizations/${orgId}/${userId}/remove_my_user/`,
      );
  },

  closeOrgPlan({ organizationUuid }) {
    return request
      .$http()
      .patch(`/v1/organization/org/billing/closing-plan/${organizationUuid}/`);
  },

  reactiveOrgPlan({ organizationUuid }) {
    return request
      .$http()
      .patch(
        `/v1/organization/org/billing/reactivate-plan/${organizationUuid}/`,
      );
  },

  saveOrganizationAdditionalInformation({
    organizationUuid,
    personal_identification_number,
    extra_integration,
    additional_billing_info,
  }) {
    return request
      .$http()
      .post(
        `/v1/organization/org/billing/add-additional-information/${organizationUuid}/`,
        {
          extra_integration,
          additional_billing_info,
          personal_identification_number,
        },
      );
  },
  organizationUniqueInvoice({ organizationUuid, randomId, after, before }) {
    return request
      .$http()
      .get(`/v1/organization/invoice/invoice-data/${organizationUuid}/`, {
        params: {
          invoice_id: randomId,
          after: after,
          before: before,
        },
      });
  },
  getContactActiveDetailed({ projectUUID, after, before }) {
    // Use the billing url, if it does not exist, consider the previous format via root api.
    const { http, url, params } = getEnv('BILLING_API_URL')
      ? {
          http: billingHttp,
          url: `/api/v1/projects/${projectUUID}/get-contact-active-detailed/`,
          params: { start_date: after, end_date: before },
        }
      : {
          http: request.$http(),
          url: `/v1/organization/project/grpc/get-contact-active-detailed/${projectUUID}/`,
          params: { after, before },
        };
    return http.get(url, {
      params,
    });
  },

  verifyCreditCard({ customer }) {
    return request
      .$http()
      .post(`/v1/organization/org/billing/validate-customer-card/`, {
        customer,
      });
  },
};
