import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import projectsApi from '@/api/projects';
import { useSharedStore } from '@/store/Shared';

function isUuid(value) {
  if (typeof value !== 'string') {
    return;
  }

  const uuidRegExp =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  return uuidRegExp.test(value);
}

export const useProjectStore = defineStore('Project', () => {
  const currentProject = ref(null);
  const loadingCreateProject = ref(false);
  const errorCreateProject = ref(null);
  const templates = reactive({
    status: null,
    data: [],
  });
  const championChatbots = ref({});
  const projects = ref([]);
  const recentActivities = ref({});

  const championChatbotsCache = {};
  const championChatbots2 = new Proxy(championChatbotsCache, {
    get(_target, uuid) {
      if (!isUuid(uuid)) {
        return;
      }

      if (!championChatbotsCache[uuid]) {
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

        championChatbotsCache[uuid] = championChatbot;

        championChatbot.status = 'loading';

        projectsApi
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

      return championChatbotsCache[uuid];
    },
  });

  function setSharedCurrentProject(project) {
    useSharedStore().setCurrentProject(project);
  }

  function setCurrentProjectState(project) {
    currentProject.value = project;
    setSharedCurrentProject(project);
  }

  function setChampionChatbot(value) {
    championChatbots.value = {
      ...championChatbots.value,
      [value.flowUuid]: value,
    };
  }

  function setRecentActivities(nextRecentActivities) {
    recentActivities.value = nextRecentActivities;
  }

  function PROJECT_CREATE_REQUEST() {
    loadingCreateProject.value = true;
  }

  function PROJECT_CREATE_SUCCESS(project) {
    const orgProjects = projects.value.find(
      ({ orgUuid }) => orgUuid === project.organization,
    );

    if (orgProjects) {
      orgProjects.data.push(project);
    }

    currentProject.value = project;
    loadingCreateProject.value = false;

    setSharedCurrentProject(project);
  }

  function PROJECT_CREATE_ERROR(createProjectError) {
    errorCreateProject.value = createProjectError;
    loadingCreateProject.value = false;
  }

  function getCurrentProject() {
    const object = window.localStorage.getItem('project');
    if (object) return JSON.parse(object);
    return null;
  }

  function getProject({ uuid }) {
    return projectsApi.getProject({ uuid });
  }

  function getProjects({ orgId, page = 1, limit = 20, ordering }) {
    const offset = limit * (page - 1);
    return projectsApi.list(orgId, offset, limit, ordering);
  }

  async function loadProjects({ orgUuid, ordering }) {
    let projectsByOrg = projects.value.find(
      (orgProjects) => orgProjects.orgUuid === orgUuid,
    );

    if (!projectsByOrg) {
      projectsByOrg = {
        orgUuid,
        status: null,
        next: null,
        data: [],
      };

      projects.value.push(projectsByOrg);
    }

    if (['complete', 'loading'].includes(projectsByOrg.status)) {
      return;
    }

    projectsByOrg.status = 'loading';

    const { data } = await projectsApi.v2List({
      params: projectsByOrg.next
        ? Object.fromEntries(new URL(projectsByOrg.next).searchParams)
        : {
            organization: orgUuid,
            offset: 0,
            limit: 12,
            ordering,
          },
    });

    projectsByOrg.status = null;
    projectsByOrg.next = data.next;

    if (projectsByOrg.next === null) {
      projectsByOrg.status = 'complete';
    }

    data.results.forEach((project) => {
      projectsByOrg.data.push(project);
    });

    const projectIndex = projects.value.findIndex(
      (orgProjects) => orgProjects.orgUuid === projectsByOrg.orgUuid,
    );

    projects.value[projectIndex] = { ...projectsByOrg };

    return data;
  }

  async function changeReadyMadeProjectProperties({
    projectUuid,
    first_access,
  }) {
    const { data } = await projectsApi.changeReadyMadeProjectProperties({
      projectUuid,
      first_access,
    });

    setCurrentProjectState({
      ...currentProject.value,
      first_access: data.first_access,
    });
  }

  function editProject({
    name,
    organization,
    projectUuid,
    timezone,
    description,
    language,
    currency,
  }) {
    return projectsApi.editProject({
      name,
      organization,
      projectUuid,
      timezone,
      description,
      language,
      currency,
    });
  }

  function deleteProject({ uuid }) {
    return projectsApi.deleteProject(uuid);
  }

  function setCurrentProject({
    uuid,
    name,
    description,
    timezone,
    language,
    currency,
    menu = {
      chat: [],
      flows: '',
      inteligence: '',
    },
    organization = {
      uuid: '',
    },
    flow_organization = {
      uuid: '',
      id: '',
    },
    first_access,
    flow_uuid,
    flow_count,
    project_type,
    template_type,
    project_mode,
    authorization,
    created_at,
  } = {}) {
    const projectInfo = {
      uuid,
      name,
      description,
      timezone,
      language,
      currency,
      menu,
      organization,
      flow_organization,
      first_access,
      flow_uuid,
      flow_count,
      project_type,
      template_type,
      project_mode,
      redirect_url: '',
      authorization,
      created_at,
    };

    setCurrentProjectState({
      ...currentProject.value,
      ...projectInfo,
    });
  }

  async function updateProjectHasWppChannel({ projectUuid }) {
    try {
      const { data } = await projectsApi.listChannels({
        projectUuid,
        channelType: 'WAC',
        excludeWppDemo: true,
      });

      const hasWppChannel = data.channels.some(
        (channel) => channel.is_active === true,
      );

      setCurrentProjectState({
        ...currentProject.value,
        has_wpp_channel: hasWppChannel || false,
      });
    } catch (error) {
      setCurrentProjectState({
        ...currentProject.value,
        has_wpp_channel: false,
      });
    }
  }

  function clearCurrentProject() {
    setCurrentProjectState(null);
  }

  async function createOrUpdateProjectAuthorization({
    email,
    projectUuid,
    role,
    chatRole,
    hasChat,
  }) {
    return projectsApi.createProjectAuthorization({
      email,
      projectUuid,
      role,
      chatRole,
      hasChat,
    });
  }

  async function removeProjectAuthorization({ email, projectUuid }) {
    return projectsApi.deleteProjectAuthorization({
      email,
      projectUuid,
    });
  }

  async function getSuccessOrgStatusByFlowUuid({ flowUuid, force }) {
    try {
      if (!championChatbots.value[flowUuid] || force) {
        const {
          has_ia,
          has_flows,
          has_channel,
          has_msg,
          has_channel_production,
        } = await projectsApi.apiFlowsGetSuccessOrg({ flowUuid });

        setChampionChatbot({
          flowUuid,
          has_ia,
          has_flows,
          has_channel,
          has_msg,
          has_channel_production,
        });
      }

      return championChatbots.value[flowUuid];
    } catch (error) {
      setChampionChatbot({
        flowUuid,
        error: true,
      });

      throw error;
    }
  }

  async function getRecentActivities(projectUuid) {
    if (!recentActivities.value[projectUuid]) {
      setRecentActivities({
        ...recentActivities.value,
        [projectUuid]: {
          status: null,
          next: null,
          data: [],
        },
      });
    }

    const projectRecentActivities = recentActivities.value[projectUuid];

    if (
      projectRecentActivities.status === 'loading' ||
      projectRecentActivities.status === 'complete'
    ) {
      return;
    }

    setRecentActivities({
      ...recentActivities.value,
      [projectUuid]: {
        ...projectRecentActivities,
        status: 'loading',
      },
    });

    try {
      const response = await projectsApi.latestActivities({
        projectUuid: projectUuid,
        limit: 20,
        next: projectRecentActivities.next,
      });

      const { data } = response;

      let nextCursor = null;
      if (data.next) {
        const url = new URL(data.next);
        nextCursor = url.searchParams.get('cursor');
      }

      const newData = [...projectRecentActivities.data, ...data.results];
      const filteredData = newData.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (item) =>
              item.user === value.user && item.created_at === value.created_at,
          ),
      );

      setRecentActivities({
        ...recentActivities.value,
        [projectUuid]: {
          ...projectRecentActivities,
          status: data.next === null ? 'complete' : null,
          next: nextCursor,
          data: filteredData,
        },
      });
    } catch (error) {
      if (projectRecentActivities.status !== 'complete') {
        setRecentActivities({
          ...recentActivities.value,
          [projectUuid]: {
            ...projectRecentActivities,
            status: 'error',
          },
        });
      }
    }
  }

  return {
    currentProject,
    loadingCreateProject,
    errorCreateProject,
    templates,
    championChatbots,
    projects,
    recentActivities,
    championChatbots2,
    setCurrentProjectState,
    setChampionChatbot,
    setRecentActivities,
    PROJECT_CREATE_REQUEST,
    PROJECT_CREATE_SUCCESS,
    PROJECT_CREATE_ERROR,
    getCurrentProject,
    getProject,
    getProjects,
    loadProjects,
    changeReadyMadeProjectProperties,
    editProject,
    deleteProject,
    setCurrentProject,
    updateProjectHasWppChannel,
    clearCurrentProject,
    createOrUpdateProjectAuthorization,
    removeProjectAuthorization,
    getSuccessOrgStatusByFlowUuid,
    getRecentActivities,
  };
});
