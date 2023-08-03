<template>
  <div v-if="loading" :class="['loading', `theme-${$store.state.Theme.name}`]">
    <img class="logo" src="./assets/LogoWeniAnimada.svg" />
  </div>

  <div v-else class="app">
    <div>
      <sidebar class="sidebar" :unread-messages="unreadMessages" />
    </div>
    <div :class="['content', `theme-${theme}`]">
      <Navbar class="navbar" />

      <div class="page-container">
        <warning-max-active-contacts />

        <router-view
          v-show="!externalSystems.includes($route.name)"
          class="page"
        />

        <api-options
          v-if="['apiFlows', 'apiIntelligence'].includes($route.name)"
        />

        <external-system
          ref="system-api-flows"
          :routes="['apiFlows']"
          class="page"
          dont-update-when-changes-language
        />

        <external-system
          ref="system-api-intelligence"
          :routes="['apiIntelligence']"
          class="page"
          dont-update-when-changes-language
        />

        <external-system
          v-if="['academy'].includes($route.name)"
          ref="system-academy"
          :routes="['academy']"
          class="page"
          dont-update-when-changes-language
        />

        <external-system
          ref="system-integrations"
          :routes="['integrations']"
          class="page"
          dont-update-when-changes-language
        />

        <external-system
          ref="system-flows"
          :routes="['studio', 'push']"
          class="page"
        />

        <external-system
          ref="system-ia"
          :routes="['bothub']"
          class="page"
          name="ai"
        />

        <external-system
          ref="system-agents"
          :routes="['rocket']"
          class="page"
        />

        <external-system
          ref="system-chats"
          :routes="['chats']"
          class="page"
          dont-update-when-changes-language
          name="chats"
        />
      </div>
    </div>

    <modal
      v-for="(modal, index) in modals"
      :key="index"
      v-on="modal.listeners"
      v-bind="modal"
    />

    <right-bar
      v-for="rightBar in $store.state.RightBar.all"
      :key="`right-bar-${rightBar.id}`"
      :id="rightBar.id"
      v-bind="rightBar.props"
      v-on="rightBar.events"
    />

    <know-user-modal
      v-if="
        $store.state.Account.profile &&
        !$store.state.Account.profile.last_update_profile
      "
    />

    <trial-period />
  </div>
</template>

<script>
import Sidebar from './components/external/Sidebar.vue';
import Navbar from './components/external/navbar.vue';
import Modal from './components/external/Modal.vue';
import ExternalSystem from './components/ExternalSystem.vue';
import WarningMaxActiveContacts from './components/billing/WarningMaxActiveContacts.vue';
import ApiOptions from './components/ApiOptions.vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import LogRocket from 'logrocket';
import { get } from 'lodash';
import getEnv from '@/utils/env';
import sendAllIframes from './utils/plugins/sendAllIframes';
import iframessa from 'iframessa';
import KnowUserModal from './components/KnowUserModal/Index.vue';
import RightBar from './components/common/RightBar/Index.vue';
import TrialPeriod from './modals/TrialPeriod.vue';
import { setUser } from '@sentry/browser';

const favicons = {};

['', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-9+'].forEach(
  (name) => {
    favicons[name] = require(`@/assets/logos/favicon${name}.svg`);
  },
);

