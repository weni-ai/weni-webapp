export default {
  setBillingOrgStep({ commit }, org) {
    commit('BILLING_ORG_STEP', org);
  },
  setBillingMembersStep({ commit }, { users }) {
    commit('BILLING_MEMBERS_STEP', { users });
  },
  setBillingProjectStep({ commit }, project) {
    commit('BILLING_PROJECT_STEP', project);
  },
  backBilling({ commit }) {
    commit('BILLING_BACK');
  },
  finishBillingSteps({ commit }) {
    commit('BILLING_FINISH_STEPS');
  },
  resetBillingSteps({ commit }) {
    commit('BILLING_STEP_ORG', 0);
    commit('BILLING_STEP', 'plans');
  },
  setBillingStep({ commit }, step) {
    commit('BILLING_STEP', step);
  },
  nextBillingStep({ commit }) {
    commit('BILLING_NEXT_STEPS');
  },
  addIntegration({ commit }) {
    commit('BILLING_UPDATE_INTEGRATION', { type: 'add' });
  },
  removeIntegration({ commit }) {
    commit('BILLING_UPDATE_INTEGRATION', { type: 'subtract' });
  },
  updateIntegration({ commit }, payload) {
    commit('BILLING_UPDATE_INTEGRATION', { type: 'update', payload });
  },

  setWhatsappIntegrationsActive({ commit }, isActive) {
    commit('SET_WHATSAPP_INTEGRATIONS_ACTIVE', isActive);
  },

  setIntegrationsCount({ commit }, count) {
    commit('SET_INTEGRATIONS_COUNT', count);
  },

  setPricingStatus({ commit }, status) {
    commit('SET_PRICING_STATUS', status);
  },

  setPricingPlans({ commit }, plans) {
    commit('SET_PRICING_PLANS', plans);
  },

  fetchPricingPlans({ commit, dispatch }, orgApi) {
    dispatch('setPricingStatus', 'loading');

    return orgApi.plansPricing().then(({ data }) => {
      dispatch('setPricingStatus', 'loaded');
      dispatch('setPricingPlans', data.plans);
    });
  },

  setBillingCpfCnpj({ commit }, value) {
    commit('SET_BILLING_CPF_CNPJ', value);
  },

  setBillingName({ commit }, value) {
    commit('SET_BILLING_NAME', value);
  },

  setBillingAdditionalInfo({ commit }, value) {
    commit('SET_BILLING_ADDITIONAL_INFO', value);
  },

  setBillingCustomer({ commit }, value) {
    commit('SET_BILLING_CUSTOMER', value);
  },

  setBillingAddress({ commit }, { field, value }) {
    commit('SET_BILLING_ADDRESS', { field, value });
  },

  resetBillingDetails({ commit }) {
    commit('RESET_BILLING_DETAILS');
  },

  setupIntentWithOrg({ dispatch }, { orgApi, orgUuid }) {
    return orgApi
      .setupIntentWithOrg({ organizationUuid: orgUuid })
      .then((response) => {
        dispatch('setBillingCustomer', response?.data?.customer);
        return response?.data?.client_secret;
      });
  },
};
