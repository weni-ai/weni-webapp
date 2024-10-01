import { reactive } from 'vue';
import projects from '../../api/projects';
import actions from './actions';
import mutations from './mutations';

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
  recentActivities: reactive({}),
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
