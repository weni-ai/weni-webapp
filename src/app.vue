<template>
  <div v-if="loading" class="loading">
    <img class="logo" src="./assets/LogoWeniAnimada.svg">
  </div>

  <div v-else class="app">
    <div>
      <Sidebar class="sidebar"/>
    </div>
    <div :class="['content', `theme-${theme}`]">
      <Navbar class="navbar"/>
      
      <router-view class="page"/>
    </div>

    <right-sidebar ref="right-sidebar"/>

    <modal ref="modal" :style="{ 'z-index': 4 }"/>
  </div>
</template>

<script>
import Sidebar from './components/external/Sidebar.vue'
import Navbar from './components/external/navbar.vue'
import RightSidebar from './components/RightSidebar.vue';
import Modal from './components/external/Modal.vue';
import account from './api/account';
import Oidc from "oidc-client";

export default {
  components: {
    Sidebar,
    Navbar,
    RightSidebar,
    Modal,
  },

  data() {
    return {
      loading: true,
      loadedUser: null,
    };
  },

  created() {},

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
        'en': 'en-us',
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
  },

  watch: {
    '$route.path': {
      immediate: true,
      async handler() {
        if (this.$route.name === 'AuthCallback') {
          this.loading = true;

          const userManager = new Oidc.UserManager({
            userStore: new Oidc.WebStorageStateStore(),
            loadUserInfo: true,
            filterProtocolClaims: true,
          });

          userManager
            .signinRedirectCallback()
            // eslint-disable-next-line no-unused-vars
            .then((user) => {
              Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("oidc.") && !key.startsWith("oidc.user:")) {
                  localStorage.removeItem(key);
                }
              });
              window.location.href = "/";
            })
            .catch((err) => {
              console.log(err);
              this.$router.push('/');
            });
          return false;
        }

        const requiresAuth = this.$route.matched.some(record => record.meta.requiresAuth);

        if (requiresAuth && !this.loadedUser) {
          this.loading = true;

          try {
            const { data } = await account.profile();

            const languages = {
              'en-us': 'en',
              'pt-br': 'pt-br',
            };

            this.$i18n.locale = languages[data.language];

            localStorage.setItem('user', JSON.stringify(data));
            this.loadedUser = true;
          } catch(error) {
            console.log(error)
          } finally {
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      },
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

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
