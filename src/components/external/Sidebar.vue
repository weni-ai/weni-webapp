<template>
  <unnnic-sidebar-primary
    v-if="theme === 'normal'"
    class="sidebar"
    :languages="['pt-br', 'en', 'es']"
    :language="language"
    @change-language="changeLanguage"
    :hide-expand-button="isToContract"
    :expanded="open"
    @toggle-expanded="open = $event"
    :hide-text="open ? $t('SIDEBAR.HIDE') : $t('SIDEBAR.SHOW')"
    :items="categories"
  >
    <template v-slot:header>
      <div class="sidebar-header">
        <router-link to="/orgs">
          <img src="../../assets/Logo-Weni-Soft-Default.svg" />
        </router-link>
      </div>
    </template>
  </unnnic-sidebar-primary>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { get } from 'lodash';
import getEnv from '@/utils/env';
import {
  CHAT_ROLE_AGENT,
  PROJECT_ROLE_VIEWER,
} from '../users/permissionsObjects';

export default {
  name: 'Sidebar',
  props: {},
  data() {
    return {
      items: [],
      open: true,
      current: '',
      notifyAgents: false,
    };
  },

  created() {
    window.addEventListener('message', function (e) {
      if (e.data.eventName === 'unread-changed') {
        this.notifyAgents = e.data.data !== '';
      }
    });

    this.$root.$on('set-sidebar-expanded', () => {
      if (!this.isToContract) {
        this.open = true;
      }
    });
  },

  mounted() {},

  computed: {
    ...mapGetters(['currentProject']),

    hideModulesButChats() {
      if (
        !this.$store.getters.currentProject.menu.chat.length &&
        getEnv('MODULE_CHATS') &&
        this.$store.getters.currentProject.authorization.chats_role ===
          CHAT_ROLE_AGENT &&
        this.$store.getters.currentProject.authorization.role ===
          PROJECT_ROLE_VIEWER
      ) {
        return true;
      }

      return false;
    },

    language() {
      return this.$i18n.locale;
    },

    categories() {
      const project = this.currentProject;

      const icons = {
        house: ['house-2-2', 'house-1-1'],
        hierarchy: ['hierarchy-3-3', 'hierarchy-3-2'],
        'app-window-edit': ['app-window-edit-2', 'app-window-edit-1'],
        'layout-dashboard': ['layout-dashboard-2', 'layout-dashboard-1'],
        'science-fiction-robot': [
          'science-fiction-robot-1',
          'science-fiction-robot-2',
        ],
        'messaging-we-chat': ['messaging-we-chat-2', 'messaging-we-chat-3'],
        'single-neutral': ['single-neutral-2', 'single-neutral-actions-1'],
        config: ['cog-2', 'cog-1'],
      };

      return [
        {
          type: 'category',
          label: 'SIDEBAR.MAIN_MENU',
          show: () => {
            return !this.hideModulesButChats;
          },
          items: [
            {
              name: 'home',
              label: 'SIDEBAR.HOME',
              icon: 'house',
              viewUrl: `/projects/${get(project, 'uuid')}`,
            },
          ],
        },
        {
          type: 'category',
          label: 'SIDEBAR.SYSTEMS',
          items: [
            {
              label: 'SIDEBAR.PUSH',
              icon: 'hierarchy',
              viewUrl: `/projects/${get(project, 'uuid')}/push/init`,
              show: () => {
                return !this.hideModulesButChats;
              },
            },
            {
              label: 'SIDEBAR.STUDIO',
              icon: 'app-window-edit',
              viewUrl: `/projects/${get(project, 'uuid')}/studio/init`,
              show: () => {
                return !this.hideModulesButChats;
              },
            },
            {
              label: 'SIDEBAR.BH',
              icon: 'science-fiction-robot',
              viewUrl: `/projects/${get(project, 'uuid')}/bothub/init`,
              show: () => {
                return !this.hideModulesButChats;
              },
            },
            {
              label: 'SIDEBAR.RC',
              icon: 'messaging-we-chat',
              viewUrl: `/projects/${get(project, 'uuid')}/rocketchat`,
              show(project) {
                return get(project, 'menu.chat.length');
              },
              notify: this.notifyAgents,
            },
            {
              label: 'SIDEBAR.chats',
              icon: 'messaging-we-chat',
              viewUrl: `/projects/${get(project, 'uuid')}/chats/init`,
              show: (project) => {
                return (
                  !get(project, 'menu.chat.length') && getEnv('MODULE_CHATS')
                );
              },
            },
          ],
        },
        {
          type: 'category',
          label: 'SIDEBAR.PROJECT',
          show: () => {
            if (this.hideModulesButChats) {
              return false;
            }

            return get(project, 'menu.integrations');
          },
          items: [
            {
              label: 'SIDEBAR.INTEGRATIONS',
              icon: 'layout-dashboard',
              viewUrl: `/projects/${get(project, 'uuid')}/integrations/init`,
              show(project) {
                if (this.hideModulesButChats) {
                  return false;
                }

                return get(project, 'menu.integrations');
              },
            },
            {
              label: 'SIDEBAR.CONFIG',
              icon: 'config',
              viewUrl: `/projects/${get(project, 'uuid')}/settings`,
              show: () => {
                return !this.hideModulesButChats;
              },
            },
          ],
        },
      ]
        .filter((item) => {
          if (item.show) {
            return item.show(project);
          }

          return true;
        })
        .map((item) => ({
          ...item,
          label: this.$t(item.label),
          items: item.items
            .filter((item) => {
              if (item.show) {
                return item.show(project);
              }

              return true;
            })
            .map((route) => {
              const active =
                route.name === 'home'
                  ? this.$route.name === route.name
                  : this.$route.path.startsWith(
                      route.viewUrl.replace('/init', ''),
                    );

              return {
                ...route,
                label: this.$t(route.label),
                active,
                icon: icons[route.icon][active ? 0 : 1],
                click: () => {
                  this.$router.push(route.viewUrl);
                },
                notify: route.notify,
              };
            }),
        }));
    },

    isToContract() {
      return this.$route.meta?.forceContractedSidebar;
    },
  },
  methods: {
    ...mapActions(['updateAccountLanguage']),

    changeLanguage(language) {
      this.updateAccountLanguage({ language });
    },

    pathname(context, pathSegment) {
      if (!context) return `/${pathSegment}`;
      else return `/${context}/${pathSegment}`;
    },
  },

  watch: {
    '$route.path': {
      immediate: true,
      handler() {
        if (this.isToContract) {
          this.open = false;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';

$transition-time: 0.4s;

.sidebar {
  min-height: 100vh;

  &-header {
    width: 24px;
    height: $unnnic-icon-size-md;
    overflow: hidden;
    margin: 0 auto;
    transition: width $transition-time;

    img {
      vertical-align: middle;
      height: 18.89px;
      transition: all $transition-time;
    }
  }

  &.unnnic-sidebar-primary-expanded {
    .sidebar-header {
      width: 85px;

      img {
        height: $unnnic-icon-size-md;
      }
    }
  }

  ::v-deep .unnnic-language-select {
    z-index: 1;
  }
}
</style>
