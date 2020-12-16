<template>
  <div class="hello">
    <h1>OpenID Connect Client</h1>
    <button v-on:click="authenticate">Authenticate</button>
    <button v-on:click="logout">Logout</button>
    <button v-on:click="refresh">Refresh</button>
    <button v-on:click="test">Test</button>
    <h3> Access Token: {{ accessToken }}</h3>
    <h4>{{ fruitsArray }}</h4>
  </div>
</template>

<script>
import axios from 'axios';
import LuigiClient from '@luigi-project/client';

export default {
  name: 'Login',
  data() {
    return {
      fruitsArray: [],
      accessToken: LuigiClient.getToken().token,
      keycloak: null,
    };
  },
  mounted() {
    this.accessToken = LuigiClient.getToken().token;
  },
  methods: {
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
    test() {
      this.accessToken = LuigiClient.getToken().token;
      console.log(this.accessToken);
    },
    logout() {
      LuigiClient.sendCustomMessage({ id: 'on logout' });
    },
    save() {
      localStorage.setItem('vue-token', 'token');
      localStorage.setItem('vue-refresh-token', 'refresh');
      this.AccessToken = 'token';

      const data = {
        accessToken: 'some access token',
        accessTokenExpirationDate: 0,
        idToken: 'refresh token',
      };

      LuigiClient.sendCustomMessage({ id: 'on login', data });
    },
    authenticate() {
    // keycloak init options
      this.save();
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
