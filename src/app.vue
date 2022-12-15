<template>
  <div v-if="loading" class="loading">
    <img class="logo" src="./assets/LogoWeniAnimada.svg" />
  </div>

  <div v-else class="app">
    <div>
      <Sidebar class="sidebar" />
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

        <external-system ref="system-ia" :routes="['bothub']" class="page" />

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
        />
      </div>
    </div>

    <modal v-for="(modal, index) in modals" :key="index" v-bind="modal" />

    <know-user-modal v-if="!$store.state.Account.profile.last_update_profile" />
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
import initHelpHero from 'helphero';
import LogRocket from 'logrocket';
import { get } from 'lodash';
import getEnv from '@/utils/env';
import sendAllIframes from './utils/plugins/sendAllIframes';
import iframessa from 'iframessa';
import KnowUserModal from './components/KnowUserModal/Index.vue';

let hlp;

function setHelpHeroDisplay(value) {
  const helpHeroButton = document.querySelector('#helphero-dom');

  if (helpHeroButton) {
    helpHeroButton.style.display = value;
  }
}

export default {
  components: {
    Sidebar,
    Navbar,
    ExternalSystem,
    Modal,
    WarningMaxActiveContacts,
    ApiOptions,
    KnowUserModal,
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
    };
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    ...mapState({
      accountProfile: (state) => state.Account.profile,
      accountLoading: (state) => state.Account.loading,
      modals: (state) => state.Modal.actives,
    }),

    documentTitleWatcher() {
      return [this.$route.name, this.$i18n.locale].join('-');
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
        this.currentProject.project_type === 'template' &&
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

      if (
        get(event.data, 'event') === 'startHelpHeroTour' &&
        get(event.data, 'tourId')
      ) {
        const tourId = get(event.data, 'tourId');
        hlp.startTour(tourId);
      }
    });
  },

  mounted() {
    if (this.theme === 'normal' && this.$refs['system-agents']) {
      this.$refs['system-agents'].init(this.$route.params);
    }
  },

  watch: {
    documentTitleWatcher: {
      immediate: true,
      handler() {
        const title = this.$route.meta?.title;

        document.title = title ? this.$t(title) : 'Weni';
      },
    },

    '$route.params.projectUuid': {
      async handler() {
        const { projectUuid } = this.$route.params;

        if (!projectUuid) {
          return false;
        }

        this.$refs['system-integrations'].reset();
        this.$refs['system-flows'].reset();
        this.$refs['system-ia'].reset();
        this.$refs['system-agents'].reset();
        this.$refs['system-chats'].reset();

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
            });
          }

          hlp = initHelpHero(getEnv('VUE_APP_HELPHERO'));

          iframessa.getterChild('userInfo', () => {
            return {
              first_name: this.accountProfile.first_name,
              last_name: this.accountProfile.last_name,
            };
          });

          hlp.identify(this.accountProfile.id, {
            language:
              this.accountProfile.language === 'pt-br' ? 'pt-br' : 'en-us',
          });

          window.addEventListener('hideBottomRightOptions', () => {
            setHelpHeroDisplay('none');
          });

          window.addEventListener('showBottomRightOptions', () => {
            setHelpHeroDisplay(null);
          });

          LogRocket.init(getEnv('LOGROCKET_ID'), {
            mergeIframes: true,
            childDomains: String(getEnv('LOGROCKET_CHILD_DOMAINS') || '').split(
              ',',
            ),
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
            });
            return false;
          }
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
