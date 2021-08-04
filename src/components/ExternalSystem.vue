<template>
  <div class="container">
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
      :src="src"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
import _ from 'lodash';
import SecurityService from '../services/SecurityService';
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'Redirecting',

  props: {
    name: {
      type: String,
    },

    id: {
      type: String,
    },
  },

  data() {
    return {
      projectUuid: null,

      loading: false,
      src: '',

      urls: null,

      alreadyInitialized: false,

      localPathname: '',

      lastPathnameBySystem: {
        studio: '',
        flows: '',
      },
    };
  },

  mounted() {
    window.addEventListener('message', (event) => {
      const src = _.get(this.$refs.iframe, 'src');

      if (!src) {
        return false;
      }

      if (event.origin !== new URL(src).origin) {
        return false;
      }

      const pathname = event.data;

      this.localPathname = pathname;
    });
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    isFlows() {
      return ['/flow/', '/flowstart/', '/webhookresult/'].some((flowPathname) =>
        this.localPathname.includes(flowPathname),
      );
    },

    isStudio() {
      return !this.isFlows;
    },
  },

  watch: {
    localPathname() {
      const routeName = this.$route.name;

      if (['studio', 'push'].includes(routeName) && this.name === 'push') {
        if (this.isFlows && routeName !== 'push') {
          this.$router.push('/systems/push');
        } else if (this.isStudio && routeName !== 'studio') {
          this.$router.push('/system/studio');
        }
      }
    },

    '$route.path': {
      immediate: true,

      handler() {
        const routeName = this.$route.name;

        if (['studio', 'push'].includes(routeName) && this.name === 'push') {
          if (routeName === 'studio' && this.isFlows) {
            this.$router.push({ query: { init: 'force' } });
          } else if (routeName === 'push' && this.isStudio) {
            this.$router.push({ query: { init: 'force' } });
          }
        }
      },
    },

    '$i18n.locale'() {
      this.loading = true;

      setTimeout(() => {
        // eslint-disable-next-line
        this.$refs.iframe.src = this.$refs.iframe.src;
      }, 5000);
    },
  },

  methods: {
    init(params) {
      const { menu, uuid } = this.currentProject;

      const forceInit = _.get(this.$route.query, 'init', '') === 'force';

      if (
        !this.alreadyInitialized ||
        this.projectUuid !== uuid ||
        !_.isEmpty(params) ||
        forceInit
      ) {
        this.urls = menu;

        this.loading = true;
        if (this.name === 'push') {
          this.pushRedirect();

          if (forceInit) {
            this.$router.push({
              query: {
                ...this.$route.query,
                init: null,
              },
            });
          }
        } else if (this.name === 'bothub') {
          this.bothubRedirect();
        } else if (this.name === 'rocket') {
          this.rocketChatRedirect();
        } else if (this.name === 'project') {
          this.projectRedirect();
        } else {
          this.loading = false;
        }

        this.projectUuid = uuid;
        this.alreadyInitialized = true;
      }
    },

    onLoad(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;
      }
    },

    async pushRedirect() {
      try {
        const { flow_organization } = this.currentProject;
        const apiUrl = this.urls.flows;
        if (!apiUrl) return null;

        const { uuid } = this.$route.params;

        const routeName = this.$route.name;

        if (routeName === 'studio') {
          this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate`;
        } else if (routeName === 'push') {
          if (uuid) {
            this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate?next=/flow/editor/${uuid}/`;
          } else {
            this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate?next=/flow/`;
          }
        }
      } catch (e) {
        return e;
      }
    },

    async bothubRedirect() {
      const accessToken = await SecurityService.getAcessToken();

      try {
        const { inteligence_organization } = this.currentOrg;
        const { uuid } = this.currentProject;

        const apiUrl = this.urls.inteligence;
        if (!apiUrl) return null;

        const { owner, slug } = this.$route.params;

        if (owner && slug) {
          this.src = `${apiUrl}dashboard/${owner}/${slug}/`;
        } else {
          const token = `Bearer+${accessToken}`;

          this.src = `${apiUrl}loginexternal/${token}/${inteligence_organization}/${uuid}/`;
        }
      } catch (e) {
        return e;
      }
    },

    async rocketChatRedirect() {
      const accessToken = await SecurityService.getAcessToken();

      try {
        const [apiUrl] = this.urls.chat;
        if (!apiUrl) return null;

        const response = await axios.post(`${apiUrl}/api/v1/login/`, {
          serviceName: 'keycloak',
          accessToken,
          expiresIn: 200,
        });

        const json = response.data;
        this.src = `${apiUrl}/home?resumeToken=${json.data.authToken}`;
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

        this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate?next=/org/home`;
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
