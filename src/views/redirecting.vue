<template>
  <div class="container">
    <div v-if="loading" class="weni-redirecting">
        <loading />
    </div>
    
    <iframe
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
import Loading from '../components/Loading';
import SecurityService from '../services/SecurityService';
import axios from 'axios';

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

  created() {
    const { menu } = JSON.parse(localStorage.getItem('_project'));

    this.urls = menu;
  },

  watch: {
    '$route.path': {
      immediate: true,
      handler () {
        this.loading = true;

        if (this.$route.name === 'push') {
          this.pushRedirect();
        } else if (this.$route.name === 'bothub') {
          this.bothubRedirect();
        } else if (this.$route.name === 'rocket') {
          this.rocketChatRedirect();
        } else if (this.$route.name === 'project') {
          this.projectRedirect();
        } else {
          this.loading = false;
        }
      },
    },
  },

  methods: {
    onLoad(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;
      }
    },

    async pushRedirect() {
      try {
        const { flow_organization } = JSON.parse(localStorage.getItem('_project'));

        const apiUrl = this.urls.flows;
        if (!apiUrl) return null;

        const { uuid } = this.$route.params;

        if (uuid) {
          this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate?next=/flow/editor/${uuid}/`;
        } else {
          this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate`;
        }
      } catch(e) {
        return e;
      }
    },

    async bothubRedirect() {
      const accessToken = await SecurityService.getAcessToken();

      try {
        const { inteligence_organization } = JSON.parse(localStorage.getItem('org'));
        const { uuid } = JSON.parse(localStorage.getItem('_project'));
      
        const apiUrl = this.urls.inteligence;
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
      const accessToken = await SecurityService.getAcessToken();

      try {
        const [apiUrl] = this.urls.chat;
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
        const { flow_organization } = JSON.parse(localStorage.getItem('_project'));
      
        let apiUrl = this.urls.flows;
        if (!apiUrl) return null;

        this.src = `${apiUrl}weni/${flow_organization.uuid}/authenticate?next=/org/home`;
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
