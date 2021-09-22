export default {
  setBillingOrgStep({ commit }, org) {
    commit('BILLING_ORG_STEP', org);
  },
  setBillingMembersStep({ commit }, { users, userChanges }) {
    commit('BILLING_MEMBERS_STEP', { users, userChanges });
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
};
