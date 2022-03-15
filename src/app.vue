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

        <external-system
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
          ref="system-project"
          :routes="['project']"
          class="page"
        />
      </div>
    </div>

    <modal v-for="(modal, index) in modals" :key="index" v-bind="modal" />
  </div>
</template>

<script>
import Sidebar from './components/external/Sidebar.vue';
import Navbar from './components/external/navbar.vue';
import Modal from './components/external/Modal.vue';
import ExternalSystem from './components/ExternalSystem.vue';
import WarningMaxActiveContacts from './components/billing/WarningMaxActiveContacts.vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import initHelpHero from 'helphero';
import LogRocket from 'logrocket';
import { get } from 'lodash';

export default {
  components: {
    Sidebar,
    Navbar,
    ExternalSystem,
    Modal,
    WarningMaxActiveContacts,
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
        'project',
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
      `Version %c${process.env.VUE_APP_PACKAGE_VERSION}`,
      'background: #00DED2; color: #262626',
    );

    console.log(
      `Hash %c${process.env.VUE_APP_HASH}`,
      'background: #00DED2; color: #262626',
    );

    window.addEventListener('message', (event) => {
      const prefix = 'connect:';
      const content = String(event.data);

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
  },

  mounted() {
    if (this.theme === 'normal' && this.$refs['system-agents']) {
      this.$refs['system-agents'].init(this.$route.params);
    }
  },

  watch: {
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
        this.$refs['system-project'].reset();

        this.loadAndSetAsCurrentProject(projectUuid);
      },
    },

    '$route.params.orgUuid': {
      async handler() {
        const { orgUuid } = this.$route.params;

        if (!orgUuid || orgUuid === 'temp') {
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
        if (this.theme === 'normal' && this.$refs['system-agents']) {
          this.$refs['system-agents'].init(this.$route.params);
        }

        const requiresAuth = this.$route.matched.some(
          (record) => record.meta.requiresAuth,
        );

        if (requiresAuth && !this.accountProfile) {
          await this.fetchProfile();

          const hlp = initHelpHero(process.env.VUE_APP_HELPHERO);

          hlp.identify(this.accountProfile.id, {
            language:
              this.accountProfile.language === 'pt-br' ? 'pt-br' : 'en-us',
          });

          LogRocket.init(process.env.VUE_APP_LOGROCKET_ID, {
            mergeIframes: true,
            childDomains: String(
              process.env.VUE_APP_LOGROCKET_CHILD_DOMAINS || '',
            ).split(','),
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

          if (
            this.$route.name === 'AccountConfirm' &&
            this.accountProfile.last_update_profile
          ) {
            this.$router.push('/orgs');
            return false;
          } else if (
            this.$route.name !== 'AccountConfirm' &&
            !this.accountProfile.last_update_profile
          ) {
            this.$router.push('/account/confirm');
            return false;
          }
        } else if (requiresAuth && this.accountProfile) {
          if (
            this.$route.name === 'AccountConfirm' &&
            this.accountProfile.last_update_profile
          ) {
            this.$router.push('/orgs');
            return false;
          } else if (
            this.$route.name !== 'AccountConfirm' &&
            !this.accountProfile.last_update_profile
          ) {
            this.$router.push('/account/confirm');
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
    ]),

    initCurrentExternalSystem() {
      const current = this.$route.name;

      if (current === 'academy') {
        this.$refs['system-academy'].init(this.$route.params);
      } else if (current === 'integrations') {
        this.$refs['system-integrations'].init(this.$route.params);
      } else if (current === 'studio' || current === 'push') {
        this.$refs['system-flows'].init(this.$route.params);
      } else if (current === 'bothub') {
        this.$refs['system-ia'].init(this.$route.params);
      } else if (current === 'rocket') {
        this.$refs['system-agents'].init(this.$route.params);
      } else if (current === 'project') {
        this.$refs['system-project'].init(this.$route.params);
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
        return false;
      }

      try {
        this.requestingOrg = true;

        const { data: org } = await this.getOrg({
          uuid: orgUuid,
        });

        this.setCurrentOrg(org);
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

      .page {
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
body {
  margin: 0;
  background-color: $unnnic-color-neutral-snow;
  font-family: $unnnic-font-family-secondary;
}
</style>
