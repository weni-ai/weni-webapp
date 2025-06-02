import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import rootStore from '@/store';

export const useSharedStore = defineStore('shared', () => {
  const user = reactive({
    firstName: '',
    lastName: '',
    email: '',
    language: 'en',
  });

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

  const currentProjectUuid = ref('');
  const currentProjectType = computed(
    () => rootStore.state.Project.currentProject?.project_type,
  );

  function setCurrentProjectUuid(projectUuid) {
    currentProjectUuid.value = projectUuid;
  }

  return {
    user,
    auth,
    current: {
      project: {
        uuid: currentProjectUuid,
        type: currentProjectType,
      },
    },
    setUser,
    setLanguage,
    setAuthToken,
    setCurrentProjectUuid,
  };
});
