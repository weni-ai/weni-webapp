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
      project.timeZone
    ) {
      state.project = {
        name: project.name,
        dateFormat: project.dateFormat,
        timeZone: project.timeZone,
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
};
