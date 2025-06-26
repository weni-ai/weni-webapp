<template>
  <div
    v-if="loading"
    :class="['loading', `theme-${$store.state.Theme.name}`]"
  >
    <img
      class="logo"
      src="./assets/LogoWeniAnimada.svg"
    />
  </div>

  <div
    v-else
    class="app"
  >
    <PosRegister
      v-if="showPosRegister"
      :isNewUser="true"
    />

    <template v-else>
      <div>
        <Sidebar
          v-if="theme === 'normal'"
          :unreadMessages="unreadMessages"
        />
      </div>
      <div :class="['content', `theme-${theme}`]">
        <Topbar @open-modal-trial-period="showTrialPeriodModal = true" />

        <div class="page-container">
          <WarningMaxActiveContacts
            @open-modal-trial-period="showTrialPeriodModal = true"
          />

          <!--
            temporarily hidden: comming soon
            <warning-verify-mail />
          -->

          <RouterView
            v-show="!externalSystems.includes($route.name)"
            class="page"
            @open-modal-trial-period="showTrialPeriodModal = true"
          />

          <ApiOptions
            v-if="
              ['apiFlows', 'apiIntelligence', 'apiNexus'].includes($route.name)
            "
          />

          <SystemIntelligences />

          <SystemCommerce />

          <ExternalSystem
            ref="system-api-flows"
            :routes="['apiFlows']"
            class="page"
            dontUpdateWhenChangesLanguage
          />

          <ExternalSystem
            ref="system-api-intelligence"
            :routes="['apiIntelligence']"
            class="page"
            dontUpdateWhenChangesLanguage
          />

          <ExternalSystem
            ref="system-api-nexus"
            :routes="['apiNexus']"
            class="page"
            dontUpdateWhenChangesLanguage
          />

          <ExternalSystem
            v-if="['academy'].includes($route.name)"
            ref="system-academy"
            :routes="['academy']"
            class="page"
            dontUpdateWhenChangesLanguage
          />

          <ExternalSystem
            ref="system-integrations"
            :routes="['integrations']"
            class="page"
            dontUpdateWhenChangesLanguage
          />

          <ExternalSystem
            ref="system-flows"
            :routes="['studio', 'push']"
            class="page"
            projectDescriptionManager
          />

          <ExternalSystem
            ref="system-chats"
            :routes="['chats']"
            class="page"
            dontUpdateWhenChangesLanguage
            name="chats"
          />
          <ExternalSystem
            ref="system-insights"
            :routes="['insights']"
            class="page"
            dontUpdateWhenChangesLanguage
            name="insights"
          />
        </div>
      </div>

      <Modal
        v-for="(modal, index) in modals"
        v-bind="modal"
        :key="index"
        v-on="modal.listeners"
      />

      <RightBar
        v-for="rightBar in $store.state.RightBar.all"
        v-bind="rightBar.props"
        :id="rightBar.id"
        :key="`right-bar-${rightBar.id}`"
        v-on="rightBar.events"
      />

      <TrialPeriod
        :show="showTrialPeriodModal"
        @close="showTrialPeriodModal = false"
      />
    </template>

    <ModalRegistered
      v-if="isModalCreatedProjectOpen"
      @close="isModalCreatedProjectOpen = false"
    />
  </div>
</template>

<script>
import initHotjar from './utils/plugins/Hotjar.js';
import initWebChat from './utils/plugins/WebChat.js';
import Sidebar from './components/Sidebar/Sidebar.vue';
import Topbar from './components/Topbar/Topbar.vue';
import Modal from './components/external/Modal.vue';
import ExternalSystem from './components/ExternalSystem.vue';
import WarningMaxActiveContacts from './components/billing/WarningMaxActiveContacts.vue';
import ApiOptions from './components/ApiOptions.vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { get } from 'lodash';
import getEnv from '@/utils/env';
import sendAllIframes from './utils/plugins/sendAllIframes';
import iframessa from 'iframessa';
import RightBar from './components/common/RightBar/Index.vue';
import TrialPeriod from './modals/TrialPeriod.vue';
import { setUser } from '@sentry/browser';
import projects from './api/projects';
// import WarningVerifyMail from './components/WarningVerifyMail.vue';
import PosRegister from './views/register/index.vue';
import ModalRegistered from './views/register/ModalRegistered.vue';
import SystemIntelligences from './components/SystemIntelligences.vue';
import SystemCommerce from './components/SystemCommerce.vue';
import moment from 'moment-timezone';
import { waitFor } from './utils/waitFor.js';
import { PROJECT_COMMERCE } from '@/utils/constants';
import { useFavicon } from '@vueuse/core';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import { mapStores } from 'pinia';
import { useSharedStore } from './store/Shared.js';

const favicons = {};

['', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-9+'].forEach(
  (name) => {
    favicons[name] = require(`@/assets/logos/favicon${name}.svg`);
  },
);

