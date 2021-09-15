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
};
