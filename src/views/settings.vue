<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="settings-container">
    <div class="options">
      <UnnnicSidebar
        v-if="initialLoaded"
        :items="pages"
        :active="activePage"
        autoNavigateFirstChild
        @navigate="handlerRouteNavigation($event.child || $event.item)"
      />
    </div>

    <div class="separator"></div>

    <component
      :is="systemProjectComponent"
      ref="system-project"
      :routes="['settingsProject']"
      class="page"
    />

    <component
      :is="systemChatsSettingsComponent"
      ref="system-chats-settings"
      :routes="['settingsChats']"
      class="page"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { mapGetters } from 'vuex';

import getEnv from '@/utils/env';
import { PROJECT_ROLE_CHATUSER } from '../components/users/permissionsObjects';
import chats from '../api/chats';
import { sortByKey } from '@/utils/array';

export default {
  name: 'SettingsView',
  components: {
    ExternalSystem,
  },

  data() {
    return {
      chatsSectorRoutes: [],
      initialLoaded: false,
    };
  },

  computed: {
    ...mapGetters(['currentProject']),

    hideModulesButChats() {
      if (
        getEnv('MODULES_YAML').chats &&
        this.$store.getters.currentProject.authorization.role ===
          PROJECT_ROLE_CHATUSER
      ) {
        return true;
      }

      return false;
    },

    activePage() {
      const routeName = this.$route.name;
      const routeParams = this.$route.params;

      const itemIndex = routeName === 'settingsProject' ? 0 : 1;

      const isForceInit =
        Array.isArray(routeParams.internal) && routeParams.internal[0] === 'r';

      const childrenSectorUuid =
        typeof routeParams.internal === 'string'
          ? routeParams.internal.split('/')[2]
          : routeParams.internal[isForceInit ? 3 : 2];

      const childIndex =
        itemIndex && childrenSectorUuid
          ? this.pages[1].children.findIndex(
              (child) => child.key === childrenSectorUuid,
            )
          : 0;
      return { itemIndex, childIndex };
    },

    pages() {
      const options = [];

      if (!this.hideModulesButChats) {
        options.push({
          key: 'projectConfig',
          label: this.$t('settings.project.title'),
          icon: 'tune',
          href: {
            name: 'settingsProject',
            params: { internal: ['init'] },
          },
          hrefForceReload: {
            name: 'settingsProject',
            params: { internal: ['r', 'init'] },
          },
        });
      }

      if (getEnv('MODULES_YAML').chats) {
        options.push({
          key: 'chatsConfig',
          label: this.$t('settings.chats.title'),
          icon: 'forum',
          children: [
            {
              key: 'chatsDefineConfig',
              label: 'Configurações de Chats',
              href: {
                name: 'settingsChats',
                params: { internal: ['init'] },
              },
              hrefForceReload: {
                name: 'settingsChats',
                params: { internal: ['r', 'init'] },
              },
            },
            ...this.chatsSectorRoutes,
          ],
        });
      }

      return options;
    },

    systemProjectComponent() {
      // Workaround to bypass circular import issue by using async component loading
      return defineAsyncComponent(
        () => import('../components/ExternalSystem.vue'),
      );
    },

    systemChatsSettingsComponent() {
      // Workaround to bypass circular import issue by using async component loading
      return defineAsyncComponent(
        () => import('../components/ExternalSystem.vue'),
      );
    },
  },

  watch: {
    '$route.fullPath': {
      immediate: true,

      handler() {
        this.$nextTick(() => {
          setTimeout(() => {
            if (
              ['settingsProject', 'settingsChats'].includes(this.$route.name)
            ) {
              this.initCurrentExternalSystem();
            }
          }, 100); // Ensures ExternalSystem is loaded before executing this logic
        });
      },
    },

    '$route.params.projectUuid': {
      async handler() {
        const { projectUuid } = this.$route.params;

        if (!projectUuid) {
          return;
        }

        this.$refs['system-project'].reset();
        this.$refs['system-chats-settings'].reset();

        this.$router.push({ name: 'settingsProject' });

        this.getChatsSectors();
      },
    },
  },

  mounted() {
    this.getChatsSectors();
  },

  methods: {
    async getChatsSectors() {
      try {
        const sectors = (await chats.listAllSectors()).results;

        const sectorRoutes = sectors.map((sector) => ({
          key: sector.uuid,
          label: `${this.$t('settings.sector')} ${sector.name}`,
          hrefForceReload: {
            name: 'settingsChats',
            params: { internal: ['r', 'settings', 'sectors', sector.uuid] },
          },
        }));

        this.chatsSectorRoutes = sortByKey(sectorRoutes, 'label');
      } catch (error) {
        console.log(error);
      } finally {
        this.initialLoaded = true;
      }
    },

    initCurrentExternalSystem() {
      const current = this.$route.name;
      if (current === 'settingsProject') {
        this.$refs['system-project']?.init(this.$route.params);
      } else if (current === 'settingsChats') {
        this.$refs['system-chats-settings']?.init(this.$route.params);
      }
    },

    handlerRouteNavigation(route) {
      this.$router.push(route.hrefForceReload || route.href);
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-container {
  padding: $unnnic-spacing-sm;

  display: flex;

  :deep(.unnnic-sidebar-items) {
    position: relative;
    margin-right: -$unnnic-spacing-sm;
  }

  :deep(.unnnic-sidebar-item) {
    margin-right: $unnnic-spacing-sm;
  }

  :deep(.unnnic-sidebar-item-child) {
    margin-right: $unnnic-spacing-sm;
  }

  .options {
    width: 200px;
    height: fit-content;
  }

  .separator {
    width: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: 0 $unnnic-spacing-inline-sm;
  }

  .page {
    flex: 1;
  }
}

.unnnic-card-account {
  user-select: none;
  cursor: pointer;

  & + .unnnic-card-account {
    margin-top: 0.625rem;
  }
}
</style>