export default {
  components: {
    Sidebar,
    Topbar,
    SystemIntelligences,
    SystemCommerce,
    ExternalSystem,
    Modal,
    WarningMaxActiveContacts,
    ApiOptions,
    RightBar,
    TrialPeriod,
    // WarningVerifyMail,
    PosRegister,
    ModalRegistered,
  },

  data() {
    return {
      showTrialPeriodModal: false,
      isModalCreatedProjectOpen: false,

      requestingLogout: false,
      doingAthentication: false,
      requestingProject: false,
      requestingOrg: false,
      externalSystems: [
        'academy',
        'integrations',
        'studio',
        'push',
        'agentBuilder',
        'commerce',
        'bothub',
        'chats',
        'insights',
        'apiFlows',
        'apiIntelligence',
        'apiNexus',
      ],
      unreadMessages: 0,
      championChatbotsByProject: {},
      isComercialTiming: false,
      isComercialTimingInterval: null,
      isVtexUser: false,
      requestingProjectsByOrgV2: false,
    };
  },

  computed: {
    ...mapStores(useSharedStore),

    ...mapGetters(['currentProject']),

    ...mapState({
      accountProfile: (state) => state.Account.profile,
      accountLoading: (state) => state.Account.loading,
      modals: (state) => state.Modal.actives,
      currentOrg: (state) => state.Org.currentOrg,
    }),

    firstAccessDataLoading() {
      return (
        this.$store.state.Account.additionalInformation.status === 'loading'
      );
    },

    showPosRegister() {
      const isMissigDataVerify =
        this.$store.state.Account.profile &&
        !this.$store.state.Account.profile?.last_update_profile;

      const isShow = !this.isVtexUser ? isMissigDataVerify : false;

      return isShow;
    },

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

    isCommerceProject() {
      const featureFlagsStore = useFeatureFlagsStore();
      return (
        this.currentProject?.project_mode === PROJECT_COMMERCE &&
        featureFlagsStore.flags.newConnectPlataform
      );
    },

    loading() {
      return (
        this.accountLoading ||
        this.firstAccessDataLoading ||
        this.requestingLogout ||
        this.doingAthentication ||
        this.requestingProject ||
        this.requestingOrg ||
        this.requestingProjectsByOrgV2 ||
        this.$route.name === null
      );
    },

    loadingWithPath() {
      return `${this.loading}-${this.$route.fullPath}`;
    },

    shouldLoadHelpBot() {
      if (!this.currentOrg?.uuid || this.isCommerceProject) return false;

      return (
        this.isComercialTiming &&
        this.currentOrg?.show_chat_help &&
        this.isInsideProject
      );
    },

    showHelpBot() {
      return this.shouldLoadHelpBot && this.$route.name !== 'chats';
    },

    isInsideProject() {
      return !!this.$route.params?.projectUuid;
    },

    chatSessionId() {
      if (
        !this.shouldLoadHelpBot ||
        !this.accountProfile?.email ||
        !this.currentOrg?.name
      ) {
        return null;
      }

      return `${this.accountProfile?.email}:${this.currentOrg.name}`;
    },
  },

  watch: {
    showHelpBot: {
      handler() {
        waitFor(() => document.getElementById('wwc')).then((helpBot) => {
          helpBot.style.display = this.showHelpBot ? 'block' : 'none';
        });
      },
      immediate: true,
    },

    firstAccessDataLoading: {
      immediate: true,
      async handler() {
        if (
          this.$store.state.Account.profile &&
          !this.$store.state.Account.profile?.last_update_profile
        ) {
          const additionalInformationOrgUuid =
            this.$store.state.Account?.additionalInformation?.data?.organization
              ?.uuid;

          if (additionalInformationOrgUuid) {
            this.loadProjectsByOrgV2(additionalInformationOrgUuid);
          }
        }
      },
    },

    chatSessionId: {
      handler() {
        if (!this.chatSessionId) {
          return;
        }

        if (!window.WebChat) {
          initWebChat();
        }

        waitFor(() => window.WebChat).then((WebChat) => {
          WebChat.setSessionId(this.chatSessionId);
        });
      },

      immediate: true,
    },

    accountProfile(newAccountProfile) {
      if (newAccountProfile.email) {
        initHotjar(newAccountProfile.email);
      }
    },

    '$store.getters.currentProject.uuid': {
      immediate: true,
      async handler(projectUuid, previousProjectUuid) {
        if (previousProjectUuid) {
          this.championChatbotsByProject[previousProjectUuid] = undefined;
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

        this.sharedStore.setCurrentProjectUuid(projectUuid || '');

        if (!projectUuid) {
          this.unreadMessages = 0;
          return false;
        }

        this.$refs['system-integrations']?.reset();
        this.$refs['system-flows']?.reset();
        this.$refs['system-chats']?.reset();
        this.$refs['system-insights']?.reset();

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
        const requiresAuth = this.$route.matched.some(
          (record) => record.meta.requiresAuth,
        );

        if (requiresAuth && !this.accountProfile) {
          await this.fetchProfile();

          this.$store.dispatch('loadNews');

          iframessa.getter('userInfo', () => {
            return {
              first_name: this.accountProfile.first_name,
              last_name: this.accountProfile.last_name,
            };
          });

          const name = [
            this.accountProfile.first_name,
            this.accountProfile.last_name,
          ]
            .join(' ')
            .trim();

          setUser({
            id: this.accountProfile.id,
            name,
            email: this.accountProfile.email,
          });
        } else if (!(requiresAuth && this.accountProfile)) {
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
          const favicon = useFavicon();
          favicon.value = favicons[name];
        }
      },
    },
  },

  created() {
    console.log(
      `Version %c${getEnv('VERSION_NUMBER')}`,
      'background: #00DED2; color: #262626',
    );

    this.checkIsComercialTiming();

    this.isComercialTimingInterval = setInterval(() => {
      this.checkIsComercialTiming();
    }, 1000);

    window.addEventListener('openModalAddedFirstInfos', () => {
      this.isModalCreatedProjectOpen = true;
    });

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
        this.currentProject.template_type?.startsWith?.('template') &&
        this.currentProject.first_access
      ) {
        WebChat.clear();

        projects
          .getWhatsAppDemoURL({
            projectUuid: this.$store.getters.currentProject.uuid,
          })
          .then(({ data }) => {
            WebChat.open(`whatsappdemo ${data.url}`);

            this.changeReadyMadeProjectProperties({
              projectUuid: this.currentProject.uuid,
              first_access: false,
            });
          });
      } else if (['chats:redirect', 'redirect'].includes(event.data?.event)) {
        const [module, next] = (event.data?.path || '').split(':');

        const modulesToRouteName = {
          'chats-settings': 'settingsChats',
          intelligences: 'bothub',
          'agents-builder': 'agentBuilder',
          flows: 'push',
        };

        const systemChatsRef = this.$refs['system-chats'];
        const chatsUrl = getEnv('MODULES_YAML').chats;

        const chatsIframe = systemChatsRef.$refs.iframe;

        chatsIframe.src = `${chatsUrl}${next === 'init' ? '' : next}`;

        this.$router.push({
          name: modulesToRouteName[module] || module,
          params: {
            internal: next.split('/'),
          },
        });
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
    this.$store.dispatch('loadLatestNews');
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

    checkIsComercialTiming() {
      const now = moment().tz('America/Maceio');
      const workdays = [1, 2, 3, 4, 5];

      const hour = now.hours();
      const day = now.day();

      this.isComercialTiming = hour >= 8 && hour < 18 && workdays.includes(day);
    },

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

        const {
          has_ia,
          has_flows,
          has_channel,
          has_msg,
          has_channel_production,
        } = await this.$store.dispatch('getSuccessOrgStatusByFlowUuid', {
          flowUuid: this.$store.getters.currentProject.flow_organization,
          force: true,
        });

        iframessa.modules.ai?.emit('update:hasFlows', has_flows);

        const level =
          [
            has_flows,
            has_channel,
            has_msg,
            has_ia,
            has_channel_production,
          ].lastIndexOf(true) + 1;

        if (
          level >= 5 &&
          oldValues &&
          [
            oldValues.has_flows,
            oldValues.has_channel,
            oldValues.has_msg,
            oldValues.has_ia,
            oldValues.has_channel_production,
          ].lastIndexOf(true) +
            1 <
            5
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
        } else if (level < 5) {
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
      } else if (current === 'apiNexus') {
        this.$refs['system-api-nexus'].init(this.$route.params);
      } else if (current === 'academy') {
        this.$refs['system-academy'].init(this.$route.params);
      } else if (current === 'integrations') {
        this.$refs['system-integrations'].init(this.$route.params);
      } else if (current === 'studio' || current === 'push') {
        this.$refs['system-flows'].init(this.$route.params);
      } else if (current === 'chats') {
        this.$refs['system-chats'].init(this.$route.params);
      } else if (current === 'insights') {
        this.$refs['system-insights'].init(this.$route.params);
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
      const orgAlreadyLoaded = this.$store.state.Org.orgs.data.find(
        ({ uuid }) => uuid === orgUuid,
      );

      if (orgUuid !== get(this.currentOrg, 'uuid') || orgAlreadyLoaded) {
        this.setCurrentOrg(orgAlreadyLoaded);
      }

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

    async loadProjectsByOrgV2(orgUuid) {
      try {
        this.requestingProjectsByOrgV2 = true;

        const response = await projects.getProjectsV2({
          organizationUuid: orgUuid,
        });

        const isCommerceType = response.data?.results?.some(
          (project) => project.project_type === 2,
        );

        this.isVtexUser = !!isCommerceType;
      } catch (e) {
        console.error('error loadProjectsByOrgV2 v2:', e);
      } finally {
        this.requestingProjectsByOrgV2 = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
      background-color: $unnnic-color-neutral-light;

      .page-container {
        background-color: $unnnic-color-neutral-snow;
      }
    }
  }
}
</style>

<style lang="scss">
@import '@/assets/scss/style.scss';

@import '@/assets/scss/unnnic-styles.scss';

body {
  margin: 0;
  background-color: $unnnic-color-neutral-snow;
  font-family: $unnnic-font-family-secondary;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

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

  a {
    text-decoration: none;
  }
}
</style>
