export default {
  BILLING_ORG_STEP: (state, org) => {
    if (state.current === 0 && org && org.name && org.description) {
      state.org = org;
      state.current = state.current + 1;
    }
  },
  BILLING_MEMBERS_STEP: (state, { users }) => {
    state.users = users;
    if (state.current === 1) state.current = state.current + 1;
  },
  BILLING_PROJECT_STEP: (state, project) => {
    if (
      state.current === 2 &&
      project &&
      project.name &&
      project.dateFormat &&
      project.timeZone &&
      project.format
    ) {
      state.project = {
        name: project.name,
        description: project.description,
        dateFormat: project.dateFormat,
        timeZone: project.timeZone,
        format: project.format,
        globals: project.globals,
      };
    }
  },
  BILLING_BACK: (state) => {
    if (state.current !== 0) state.current = state.current - 1;
  },
  BILLING_FINISH_STEPS: (state) => {
    state.currentModal = 'success';
  },
  BILLING_STEP_ORG: (state, step) => {
    state.current = step;
  },
  BILLING_STEP: (state, step) => {
    state.currentModal = step;
  },
  BILLING_NEXT_STEPS: (state) => {
    state.currentModal++;
  },
  BILLING_UPDATE_INTEGRATION: (state, { type, payload }) => {
    switch (type) {
      case 'add':
        if (state.integrations >= 1 && state.integrations < 10)
          state.integrations = String(Number(state.integrations) + 1);

        break;

      case 'subtract':
        if (state.integrations > 1 && state.integrations <= 10)
          state.integrations = String(Number(state.integrations) - 1);

        break;

      case 'update':
        state.integrations = payload;
        break;

      default:
        break;
    }
  },

  SET_WHATSAPP_INTEGRATIONS_ACTIVE: (state, isActive) => {
    state.isActiveNewWhatsappIntegrations = isActive;
  },

  SET_INTEGRATIONS_COUNT: (state, count) => {
    state.integrations = String(count);
  },

  SET_PRICING_STATUS: (state, status) => {
    state.pricing.status = status;
  },

  SET_PRICING_PLANS: (state, plans) => {
    state.pricing.plans = plans;
  },

  SET_BILLING_CPF_CNPJ: (state, value) => {
    state.billing_details.cpfOrCnpj = value;
  },

  SET_BILLING_NAME: (state, value) => {
    state.billing_details.name = value;
  },

  SET_BILLING_ADDITIONAL_INFO: (state, value) => {
    state.billing_details.additionalInformation = value;
  },

  SET_BILLING_CUSTOMER: (state, value) => {
    state.billing_details.customer = value;
  },

  SET_BILLING_ADDRESS: (state, { field, value }) => {
    state.billing_details.address[field] = value;
  },

  RESET_BILLING_DETAILS: (state) => {
    state.billing_details.cpfOrCnpj = '';
    state.billing_details.name = '';
    state.billing_details.additionalInformation = '';
    state.billing_details.address.city = '';
    state.billing_details.address.country = '';
    state.billing_details.address.state = '';
    state.billing_details.address.line1 = '';
    state.billing_details.address.postal_code = '';
  },
};