export default {
  components: {
    Sidebar,
    Navbar,
    ExternalSystem,
    Modal,
    WarningMaxActiveContacts,
    ApiOptions,
    KnowUserModal,
    RightBar,
    TrialPeriod,
  },

  data() {
    return {
      requestingLogout: false,
      doingAthentication: false,
      requestingProject: false,
      requestingOrg: false,
      externalSystems: [
        'academy',
        'integrations',
        'studio',
        'push',
        'bothub',
        'rocket',
        'chats',
        'apiFlows',
        'apiIntelligence',
      ],
      unreadMessages: 0,
      championChatbotsByProject: {},
    };
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    ...mapState({
      accountProfile: (state) => state.Account.profile,
      accountLoading: (state) => state.Account.loading,
      modals: (state) => state.Modal.actives,
    }),

    unreadMessagesCompressed() {
      if (this.unreadMessages > 9) {
        return '9+';
      } else if (this.unreadMessages > 0) {
        return this.unreadMessages;
      }

      return '';
    },

    documentTitleWatcher() {
      return [this.$route.name, this.$i18n.locale, this.unreadMessages].join(
        '-',
      );
    },

    needToEnable2FA() {
      return (
        get(this.currentOrg, 'enforce_2fa') &&
        !this.$store.state.Account?.profile?.has_2fa
      );
    },

    loading() {
      return (
        this.accountLoading ||
        this.requestingLogout ||
        this.doingAthentication ||
        this.requestingProject ||
        this.requestingOrg
      );
    },

    loadingWithPath() {
      return `${this.loading}-${this.$route.fullPath}`;
    },
  },

  created() {
    console.log(
      `Version %c${getEnv('PACKAGE_VERSION')}`,
      'background: #00DED2; color: #262626',
    );

    console.log(
      `Hash %c${getEnv('VUE_APP_HASH')}`,
      'background: #00DED2; color: #262626',
    );

    window.addEventListener('message', (event) => {
      const prefix = 'connect:';
      const content = String(event.data);

      if (event.data?.event === 'getUserInfo') {
        sendAllIframes('userInfo', {
          first_name: this.accountProfile.first_name,
          last_name: this.accountProfile.last_name,
          email: this.accountProfile.email,
        });
      } else if (
        event.data?.event === 'flowEditorLoaded' &&
        this.currentProject.project_type?.startsWith?.('template') &&
        this.currentProject.first_access
      ) {
        WebChat.clear();
        WebChat.open(`whatsappdemo ${this.currentProject.redirect_url}`);

        this.changeReadyMadeProjectProperties({
          projectUuid: this.currentProject.uuid,
          first_access: false,
        });
      } else if (event.data?.event === 'chats:redirect') {
        const [module, next] = (event.data?.path || '').split(':');

        if (module === 'chats-settings') {
          this.$router.push({
            name: 'settingsChats',
            params: {
              internal: next.split('/'),
            },
          });
        }
      } else if (event.data?.event === 'chats:update-unread-messages') {
        this.unreadMessages = event.data.unreadMessages;
      }

      if (content.startsWith(prefix)) {
        const eventMessage = content.substr(prefix.length);

        const type = eventMessage.substr(0, eventMessage.indexOf(':'));
        // eslint-disable-next-line no-unused-vars
        const data = {
          ...JSON.parse(eventMessage.substr(type.length + 1)),
          origin: event.origin,
        };

        if (type === 'requestlogout') {
          this.requestingLogout = true;
          this.$keycloak.logout();
        }
      }
    });

    iframessa.getter('hasFlows', async () => {
      const { has_flows } = await this.$store.dispatch(
        'getSuccessOrgStatusByFlowUuid',
        {
          flowUuid: this.$store.getters.currentProject.flow_organization,
        },
      );

      return has_flows;
    });

    iframessa.on('redirectToFlows', ({ data }) => {
      this.$router.push({
        name: 'push',
        params: {
          projectUuid: this.$route.params.projectUuid,
          internal: data.path.split('/'),
        },
      });
    });

    iframessa.on('redirectToSettingsChats', ({ data }) => {
      this.$router.push({
        name: 'settingsChats',
        params: {
          projectUuid: this.$route.params.projectUuid,
          internal: data.path.split('/'),
        },
      });
    });

    iframessa.getter('isOpenHowToIntegrateChatsModal', () => {
      return true;
    });

    this.registerNotificationSupport();
  },

  mounted() {
    if (this.theme === 'normal' && this.$refs['system-agents']) {
      this.$refs['system-agents'].init(this.$route.params);
    }
  },

  watch: {
    '$store.getters.currentProject.uuid': {
      immediate: true,
      async handler(projectUuid, previousProjectUuid) {
        if (previousProjectUuid) {
          this.$set(
            this.championChatbotsByProject,
            previousProjectUuid,
            undefined,
          );
        }
        if (!projectUuid) {
          return;
        }
        this.verifyIfChampionChatbotStatusChanged({
          projectUuid,
          organizationUuid: this.$store.getters.currentProject.organization,
        });
      },
    },

    documentTitleWatcher: {
      immediate: true,
      handler() {
        let title = this.$route.meta?.title;

        title = title ? this.$t(title) : 'Weni';

        const prefix = this.unreadMessagesCompressed
          ? `(${this.unreadMessagesCompressed}) `
          : '';

        document.title = `${prefix}${title}`;
      },
    },

    '$route.params.projectUuid': {
      async handler() {
        const { projectUuid } = this.$route.params;

        if (!projectUuid) {
          this.unreadMessages = 0;
          return false;
        }

        this.$refs['system-integrations']?.reset();
        this.$refs['system-flows']?.reset();
        this.$refs['system-ia']?.reset();
        this.$refs['system-agents']?.reset();
        this.$refs['system-chats']?.reset();

        this.loadAndSetAsCurrentProject(projectUuid);
      },
    },

    '$route.params.orgUuid': {
      async handler() {
        const { orgUuid } = this.$route.params;

        if (!orgUuid || orgUuid === 'create') {
          return false;
        }

        this.loadAndSetAsCurrentOrg(orgUuid);
      },
    },

    loadingWithPath() {
      this.$nextTick(() => {
        if (!this.loading && this.externalSystems.includes(this.$route.name)) {
          this.initCurrentExternalSystem();
        }
      });
    },

    '$route.fullPath': {
      immediate: true,

      async handler() {
        if (this.$route.meta?.hideBottomRightOptions) {
          window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));
        } else {
          window.dispatchEvent(new CustomEvent('showBottomRightOptions'));
        }

        if (this.theme === 'normal' && this.$refs['system-agents']) {
          this.$refs['system-agents'].init(this.$route.params);
        }

        const requiresAuth = this.$route.matched.some(
          (record) => record.meta.requiresAuth,
        );

        if (requiresAuth && !this.accountProfile) {
          await this.fetchProfile();

          this.$store.dispatch('loadNews');

          if (
            this.$route.name === 'OrgsRequired' &&
            this.accountProfile.last_update_profile
          ) {
            this.$router.push('/orgs');
          } else if (
            this.$route.name !== 'OrgsRequired' &&
            !this.accountProfile.last_update_profile
          ) {
            this.$router.push({
              name: 'OrgsRequired',
              query: this.$route.query,
            });
          }

          iframessa.getter('userInfo', () => {
            return {
              first_name: this.accountProfile.first_name,
              last_name: this.accountProfile.last_name,
            };
          });

          LogRocket.init(getEnv('LOGROCKET_ID'), {
            mergeIframes: true,
            childDomains: Object.values(getEnv('MODULES_YAML'))
              .filter((module) => module)
              .map((module) => new URL(module).origin),
          });

          const name = [
            this.accountProfile.first_name,
            this.accountProfile.last_name,
          ]
            .join(' ')
            .trim();

          LogRocket.identify(this.accountProfile.id, {
            name,
            email: this.accountProfile.email,
          });

          setUser({
            id: this.accountProfile.id,
            name,
            email: this.accountProfile.email,
          });
        } else if (requiresAuth && this.accountProfile) {
          if (
            this.$route.name === 'OrgsRequired' &&
            this.accountProfile.last_update_profile
          ) {
            this.$router.push('/orgs');
            return false;
          } else if (
            this.$route.name !== 'OrgsRequired' &&
            !this.accountProfile.last_update_profile
          ) {
            this.$router.push({
              name: 'OrgsRequired',
              query: this.$route.query,
            });
            return false;
          }
        } else {
          this.$store.state.Account.loading = false;
        }
      },
    },

    unreadMessages: {
      immediate: true,
      handler() {
        const icon = document.querySelector('link[rel=icon]');

        const name = this.unreadMessagesCompressed
          ? `-${this.unreadMessagesCompressed}`
          : '';

        if (icon) {
          icon.setAttribute('href', favicons[name]);
          icon.setAttribute('type', 'image/svg+xml');
        }
      },
    },
  },

  methods: {
    ...mapActions([
      'fetchProfile',
      'setCurrentProject',
      'clearCurrentOrg',
      'setCurrentOrg',
      'getProject',
      'getOrg',
      'changeReadyMadeProjectProperties',
    ]),

    registerNotificationSupport() {
      if (!('Notification' in window)) {
        console.error('This browser does not support desktop notification');
        return;
      }

      iframessa.on('notification.requestPermission', () => {
        if (Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      });

      iframessa.on('notification', ({ data }) => {
        const [title, options] = data;

        if (Notification.permission === 'granted') {
          new Notification(title, options);
        }
      });
    },

    async verifyIfChampionChatbotStatusChanged({
      projectUuid,
      organizationUuid,
    }) {
      if (projectUuid !== this.$store.getters.currentProject?.uuid) {
        return;
      }
      try {
        const flowUuid = this.$store.getters.currentProject.flow_organization;

        let oldValues = null;

        if (this.$store.state.Project.championChatbots[flowUuid]) {
          oldValues = this.$store.state.Project.championChatbots[flowUuid];
        }

        const { has_ia, has_flows, has_channel, has_msg } =
          await this.$store.dispatch('getSuccessOrgStatusByFlowUuid', {
            flowUuid: this.$store.getters.currentProject.flow_organization,
            force: true,
          });

        iframessa.modules.ai?.emit('update:hasFlows', has_flows);

        const level =
          [has_flows, has_channel, has_msg, has_ia].lastIndexOf(true) + 1;

        if (
          level >= 4 &&
          oldValues &&
          [
            oldValues.has_flows,
            oldValues.has_channel,
            oldValues.has_msg,
            oldValues.has_ia,
          ].lastIndexOf(true) +
            1 <
            4
        ) {
          this.$store.dispatch('openModal', {
            type: 'confirm',
            showClose: true,
            confirmButtonType: 'secondary',
            data: {
              icon: 'vip-crown-queen-2',
              scheme: 'feedback-yellow',
              title: this.$t('home.champion_chatbot.modal.title'),
              description: this.$t('home.champion_chatbot.modal.description'),
              cancelText: this.$t('home.champion_chatbot.modal.learn'),
              confirmText: this.$t('home.champion_chatbot.modal.change_plan'),
            },
            listeners: {
              cancel: ({ close }) => {
                close();
                this.$router.push({
                  name: 'academy',
                  params: {
                    internal: ['init'],
                  },
                });
              },
              confirm: ({ close }) => {
                close();
                this.$store.state.BillingSteps.flow = 'change-plan';
                this.$router.push({
                  name: 'BillingPlans',
                  params: {
                    orgUuid: organizationUuid,
                  },
                });
              },
            },
          });
        } else if (level < 4) {
          setTimeout(() => {
            this.verifyIfChampionChatbotStatusChanged({
              projectUuid,
              organizationUuid,
            });
          }, 5000);
        }
      } catch (error) {
        console.log(error);
      }
    },

    initCurrentExternalSystem() {
      const current = this.$route.name;

      if (current === 'apiIntelligence') {
        this.$refs['system-api-intelligence'].init(this.$route.params);
      } else if (current === 'apiFlows') {
        this.$refs['system-api-flows'].init(this.$route.params);
      } else if (current === 'academy') {
        this.$refs['system-academy'].init(this.$route.params);
      } else if (current === 'integrations') {
        this.$refs['system-integrations'].init(this.$route.params);
      } else if (current === 'studio' || current === 'push') {
        this.$refs['system-flows'].init(this.$route.params);
      } else if (current === 'bothub') {
        this.$refs['system-ia'].init(this.$route.params);
      } else if (current === 'rocket') {
        this.$refs['system-agents'].init(this.$route.params);
      } else if (current === 'chats') {
        this.$refs['system-chats'].init(this.$route.params);
      }
    },

    async loadAndSetAsCurrentProject(projectUuid) {
      if (projectUuid === get(this.currentProject, 'uuid')) {
        return false;
      }

      try {
        this.requestingProject = true;

        const { data: project } = await this.getProject({
          uuid: projectUuid,
        });

        this.setCurrentProject(project);

        this.clearCurrentOrg();

        this.loadAndSetAsCurrentOrg(get(this.currentProject, 'organization'));
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      } finally {
        this.requestingProject = false;
      }
    },

    async loadAndSetAsCurrentOrg(orgUuid) {
      if (orgUuid === get(this.currentOrg, 'uuid')) {
        if (this.needToEnable2FA) {
          this.$router.replace({ name: 'OrganizationRequireTwoFactor' });
        }

        return false;
      }

      try {
        this.requestingOrg = true;

        const { data: org } = await this.getOrg({
          uuid: orgUuid,
        });

        this.$store.state.Org.orgs.data.push(org);

        this.setCurrentOrg(org);

        if (this.needToEnable2FA) {
          this.$router.replace({ name: 'OrganizationRequireTwoFactor' });
        }
      } catch (error) {
        this.$router.push({ name: 'orgs' });
      } finally {
        this.requestingOrg = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.loading {
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;

  .logo {
    width: 50%;
    max-width: 13rem;
  }

  &.theme-dark {
    background-color: $unnnic-color-neutral-black;
  }
}

.app {
  width: 100%;
  min-height: 100vh;
  display: flex;

  .content {
    top: 0;
    position: sticky;
    height: 100vh;

    flex: 1;
    display: flex;
    flex-direction: column;

    .page-container {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;

      .page:not(:is(.weni-orgs)) {
        flex: 1;
        overflow: auto;
      }
    }

    &.theme-normal {
      background-color: $unnnic-color-neutral-lightest;

      .page-container {
        border-top-left-radius: $unnnic-border-radius-md;
        background-color: $unnnic-color-neutral-snow;
      }
    }
  }
}
</style>

<style lang="scss">
@import '@/assets/scss/style.scss';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '@/assets/scss/unnnic-styles.scss';

body {
  margin: 0;
  background-color: $unnnic-color-neutral-snow;
  font-family: $unnnic-font-family-secondary;

  .push-widget-container:not(.push-full-screen.push-chat-open) {
    bottom: 80px;
    right: 18px;
    padding: 0;

    @media screen and (max-width: 800px) {
      &.push-chat-open {
        bottom: 0;
        right: 0;
      }
    }
  }
}
</style>
