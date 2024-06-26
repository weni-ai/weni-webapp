<template>
  <div
    class="sidebar-container"
    :style="{ width: theme === 'normal' && shouldHideSideBar ? '88px' : null }"
  >
    <UnnnicSidebarPrimary
      v-if="theme === 'normal'"
      class="sidebar"
      :languages="['pt-br', 'en', 'es']"
      :language="language"
      @change-language="changeLanguage"
      :hideExpandButton="isToContract"
      :expanded="open"
      @toggle-expanded="open = $event"
      :hideText="open ? $t('SIDEBAR.HIDE') : $t('SIDEBAR.SHOW')"
      :items="categories"
      :style="
        shouldHideSideBar
          ? { position: 'absolute', top: 0, left: 0, zIndex: 2 }
          : null
      "
    >
      <template v-slot:header>
        <div class="sidebar-header">
          <RouterLink to="/orgs">
            <img src="../../assets/Logo-Weni-Soft-Default.svg" />
          </RouterLink>
        </div>
      </template>

      <template v-slot:search>
        <div v-if="open">
          <UnnnicAutocomplete
            v-if="theme == 'normal' && !hideModulesButChats"
            :placeholder="$t('NAVBAR.SEARCH_PLACEHOLDER')"
            size="sm"
            class="sidebar__search"
            iconLeft="search-1"
            v-model="search"
            :data="items"
            @input="onSearch"
            highlight
            @choose="chooseOption"
          />
        </div>
      </template>

      <template v-if="!hasFlows">
        <SidebarModal
          slot="block-studio"
          :title="$t('SIDEBAR.modules.studio.title')"
          :description="$t('SIDEBAR.modules.studio.description')"
          :image="gifStudio"
        />

        <SidebarModal
          slot="block-intelligences"
          :title="$t('SIDEBAR.modules.intelligences.title')"
          :description="$t('SIDEBAR.modules.intelligences.description')"
          :image="gifIntelligences"
        />

        <SidebarModal
          slot="block-chats"
          :title="$t('SIDEBAR.modules.chats.title')"
          :description="$t('SIDEBAR.modules.chats.description')"
          :image="gifChats"
        />

        <SidebarModal
          slot="block-integrations"
          :title="$t('SIDEBAR.modules.integrations.title')"
          :description="$t('SIDEBAR.modules.integrations.description')"
          :image="gifIntegrations"
        />
      </template>
    </UnnnicSidebarPrimary>

    <div
      v-show="theme === 'normal' && shouldHideSideBar && open"
      @click="open = false"
      class="background"
    ></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { get } from 'lodash';
