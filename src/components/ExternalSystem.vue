<template>
  <div v-show="routes.includes($route.name)" class="container">
    <div v-if="loading" class="weni-redirecting">
      <img class="logo" src="../assets/LogoWeniAnimada4.svg" />
    </div>

    <iframe
      :id="id"
      ref="iframe"
      @load="onLoad"
      v-show="!loading"
      class="weni-redirecting"
      allow="clipboard-read; clipboard-write;"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
import sendAllIframes from '../utils/plugins/sendAllIframes';
import axios from 'axios';
import { mapGetters } from 'vuex';
import { get } from 'lodash';

export default {
  name: 'Redirecting',

  props: {
    dontUpdateWhenChangesLanguage: {
      type: Boolean,
      default: false,
    },

    id: {
      type: String,
    },

    routes: {
      type: Array,

      default() {
        return [];
      },
    },
  },

  data() {
    return {
      projectUuid: null,

      loading: false,
      reloadAfterLoaded: false,
      src: '',

      urls: null,

      alreadyInitialized: {},
      localPathname: {},

      lastSystem: '',
    };
  },

  mounted() {
    window.addEventListener('message', (event) => {
      const src = get(this.$refs.iframe, 'src');

      if (!src) {
        return false;
      }

      if (event.origin !== new URL(src).origin) {
        return false;
      }

      const eventName = get(event.data, 'event');

      if (eventName === 'getLanguage') {
        sendAllIframes('setLanguage', {
          language: this.$store.state.Account.profile.language,
        });
      } else if (
        eventName === 'changePathname' &&
        this.routes.includes(this.$route.name)
      ) {
        const pathname = get(event.data, 'pathname');

        if (['studio', 'push'].includes(this.$route.name)) {
          const name = this.isFlows(pathname) ? 'push' : 'studio';

          this.localPathname[name] = pathname;

          this.lastSystem = name;

          if (
            (this.isFlows(pathname) && this.$route.name !== 'push') ||
            (!this.isFlows(pathname) && this.$route.name !== 'studio')
          ) {
            this.$router.replace({
              name,
              params: {
                projectUuid: get(this.currentProject, 'uuid'),
                internal: this.localPathname[name]
                  .split('/')
                  .slice(1)
                  .filter((item) => item),
              },
            });
          } else {
            this.updateInternalParam();
          }
        } else {
          this.localPathname[this.$route.name] = pathname;

          this.updateInternalParam();
        }
      } else if (
        eventName === 'getConnectBaseURL' &&
        this.routes.includes(this.$route.name)
      ) {
        const connectBaseURL = `${location.origin}${
          this.$route.path.match(
            new RegExp(`.+${this.currentProject.uuid}/[A-z]+`),
          )[0]
        }`;

        this.$refs.iframe.contentWindow.postMessage(
          {
            event: 'setConnectBaseURL',
            connectBaseURL,
          },
          '*',
        );
      }
    });
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    nextParam() {
      const internal =
        typeof this.$route.params.internal === 'string'
          ? this.$route.params.internal
          : this.$route.params.internal.join('/');

      return internal !== 'init' ? `?next=${internal}` : '';
    },
  },

  watch: {
    '$route.params.internal': {
      immediate: true,

      handler(internal) {
        if (internal !== 'init') {
          return false;
        }

        this.updateInternalParam();
      },
    },

    '$i18n.locale'() {
      if (this.dontUpdateWhenChangesLanguage) {
        return;
      }

      this.loading = true;

      setTimeout(() => {
        if (this.alreadyInitialized[this.$route.name]) {
          // eslint-disable-next-line
          this.$refs.iframe.src = this.$refs.iframe.src;
        }
      }, 5000);
    },
  },

  methods: {
    reset() {
      this.alreadyInitialized = {};
      this.localPathname = {};
      this.lastSystem = '';
    },

    isFlows(pathname) {
      return ['/flow/', '/flowstart/', '/webhookresult/'].some((flowPathname) =>
        pathname.startsWith(flowPathname),
      );
    },

    setSrc(src) {
      this.loading = true;

      this.src = src;

      this.$refs.iframe.src = this.src;
    },

    init() {
      const uuid = get(this.currentProject, 'uuid');
      const menu = get(this.currentProject, 'menu', {});

      if (this.routes.includes('academy')) {
        this.academyRedirect();
      } else if (
        ['studio', 'push'].some((name) => this.routes.includes(name)) &&
        this.alreadyInitialized[this.$route.name] &&
        this.lastSystem &&
        this.lastSystem !== this.$route.name
      ) {
        if (this.loading) {
          this.reloadAfterLoaded = true;
        } else {
          this.pushRedirect();
        }
      } else if (
        !this.alreadyInitialized[this.$route.name] ||
        this.projectUuid !== uuid
      ) {
        this.urls = menu;

        this.loading = true;
        if (this.routes.includes('integrations')) {
          this.integrationsRedirect();
        } else if (
          ['studio', 'push'].some((name) => this.routes.includes(name))
        ) {
          this.pushRedirect();
        } else if (this.routes.includes('bothub')) {
          this.bothubRedirect();
        } else if (this.routes.includes('rocket')) {
          this.rocketChatRedirect();
        } else if (this.routes.includes('project')) {
          this.projectRedirect();
        } else {
          this.loading = false;
        }

        this.projectUuid = uuid;
        this.alreadyInitialized[this.$route.name] = true;
      }
    },

    updateInternalParam() {
      if (this.localPathname[this.$route.name]) {
        this.$router
          .replace({
            params: {
              internal: this.localPathname[this.$route.name]
                .split('/')
                .slice(1)
                .filter((item) => item),
            },
          })
          .catch((error) => {
            if (error.name === 'NavigationDuplicated') {
              return;
            }

            throw error;
          });
      }
    },

    onLoad(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;

        if (this.reloadAfterLoaded) {
          this.pushRedirect();
          this.reloadAfterLoaded = false;
        }
      }
    },

    async academyRedirect() {
      try {
        const apiUrl = 'https://academy.dev.cloud.weni.ai/';

        const token = `Bearer+${this.$keycloak.token}`;

        this.setSrc(`${apiUrl}loginexternal/${token}/${this.nextParam}`);
      } catch (e) {
        return e;
      }
    },

    async integrationsRedirect() {
      const accessToken = this.$keycloak.token;

      try {
        const { uuid } = this.currentProject;

        const apiUrl = this.urls.integrations;
        if (!apiUrl) return null;

        const token = `Bearer+${accessToken}`;

        this.setSrc(`${apiUrl}loginexternal/${token}/${uuid}${this.nextParam}`);
      } catch (e) {
        return e;
      }
    },

    async pushRedirect() {
      try {
        const { flow_organization } = this.currentProject;
        const apiUrl = this.urls.flows;
        if (!apiUrl) return null;

        const routeName = this.$route.name;

        let next =
          !this.nextParam && routeName === 'push'
            ? '?next=/flow/'
            : this.nextParam
            ? this.nextParam + '/'
            : '';

        this.setSrc(
          `${apiUrl}weni/${flow_organization}/authenticate${next.replace(
            /(\?next=)\/?(.+)/,
            '$1/$2',
          )}`,
        );
      } catch (e) {
        return e;
      }
    },

    async bothubRedirect() {
      const accessToken = this.$keycloak.token;

      try {
        const { inteligence_organization } = this.currentOrg;
        const { uuid } = this.currentProject;

        const apiUrl = this.urls.inteligence;
        if (!apiUrl) return null;

        const { owner, slug } = this.$route.params;

        if (owner && slug) {
          this.setSrc(`${apiUrl}dashboard/${owner}/${slug}/`);
        } else {
          const token = `Bearer+${accessToken}`;

          this.setSrc(
            `${apiUrl}loginexternal/${token}/${inteligence_organization}/${uuid}/${this.nextParam}`,
          );
        }
      } catch (e) {
        return e;
      }
    },

    async rocketChatRedirect() {
      const accessToken = this.$keycloak.token;

      try {
        const [apiUrl] = this.urls.chat;
        if (!apiUrl) return null;

        const response = await axios.post(`${apiUrl}/api/v1/login/`, {
          serviceName: 'keycloak',
          accessToken,
          expiresIn: 200,
        });

        const json = response.data;
        this.setSrc(`${apiUrl}/home?resumeToken=${json.data.authToken}`);
        return response.data.authToken;
      } catch (e) {
        return e;
      }
    },

    async projectRedirect() {
      try {
        const { flow_organization } = this.currentProject;

        let apiUrl = this.urls.flows;
        if (!apiUrl) return null;

        let next = this.nextParam ? this.nextParam : '?next=/org/home';

        this.setSrc(
          `${apiUrl}weni/${flow_organization}/authenticate${next.replace(
            /(\?next=)\/?(.+)/,
            '$1/$2',
          )}`,
        );
      } catch (e) {
        return e;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;

  .weni-redirecting {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    height: auto;
  }
}

.logo {
  width: 10%;
  max-width: 64px;
  max-height: 64px;
}
</style>
