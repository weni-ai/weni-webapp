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

    <SettingsWorkspace
      v-if="$route.name === 'settingsProject'"
      class="page"
    />

    <component
      :is="externalSystemComponent"
      id="integrations-settings-iframe"
      ref="system-integrations-settings"
      :routes="['settingsChannels']"
      class="page"
      dontUpdateWhenChangesLanguage
      @vue:mounted="onExternalSystemMounted"
    />

    <component
      :is="externalSystemComponent"
      id="chats-settings-iframe"
      ref="system-chats-settings"
      :routes="['settingsChats']"
      class="page"
      @vue:mounted="onExternalSystemMounted"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { mapGetters } from 'vuex';

import getEnv from '@/utils/env';
import { PROJECT_ROLE_CHATUSER } from '../components/users/permissionsObjects';
import { PROJECT_COMMERCE } from '@/utils/constants.js';
import chats from '../api/chats';
import SettingsWorkspace from './settings/SettingsWorkspace.vue';

export default {
  name: 'SettingsView',

  components: {
    SettingsWorkspace,
  },

  data() {
    return {
      initialLoaded: false,
      showOverlay: false,
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

    isCommerceProject() {
      return this.currentProject.project_mode === PROJECT_COMMERCE;
    },

    activePage() {
      const routeToKey = {
        settingsChannels: 'settingsChannels',
        settingsProject: 'projectConfig',
        settingsChats: 'chatsConfig',
      };

      const activeKey = routeToKey[this.$route.name];
      const itemIndex = this.pages.findIndex((page) => page.key === activeKey);

      return { itemIndex: Math.max(itemIndex, 0), childIndex: 0 };
    },

    pages() {
      const options = [];

      if (
        getEnv('MODULES_YAML').chats &&
        (!this.enableGroups || this.isPrimaryProject)
      ) {
        options.push({
          key: 'chatsConfig',
          label: this.$t('settings.chats.title'),
          icon: 'headphones',
          href: {
            name: 'settingsChats',
            params: { internal: ['init'] },
          },
          hrefForceReload: {
            name: 'settingsChats',
            params: { internal: ['r', 'init'] },
          },
        });
      }

      if (!this.hideModulesButChats) {
        options.push({
          key: 'settingsChannels',
          label: this.$t('settings.channels'),
          icon: 'stacks',
          href: {
            name: 'settingsChannels',
            params: { internal: ['init'] },
          },
          hrefForceReload: {
            name: 'settingsChannels',
            params: { internal: ['r', 'init'] },
          },
          children: [],
        });

        options.push({
          key: 'projectConfig',
          label: this.$t('settings.workspace.title'),
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

      return options;
    },

    externalSystemComponent() {
      return defineAsyncComponent(
        () => import('../components/ExternalSystem.vue'),
      );
    },
    isPrimaryProject() {
      return !!this.chatsConfig?.config?.its_principal;
    },
    isSecondaryProject() {
      return this.chatsConfig?.config?.its_principal === false;
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
              ['settingsChannels', 'settingsChats'].includes(this.$route.name)
            ) {
              this.initCurrentExternalSystem();
            }
          }, 100);
        });
      },
    },

    '$route.params.projectUuid': {
      async handler() {
        const { projectUuid } = this.$route.params;

        if (!projectUuid) {
          return;
        }

        this.$refs['system-integrations-settings']?.reset();
        this.$refs['system-chats-settings']?.reset();

        this.$router.push({ name: 'settingsProject' });
      },
    },
  },

  async created() {
    this.chatsConfig = await chats.getProjectInfo(this.currentProject?.uuid);
  },

  mounted() {
    window.addEventListener('message', (message) => {
      const { event } = message.data;
      if (event === 'changeOverlay') {
        this.showOverlay = message.data.data;
      }
    });

    this.initialLoaded = true;
  },

  methods: {
    close() {
      const chatsIframe = document.getElementById('chats-settings-iframe');
      if (chatsIframe && chatsIframe.contentWindow) {
        chatsIframe.contentWindow.postMessage({ event: 'close' }, '*');
      }
    },
    onExternalSystemMounted() {
      if (['settingsChannels', 'settingsChats'].includes(this.$route.name)) {
        this.$nextTick(() => this.initCurrentExternalSystem());
      }
    },

    initCurrentExternalSystem() {
      const current = this.$route.name;
      if (current === 'settingsChannels') {
        this.$refs['system-integrations-settings']?.init(this.$route.params);
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
  display: flex;

  .overlay {
    z-index: 1;
    background-color: rgba(53, 57, 69, 0.5);
    width: 100%;
    height: 100%;
    position: fixed;
  }

  :deep(.unnnic-sidebar) {
    height: 91vh;
  }

  :deep(.unnnic-sidebar-items) {
    position: relative;
    margin-right: -$unnnic-spacing-sm;
  }

  :deep(.unnnic-sidebar-item) {
    margin-right: $unnnic-spacing-sm;

    > * {
      color: $unnnic-color-fg-muted;
    }

    &.unnnic-sidebar-item.active {
      border-radius: $unnnic-radius-2;

      .unnnic-sidebar-item__label {
        color: $unnnic-color-fg-base;
      }

      .unnnic-icon {
        color: $unnnic-color-fg-accent;
      }
    }
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
