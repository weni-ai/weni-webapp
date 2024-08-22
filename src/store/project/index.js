import { reactive } from 'vue';
import projects from '../../api/projects';
import actions from './actions';
import mutations from './mutations';

const recentActivities = {};
const championChatbots = {};

function isUuid(value) {
  if (typeof value !== 'string') {
    return;
  }

  const uuidRegExp =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  return uuidRegExp.test(value);
}

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

  championChatbots2: new Proxy(championChatbots, {
    get(_target, uuid) {
      if (!isUuid(uuid)) {
        return;
      }

      if (!championChatbots[uuid]) {
        const championChatbot = reactive({
          status: null,
          data: {
            createdFlow: false,
            addedTestChannel: false,
            addedChannelToTheProject: false,
            createdOrIntegratedAI: false,
            addedToOwnChannel: false,
          },
        });

        championChatbots[uuid] = championChatbot;

        championChatbot.status = 'loading';

        console.log('vai recuperar', uuid);

        projects
          .apiFlowsGetSuccessOrg({ flowUuid: uuid })
          .then(
            ({
              has_ia,
              has_flows,
              has_channel,
              has_msg,
              has_channel_production,
            }) => {
              championChatbot.status = null;

              championChatbot.data.createdFlow = has_flows;
              championChatbot.data.addedTestChannel = has_channel;
              championChatbot.data.addedChannelToTheProject = has_msg;
              championChatbot.data.createdOrIntegratedAI = has_ia;
              championChatbot.data.addedToOwnChannel = has_channel_production;
            },
          )
          .catch(() => {
            championChatbot.status = 'error';
          });
      }

      return championChatbots[uuid];
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
