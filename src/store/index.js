import { createStore } from 'vuex';
import Project from './project';

const store = createStore({
  modules: {
    Project,
  },
});

export default store;
