<template>
  <div class="container">
    <div v-if="loading" class="weni-redirecting">
        <loading />
    </div>
    
    <iframe
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
import Loading from '../components/Loading';
import request from '../api/request.js';
import Mgr from '../services/SecurityService';
import axios from 'axios';

const getRedirectUrls = async () => {
  try {
    const { uuid } = JSON.parse(localStorage.getItem('_project'));

    return request.$http().get(`/v1/organization/project/${uuid}/`);
  } catch(e) {
    console.log('error', e);
  }
};

export default {
  name: 'Redirecting',
  components: { Loading },
  data() {
    return {
      loading: false,
      src: '',

      urls: null,
    };
  },

  async created() {},

  watch: {
    '$route.path': {
      immediate: true,
      handler () {
        console.log('change path', this.$route.name);

        if (this.$route.name === 'push') {
          this.loading = true;
          this.pushRedirect();
        } else if (this.$route.name === 'bothub') {
          this.loading = true;
          this.bothubRedirect();
        } else if (this.$route.name === 'rocket') {
          this.loading = true;
          this.rocketChatRedirect();
        } else if (this.$route.name === 'project') {
          this.loading = true;
          this.projectRedirect();
        }
      },
    },
  },

  // computed: {
  // },

  methods: {
    async loadUrls() {
      if (this.urls) {
        return this.urls;
      }

      const urls = await getRedirectUrls();

      this.urls = urls;

      return this.urls;
    },

    onLoad(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;
      }
    },

    async pushRedirect() {
      try {
        const { flow_organization } = JSON.parse(localStorage.getItem('_project'));

        const rocketResponse = await this.loadUrls();

        const apiUrl = rocketResponse.data.menu.flows;
        if (!apiUrl) return null;

        const { uuid } = this.$route.params;

        if (uuid) {
          this.src = `${apiUrl}weni/${flow_organization.uuid}/flow/${uuid}/editor`;
        } else {
          this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate`;
        }
      } catch(e) {
        return e;
      }
    },

    async bothubRedirect() {
      const accessToken = await Mgr.getAcessToken();

      try {
        const rocketResponse = await this.loadUrls();
        const { inteligence_organization } = JSON.parse(localStorage.getItem('org'));
        const { uuid } = JSON.parse(localStorage.getItem('_project'));
      
        const apiUrl = rocketResponse.data.menu.inteligence;
        if (!apiUrl) return null;

        const { owner, slug } = this.$route.params;

        if (owner && slug) {
          this.src =  (`${apiUrl}dashboard/${owner}/${slug}/`);
        } else {
          const token = `Bearer+${accessToken}`;

          this.src = `${apiUrl}loginexternal/${token}/${inteligence_organization}/${uuid}/`;
        }
      } catch(e) {
        return e;
      }
    },

    async rocketChatRedirect() {
      const accessToken = await Mgr.getAcessToken();

      try {
        const rocketResponse = await this.loadUrls();
      
        const [apiUrl] = rocketResponse.data.menu.chat;
        if (!apiUrl) return null;
      
        const response = await axios.post(
          `${apiUrl}/api/v1/login/`, 
          {
            serviceName: 'keycloak',
            accessToken,
            expiresIn: 200,
          }
        );
      
        const json = response.data;
        this.src = (`${apiUrl}/home?resumeToken=${json.data.authToken}`);
        return response.data.authToken;
      } catch(e) {
        return e;
      }
    },

    async projectRedirect() {
      try {
        const rocketResponse = await this.loadUrls();
        const { flow_organization } = JSON.parse(localStorage.getItem('_project'));
      
        let apiUrl = rocketResponse.data.menu.flows;
        if (!apiUrl) return null;

        this.src = (`${apiUrl}weni/${flow_organization.uuid}/config`);
      } catch(e) {
        return e;
      }
    },
  },
}
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
</style>
