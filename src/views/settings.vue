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

    <section
      v-if="showOverlay"
      class="overlay"
      data-testid="overlay"
      @click="close"
    />

    <component
      :is="systemProjectComponent"
      ref="system-project"
      :routes="['settingsProject']"
      class="page"
    />

    <component
      :is="systemChatsSettingsComponent"
      id="chats-settings-iframe"
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

  data() {
    return {
      chatsSectorRoutes: [],
      initialLoaded: false,
      showOverlay: false,
      ignoreNavigate: false,
      chatsConfig: null,
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
          children: [],
        });
      }

      if (
        getEnv('MODULES_YAML').chats &&
        (!this.enableGroups || this.isPrimaryProject)
      ) {
        options.push({
          key: 'chatsConfig',
          label: this.$t('settings.chats.title'),
          icon: 'forum',
          children: [
            {
              key: 'chatsDefineConfig',
              label: this.$t('settings.chats.config'),
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
    isPrimaryProject() {
      return !!this.chatsConfig?.config?.its_principal;
    },
    isSecondaryProject() {
      return !!this.chatsConfig?.config?.its_principal === false;
    },
    enableGroups() {
      return this.isPrimaryProject || this.isSecondaryProject;
    },
  },

  watch: {
    '$route.fullPath': {
      immediate: true,

      handler() {
        this.showOverlay = false;
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

        if (!this.enableGroups || this.isPrimaryProject) this.getChatsSectors();
      },
    },
  },

  async created() {
    this.chatsConfig = await chats.getProjectInfo(this.currentProject?.uuid);
  },

  async mounted() {
    window.addEventListener('message', (message) => {
      const { data, event } = message.data;
      if (event === 'changeOverlay') {
        this.showOverlay = data;
      }
      if (event === 'addSector') {
        this.ignoreNavigate = true;
        const newChatsSectorRoutes = sortByKey(
          [...this.chatsSectorRoutes, this.formatSectorToNav(data)],
          'label',
        );
        this.chatsSectorRoutes = newChatsSectorRoutes;
      }
      if (event === 'deleteSectorUuid') {
        this.chatsSectorRoutes = this.chatsSectorRoutes.filter(
          (route) => route.key !== data,
        );
      }
    });

    await this.getChatsSectors();

    this.initialLoaded = true;
  },

  methods: {
    close() {
      const chatsIframe = document.getElementById('chats-settings-iframe');
      if (chatsIframe && chatsIframe.contentWindow) {
        chatsIframe.contentWindow.postMessage({ event: 'close' }, '*');
      }
    },
    formatSectorToNav(sector) {
      return {
        key: sector.uuid,
        label: `${this.$t('settings.sector')} ${sector.name}`,
        hrefForceReload: {
          name: 'settingsChats',
          params: { internal: ['r', 'settings', 'sectors', sector.uuid] },
        },
      };
    },
    async getChatsSectors() {
      try {
        const sectors = (await chats.listAllSectors()).results;

        const sectorRoutes = sectors.map((sector) =>
          this.formatSectorToNav(sector),
        );

        this.chatsSectorRoutes = sortByKey(sectorRoutes, 'label');
      } catch (error) {
        console.log(error);
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
      if (!this.ignoreNavigate)
        this.$router.push(route.hrefForceReload || route.href);

      this.ignoreNavigate = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-container {
  display: flex;

  .overlay {
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.4);
    width: 100%;
    height: 100%;
    position: fixed;
  }

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
    padding: $unnnic-spacing-sm;
  }

  .separator {
    width: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
  }

  .page {
    background-color: white;
    display: flex;
    flex: 1;
    z-index: 1;
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
