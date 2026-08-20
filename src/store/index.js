import { createStore } from 'vuex';
import Org from './org';
import Project from './project';

const store = createStore({
  modules: {
    Org,
    Project,
  },
});

export default store;
