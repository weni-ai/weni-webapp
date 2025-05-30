import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';

export const useSharedStore = defineStore('shared', () => {
  const user = reactive({
    firstName: '',
    lastName: '',
  });

  function setUser({ firstName, lastName }) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
  }

  const auth = reactive({
    token: '',
  });

  function setAuthToken(token) {
    auth.token = token;
  }

  const currentProjectUuid = ref('');

  function setCurrentProjectUuid(projectUuid) {
    currentProjectUuid.value = projectUuid;
  }

  return {
    user,
    auth,
    current: {
      project: {
        uuid: currentProjectUuid,
      },
    },
    setUser,
    setAuthToken,
    setCurrentProjectUuid,
  };
});
