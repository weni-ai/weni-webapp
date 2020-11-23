<template>
    <div>
        <button @click="login()">Click me</button> 
        <iframe class="rc-iframe" id="rc" :src="apiUrl" />
    </div>
</template>

<script>
  export default {
    name: 'Rocketchat',
    data() {
      return {
        apiUrl: 'https://platform-rocket-test.push.al/',
      };
    },
    methods: {
      login() {
        const accessToken = this.luigiClient.getToken();
        if (!accessToken) {
          window.alert('Not logged in');
          return;
        }
        console.log('starting login')
        fetch(`${this.apiUrl}api/v1/login/`, { 
          method: "POST",
          body: JSON.stringify({
            serviceName: "keycloak",
            accessToken,
            expiresIn: 200,
          }),
          headers: {
            "Content-type": 'application/json; charset=UTF-8',
            // "Access-Control-Allow-Origin": 'http://localhost:3000/',
          },
        })
          .then(response => {
          console.log('finished request');
          response.json()
            .then(json => this.tryLogin(json))
          })
          .catch(e => console.log(e));
      },
      tryLogin(response) {
        console.log(response);
        const frame = document.getElementById('rc').contentWindow;
        frame.postMessage({
          event: 'login-with-token',
          loginToken: response.data.authToken,
        }, this.apiUrl);
      } 
    }
  }
</script>

<style lang="scss" scoped>
  .rc-iframe {
    height: 93vh;
    width: 100%;
  }
</style>