<template>
  <div class="project-home-redirect">
    <img
      class="logo"
      src="@/assets/LogoWeniAnimada.svg"
      alt="Loading..."
    />
  </div>
</template>

<script>
import env from '@/utils/env';
import { PROJECT_ROLE_CHATUSER } from '@/components/users/permissionsObjects.js';

export default {
  name: 'ProjectHomeRedirect',

  computed: {
    currentProject() {
      return this.$store.getters.currentProject;
    },

    userRole() {
      return this.currentProject?.authorization?.role;
    },
  },

  watch: {
    'currentProject.uuid': {
      immediate: true,
      handler(projectUuid) {
        if (projectUuid && this.userRole !== undefined) {
          this.redirectToDefaultModule();
        }
      },
    },
  },

  methods: {
    /**
     * Determines the default module to redirect to based on user role and module availability.
     * @returns {string} The route name to redirect to ('chats' or 'insights')
     */
    getDefaultModuleRoute() {
      const chatsModuleEnabled = env('MODULES_YAML')?.chats;
      const isChatUser = this.userRole === PROJECT_ROLE_CHATUSER;

      if (chatsModuleEnabled && isChatUser) {
        return 'chats';
      }

      return 'insights';
    },

    /**
     * Performs the redirect to the appropriate module.
     */
    redirectToDefaultModule() {
      const routeName = this.getDefaultModuleRoute();

      this.$router.replace({
        name: routeName,
        params: {
          projectUuid: this.currentProject.uuid,
          internal: ['init'],
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.project-home-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  background-color: $unnnic-color-background-snow;

  .logo {
    width: 50%;
    max-width: 13rem;
  }
}
</style>
