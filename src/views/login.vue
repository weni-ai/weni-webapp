<template>
  <div class="hello">
    <h1>OpenID Connect Client</h1>
    <button v-on:click="authenticate">Authenticate</button>
    <button v-on:click="logout">Logout</button>
    <button v-on:click="refresh">Refresh</button>
    <button v-on:click="test">Test</button>
    <h3> Access Token: {{ accessToken }}</h3>
  </div>
</template>

<script>
import axios from 'axios';
import * as Keycloak from 'keycloak-js';
import LuigiClient from '@luigi-project/client';

export default {
  name: 'Login',
  data() {
    return {
      fruitsArray: [],
      accessToken: '',
      keycloak: null,
    };
  },
  mounted() {
    this.accessToken = LuigiClient.getToken();
    this.keycloak = Keycloak({
      url: 'http://localhost:8080/auth',
      realm: 'example',
      clientId: 'vue-test',
    });
  },
  methods: {
    test() {
      this.accessToken = LuigiClient.getToken();
      console.log({token: this.accessToken});
    },
    logout() {
       LuigiClient.sendCustomMessage({ id: 'on logout' });
    },
    refresh() {
      console.log('Refreshing');
      try {
        this.keycloak.updateToken(2).then(() => {
          console.log('Then');
          this.save();
        }).catch(() => {
          alert('Failed to refresh token');
        });
      } catch (e) {
        console.log(e);
      }
    },
    save() {
      localStorage.setItem('vue-token', this.keycloak.token);
      localStorage.setItem('vue-refresh-token', this.keycloak.refreshToken);
      this.AccessToken = this.keycloak.token;
      console.log({ token: this.keycloak.token, refresh: this.keycloak.refreshToken });
    },
    authenticate() {
      LuigiClient.sendCustomMessage({ id: 'on login' });
      return;
    // keycloak init options

      this.AccessToken = 'Authenticating....';

      this.keycloak.init({ onLoad: 'login-required' }).success((auth) => {
        if (!auth) {
          console.log('NOT Authenticated');
          this.AccessToken = '';
        } else {
          console.log('Authenticated');
          this.save();
        }
      }).error(() => {
        console.log('Authenticated Failed');
      });
    },
    getData() {
      const vm = this;
      axios.get('http://localhost:3000/fruit', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('vue-token')}`,
        },
      }).then((res) => {
        vm.fruitsArray = res.data;
      })
        .catch((err) => {
          alert(err);
        });
    },
  },
  created() {
    // this.getData();
  },
};
</script>

<style lang="scss" scoped>
  .hello {
    word-wrap: break-word;
  }
</style>