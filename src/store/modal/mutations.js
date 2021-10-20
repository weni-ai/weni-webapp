export default {
  OPEN_MODAL: (state, data) => {
    state.actives.push(data);
  },

  CLOSE_MODAL: (state, id) => {
    state.actives = state.actives.filter((active) => active.id !== id);
  },
};
