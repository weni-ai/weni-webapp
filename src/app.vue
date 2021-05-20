<template>
  <div v-if="loading" class="loading">
    <img class="logo" src="./assets/LogoWeniAnimada.svg">
  </div>

  <div v-else class="app">
    <div>
      <Sidebar class="sidebar"/>
    </div>
    <div class="content">
      <Navbar class="navbar"/>
      
      <router-view class="page"/>
    </div>

    <right-sidebar ref="right-sidebar"/>
  </div>
</template>

<script>
import Sidebar from './components/external/Sidebar.vue'
import Navbar from './components/external/navbar.vue'
import RightSidebar from './components/RightSidebar.vue';
import account from './api/account';
import axios from 'axios';
import Oidc from "oidc-client";

const KEYCLOAK_CLIENT_ID = (process.env.KEYCLOAK_CLIENT_ID || 'weni-webapp');
const KEYCLOAK_REALM = (process.env.KEYCLOAK_REALM || 'weni-staging');

const key = `oidc.user:https://accounts.weni.ai/auth/realms/${KEYCLOAK_REALM}:${KEYCLOAK_CLIENT_ID}`;

export default {
  components: {
    Sidebar,
    Navbar,
    RightSidebar,
  },

  data() {
    return {
      loading: true,
      loadedUser: null,
    };
  },

  created() {},

  mounted() {
    this.$root.$on('manage members', (data) => {
      this.$refs['right-sidebar'].open('manage members', data);
    });

    this.$root.$on('view members', (data) => {
      this.$refs['right-sidebar'].open('view members', data);
    });

    this.$root.$on('change name', (data) => {
      this.$refs['right-sidebar'].open('change name', data);
    });

    this.$root.$on('change language', async (language) => {
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

          const mgr = new Oidc.UserManager({
            userStore: new Oidc.WebStorageStateStore(),
            loadUserInfo: true,
            filterProtocolClaims: true,
          });

          mgr
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
            const user = JSON.parse(localStorage.getItem(key));
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.access_token
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
    background-color: #F4F6F8;

    .page {
      border-top-left-radius: $unnnic-border-radius-md;
      flex: 1;
      overflow: auto;
      z-index: 1;
      background-color: white;
    }
  }
}
</style>

<style lang="scss">
  @import '@/assets/scss/style.scss';
  @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
  body {
    margin: 0;
    background-color: white;
    font-family: $unnnic-font-family-secondary;
  }
</style>
