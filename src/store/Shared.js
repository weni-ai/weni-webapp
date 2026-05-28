import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';
import rootStore from '@/store';

export function getSharedProjectUuid(fallback = '') {
  return rootStore.state.Project.currentProject?.uuid || fallback || '';
}

export function getRouteProjectUuid(route) {
  if (route.params?.projectUuid) {
    return route.params.projectUuid;
  }

  const matchedUuid = route.matched
    .map((record) => record.params?.projectUuid)
    .find(Boolean);

  return matchedUuid || '';
}

export function useSharedProjectContext() {
  const route = useRoute();
  const sharedStore = useSharedStore();

  const projectUuid = computed(() =>
    getSharedProjectUuid(getRouteProjectUuid(route)),
  );

  const canLoadFederatedModule = computed(
    () => Boolean(sharedStore.auth.token && projectUuid.value),
  );

  return {
    sharedStore,
    projectUuid,
    canLoadFederatedModule,
  };
}

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
  });

  function setIsActiveFederatedModule(module, value) {
    isActiveFederatedModules[module] = value;
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

  const current = computed(() => ({
    project: {
      uuid: rootStore.state.Project.currentProject?.uuid,
      type: rootStore.state.Project.currentProject?.project_type,
    },
  }));

  return {
    user,
    auth,
    current,
    isActiveFederatedModules,
    setUser,
    setLanguage,
    setAuthToken,
    setIsActiveFederatedModule,
  };
});
