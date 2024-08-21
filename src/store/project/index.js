import { reactive } from 'vue';
import projects from '../../api/projects';
import actions from './actions';
import mutations from './mutations';

const recentActivities = {};

const state = {
  currentProject: null,
  loadingCreateProject: false,
  errorCreateProject: null,
  templates: {
    status: null,
    data: [],
  },
  championChatbots: {},
  projects: [],
  recentActivities: new Proxy(recentActivities, {
    get(target, name, receiver) {
      if (!Reflect.has(target, name)) {
        const recentActivities = reactive({
          status: null,
          next: null,
          data: [],
        });

        recentActivities.loadNext = async () => {
          recentActivities.status = 'loading';

          await projects
            .latestActivities({
              projectUuid: name,
              limit: 20,
              next: recentActivities.next,
            })
            .then(({ data }) => {
              if (data.next) {
                const url = new URL(data.next);
                const cursor = url.searchParams.get('cursor');
                recentActivities.next = cursor;
              }

              const results = [...recentActivities.data, ...data.results];

              recentActivities.data = results.filter(
                (value, index, self) =>
                  index ===
                  self.findIndex(
                    (item) =>
                      item.user === value.user &&
                      item.created_at === value.created_at,
                  ),
              );

              recentActivities.status = data.next == null ? 'complete' : null;
            })
            .catch(() => {
              console.log('error');
              if (recentActivities.status !== 'complete') {
                recentActivities.status = 'error';
              }
            });
        };

        Reflect.set(target, name, recentActivities, receiver);
      }

      return Reflect.get(target, name, receiver);
    },
  }),
};

const getters = {
  currentProject(state) {
    return state.currentProject;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
