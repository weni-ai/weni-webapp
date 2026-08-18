import { reactive } from 'vue';
import { defineStore } from 'pinia';

/**
 * Exposed to federated remotes as `connect/sharedStore`, which means it is
 * evaluated inside the container runtime (`remoteEntry.js`) — a module registry
 * separate from the host's. Every module it imports gets a second instance
 * there, so importing the Vuex root store used to duplicate the whole app
 * (router, views, Keycloak client, composable caches). Keep this file free of
 * app imports: state that mirrors Vuex is pushed in from the mutation that
 * owns it, never pulled from here.
 */
export const useSharedStore = defineStore('shared', () => {
  const user = reactive({
    firstName: '',
    lastName: '',
    email: '',
    language: 'en',
  });

  const isActiveFederatedModules = reactive({
    insights: false,
    bulkSend: false,
    chats: false,
  });

  function setIsActiveFederatedModule(module, value) {
    isActiveFederatedModules[module] = value;
  }

  const chats = reactive({
    theme: 'light',
    unreadMessages: 0,
  });

  function setChatsTheme(theme) {
    chats.theme = theme;
  }

  function setChatsUnreadMessages(unreadMessages) {
    chats.unreadMessages = Number(unreadMessages) || 0;
  }

  function setUser({ firstName, lastName, email, language }) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email || '';
    user.language = language || user.language || 'en';
  }

  function setLanguage(language) {
    user.language = language || user.language || 'en';
  }

  const auth = reactive({
    token: '',
  });

  function setAuthToken(token) {
    auth.token = token;
  }

  const currentProject = reactive({
    uuid: undefined,
    type: undefined,
  });

  function setCurrentProject(project) {
    currentProject.uuid = project?.uuid;
    currentProject.type = project?.project_type;
  }

  return {
    user,
    auth,
    current: {
      project: currentProject,
    },
    chats,
    isActiveFederatedModules,
    setUser,
    setLanguage,
    setAuthToken,
    setCurrentProject,
    setIsActiveFederatedModule,
    setChatsTheme,
    setChatsUnreadMessages,
  };
});
