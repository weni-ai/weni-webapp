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

      <router-view
        v-show="!externalSystems.includes($route.name)"
        class="page"
      />

      <external-system
        ref="system-flows"
        v-show="$route.name === 'push'"
        name="push"
        class="page"
      />

      <external-system
        id="intelligence"
        ref="system-ia"
        v-show="$route.name === 'bothub'"
        name="bothub"
        class="page"
      />

      <external-system
        ref="system-agents"
        v-show="$route.name === 'rocket'"
        name="rocket"
        class="page"
      />

      <external-system
        ref="system-project"
        v-show="$route.name === 'project'"
        name="project"
        class="page"
      />
    </div>

    <right-sidebar ref="right-sidebar" />

    <modal ref="modal" :style="{ 'z-index': 5 }" />
  </div>
</template>

<script>
import Sidebar from './components/external/Sidebar.vue';
import Navbar from './components/external/navbar.vue';
import RightSidebar from './components/RightSidebar.vue';
import Modal from './components/external/Modal.vue';
import account from './api/account';
import SecurityService from './services/SecurityService';
import ExternalSystem from './components/ExternalSystem.vue';
import { mapActions, mapGetters } from 'vuex';
import initHelpHero from 'helphero';

export default {
  components: {
    Sidebar,
    Navbar,
    RightSidebar,
    Modal,
    ExternalSystem,
  },

  data() {
    return {
      loading: true,
      loadedUser: null,
      externalSystems: ['push', 'bothub', 'rocket', 'project'],
    };
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),
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

    const keysToRemove = Object.keys(localStorage).filter((key) => {
      if (
        ['loglevel:', 'oidc.', '__HLP_'].some((initial) =>
          key.startsWith(initial),
        )
      ) {
        return false;
      }

      if (['orderProjects', 'projects', 'store', 'lastEmote'].includes(key)) {
        return false;
      }

      return true;
    });

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  mounted() {
    this.$root.$on('manage-members', (data) => {
      this.$refs['right-sidebar'].open('manage-members', data);
    });

    this.$root.$on('view-members', (data) => {
      this.$refs['right-sidebar'].open('view-members', data);
    });

    this.$root.$on('change-name', (data) => {
      this.$refs['right-sidebar'].open('change-name', data);
    });

    this.$root.$on('open-modal', (data) => {
      this.$refs['modal'].open(data);
    });

    this.$root.$on('change-language', async (language) => {
      const languages = {
        en: 'en-us',
        'pt-br': 'pt-br',
      };

      try {
        await account.updateProfileLanguage({
          language: languages[language],
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.$i18n.locale = language;
      }
    });

    if (this.theme === 'normal' && this.$refs['system-agents']) {
      this.$refs['system-agents'].init(this.$route.params);
    }
  },

  watch: {
    '$route.path': {
      immediate: true,
      async handler() {
        if (this.theme === 'normal' && this.$refs['system-agents']) {
          this.$refs['system-agents'].init(this.$route.params);
        }

        if (this.$route.name === 'AuthCallback') {
          this.loading = true;

          SecurityService.UserManager.signinRedirectCallback()
            // eslint-disable-next-line no-unused-vars
            .then((user) => {
              Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('oidc.') && !key.startsWith('oidc.user:')) {
                  localStorage.removeItem(key);
                } else if (
                  key.startsWith('oidc.user:') &&
                  key !== SecurityService.userStoreKey
                ) {
                  localStorage.removeItem(key);
                }
              });
              window.location.href = '/';
            })
            .catch((err) => {
              console.log(err);
              this.$router.push('/');
            });
          return false;
        } else if (this.externalSystems.includes(this.$route.name)) {
          if (this._isMounted) {
            this.initCurrentExternalSystem();
          }
        }

        const requiresAuth = this.$route.matched.some(
          (record) => record.meta.requiresAuth,
        );

        if (requiresAuth && !this.loadedUser) {
          this.loading = true;

          try {
            await this.fetchProfile();

            const { profile } = this.$store.state.Account;

            const languages = {
              'en-us': 'en',
              'pt-br': 'pt-br',
            };

            this.$i18n.locale = languages[profile.language];
            this.loadedUser = true;

            const hlp = initHelpHero(process.env.VUE_APP_HELPHERO);

            hlp.identify(profile.id);
          } catch (error) {
            console.log(error);
          } finally {
            this.loading = false;

            if (this.externalSystems.includes(this.$route.name)) {
              this.$nextTick(() => {
                this.initCurrentExternalSystem();
              });
            }
          }
        } else {
          this.loading = false;
        }
      },
    },
  },

  methods: {
    ...mapActions(['fetchProfile']),

    initCurrentExternalSystem() {
      const current = this.$route.name;

      if (current === 'push') {
        this.$refs['system-flows'].init(this.$route.params);
      } else if (current === 'bothub') {
        this.$refs['system-ia'].init(this.$route.params);
      } else if (current === 'rocket') {
        this.$refs['system-agents'].init(this.$route.params);
      } else if (current === 'project') {
        this.$refs['system-project'].init(this.$route.params);
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

  .navbar {
    z-index: 2;
  }

  .sidebar {
    top: 0;
    position: sticky;
    z-index: 3;
  }

  .content {
    top: 0;
    position: sticky;
    height: 100vh;

    flex: 1;
    display: flex;
    flex-direction: column;

    .page {
      flex: 1;
      overflow: auto;
      z-index: 1;
    }

    &.theme-normal {
      background-color: $unnnic-color-neutral-lightest;

      .page {
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