import getEnv from '@/utils/env';
import ShouldShowBrain from '../../utils/ShouldShowBrain';
import { PROJECT_ROLE_CHATUSER } from '../users/permissionsObjects';
import SidebarModal from '../SidebarModal.vue';
import gifStudio from '../../assets/tutorial/sidebar-studio.gif';
import gifIntelligences from '../../assets/tutorial/sidebar-intelligences.gif';
import gifChats from '../../assets/tutorial/sidebar-chats.gif';
import gifIntegrations from '../../assets/tutorial/sidebar-integrations.gif';
import projects from '../../api/projects';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Sidebar',

  components: {
    SidebarModal,
  },

  props: {
    unreadMessages: Number,
  },
  data() {
    return {
      items: [],
      open: true,
      current: '',
      notifyAgents: false,
      gifStudio,
      gifIntelligences,
      gifChats,
      gifIntegrations,
      innerWidth: innerWidth,
      resizeFunction: () => {
        this.innerWidth = window.innerWidth;
      },
      search: '',
      activeSearch: null,
      loading: false,
    };
  },

  created() {
    window.addEventListener('resize', this.resizeFunction);

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

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeFunction);
  },

  computed: {
    ...mapGetters(['currentProject']),

    shouldHideSideBar() {
      return this.innerWidth < 768;
    },

    hasFlows() {
      const championChatbot =
        this.$store.state.Project.championChatbots[
          this.$store.getters.currentProject?.flow_organization
        ];

      return championChatbot?.error || championChatbot?.has_flows;
    },

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

    language() {
      return this.$i18n.locale;
    },

    categories() {
      const project = this.currentProject;

      const icons = {
        house: ['home'],
        hub: ['hub'],
        hierarchy: ['account_tree'],
        'app-window-edit': ['ad'],
        'layout-dashboard': ['browse'],
        'science-fiction-robot': ['neurology'],
        'messaging-we-chat': ['forum'],
        'single-neutral': ['person'],
        config: ['settings'],
        monitoring: ['monitoring'],
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
              name: 'insights',
              label: 'SIDEBAR.INSIGHTS',
              icon: 'monitoring',
              viewUrl: `/projects/${get(project, 'uuid')}/insights/init`,
              tag: 'Alfa',
              show: () => {
                return this.$store.state.Account.profile?.email.includes(
                  '@weni.ai',
                );
              },
            },
            {
              label: 'SIDEBAR.BRAIN',
              icon: 'hub',
              viewUrl: `/projects/${get(project, 'uuid')}/brain/init`,
              show: () => {
                if (
                  !ShouldShowBrain({
                    projectUuid: get(project, 'uuid'),
                    projectCreatedAt:
                      this.$store.state.Project.currentProject?.created_at,
                    userEmail: this.$store.state.Account.profile?.email,
                  })
                ) {
                  return false;
                }

                return !this.hideModulesButChats;
              },
            },
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
              id: 'studio',
              icon: 'app-window-edit',
              viewUrl: `/projects/${get(project, 'uuid')}/studio/init`,
              show: () => {
                return !this.hideModulesButChats;
              },
            },
            {
              label: 'SIDEBAR.BH',
              id: 'intelligences',
              icon: 'science-fiction-robot',
              viewUrl: `/projects/${get(project, 'uuid')}/bothub/init`,
              show: () => {
                return !this.hideModulesButChats;
              },
            },
            {
              label: 'SIDEBAR.chats',
              id: 'chats',
              icon: 'messaging-we-chat',
              viewUrl: `/projects/${get(project, 'uuid')}/chats/init`,
              show: () => {
                return getEnv('MODULES_YAML').chats;
              },
              notify: !!this.unreadMessages,
            },
          ],
        },
        {
          type: 'category',
          label: 'SIDEBAR.PROJECT',
          show: () => {
            return true;
          },
          items: [
            {
              label: 'SIDEBAR.INTEGRATIONS',
              id: 'integrations',
              icon: 'layout-dashboard',
              viewUrl: `/projects/${get(project, 'uuid')}/integrations/init`,
              show: () => {
                if (this.hideModulesButChats) {
                  return false;
                }

                return true;
              },
            },
            {
              label: 'SIDEBAR.CONFIG',
              icon: 'config',
              viewUrl: `/projects/${get(project, 'uuid')}/settings`,
              show: () => {
                return true;
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
                icon: icons[route.icon][0],
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

    onSearch() {
      if (!this.search) {
        this.items = [];
        return false;
      }

      this.loading = true;

      if (this.activeSearch) {
        clearTimeout(this.activeSearch);
      }

      const makeUrl = (type, data) => {
        const system = {
          flow: 'push',
          intelligence: 'bothub',
        };

        const base = `/projects/${this.currentProject.uuid}/${system[type]}`;

        if (type === 'flow') {
          return `${base}/f/flow/editor/${data.uuid}`;
        } else if (type === 'intelligence') {
          if (data.repository_type === 'classifier') {
            return `${base}/f/dashboard/${data.owner__nickname}/${data.slug}`;
          } else if (data.repository_type === 'content') {
            return `${base}/f/dashboard/${data.owner__nickname}/${data.slug}/content/bases`;
          }
        }
      };

      this.activeSearch = setTimeout(async () => {
        try {
          const response = await projects.search(
            null,
            this.currentProject.uuid,
            this.search,
          );

          const { data } = response;

          this.items = [];

          if (data.inteligence?.results.length) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.$t('SIDEBAR.BH'),
            });

            data.inteligence?.results
              .map((item) => ({
                type: 'option',
                text: item.name,
                value: {
                  ...item,
                  href: makeUrl('intelligence', item),
                },
              }))
              .forEach((item) => this.items.push(item));
          }

          if (data.flow.length) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.$t('SIDEBAR.PUSH'),
            });

            data.flow
              .map((item) => ({
                type: 'option',
                text: item.name,
                value: {
                  ...item,
                  href: makeUrl('flow', item),
                },
              }))
              .forEach((item) => this.items.push(item));
          }

          if (this.items.length === 0) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.$t('NAVBAR.NO_RESULTS'),
            });
          }
        } catch (e) {
          console.log(e);
        }
      }, 300);
    },

    chooseOption(value) {
      if (value.href) {
        this.$router.push(value.href);
      }
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

    shouldHideSideBar: {
      immediate: true,

      handler() {
        if (this.shouldHideSideBar && this.open) {
          this.open = false;
        }
      },
    },

    loading() {
      if (this.loading) {
        this.items = [];
        this.items.push({
          type: 'category',
          text: this.$t('NAVBAR.LOADING'),
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';

$transition-time: 0.4s;

.background {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

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

  &__search {
    margin-bottom: $unnnic-inline-sm;
    flex: 1;
  }

  &.unnnic-sidebar-primary-expanded {
    .sidebar-header {
      width: 85px;

      img {
        height: $unnnic-icon-size-md;
      }
    }
  }
  ::v-deep .unnnic-sidebar-primary {
    padding: 32px 24px;
  }
  ::v-deep .unnnic-language-select {
    z-index: 1;
  }
}
</style>
