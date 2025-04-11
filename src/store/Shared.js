import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';

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

  const currentProjectUuid = computed(() => {
    const route = useRoute();
    return route.params.projectUuid;
  });

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
  }
});
