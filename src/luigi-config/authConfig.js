import * as Keycloak from 'keycloak-js';

export class CustomAuthenticationProvider {

    constructor(configSettings = {}) {
      const defaultSettings = {
        redirect_uri: window.location.origin + '/custom-auth-callback.html',
      }
      this.keycloak = Keycloak({
        url: 'https://fac12607bcd7.ngrok.io/auth/',
        realm: 'example',
        clientId: 'vue-test',
      });
      this.settings = Object.assign({}, defaultSettings, configSettings);
    }
  ​
    login(){

      this.keycloak.init({ onLoad: 'login-required' }).then((auth) => {
        if (!auth) {
          console.log('NOT Authenticated');
          Luigi.auth().store.setAuthData(data.data);
          Luigi.auth().store.setNewlyAuthorized();
        } else {
          console.log('Authenticated');
          this.save();
        }
      }).catch((e) => {
        console.log('Authenticated Failed');
      });
    }
  
    logout(authData, logoutLuigiCore){
      // call logoutLuigiCore() to reset stored data in Luigi Core
      // logic to handle the logout mechanism
    }
  
    setTokenExpirationAction() {
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
  
    setTokenExpireSoonAction() {}
  
    generateNonce(){
      // returns a string
    }
}