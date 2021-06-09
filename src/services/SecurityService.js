/* eslint-disable */
import Oidc from 'oidc-client';
import UserManager from './UserManager';
import ApiInstance from '../api/ApiInstance';

var mgr = new UserManager({
  userStore: new Oidc.WebStorageStateStore(),
  authority: process.env.VUE_APP_KEYCLOAK_ISSUER,

  metadata: {
    issuer: process.env.VUE_APP_KEYCLOAK_ISSUER,
    authorization_endpoint: process.env.VUE_APP_KEYCLOAK_AUTHORIZATION_ENDPOINT,
    userinfo_endpoint: process.env.VUE_APP_KEYCLOAK_USERINFO_ENDPOINT,
    end_session_endpoint: process.env.VUE_APP_KEYCLOAK_END_SESSION_ENDPOINT,
    jwks_uri: process.env.VUE_APP_KEYCLOAK_JWKS_URI,
    token_endpoint: process.env.VUE_APP_KEYCLOAK_TOKEN_ENDPOINT,
    check_session_iframe: process.env.VUE_APP_KEYCLOAK_CHECK_SESSION_IFRAME,
  },

  client_id: process.env.VUE_APP_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin + '/AuthCallback',
  response_type: 'code',
  response_mode: 'fragment',
  accept: 'application/json, text/plain, */*',
  scope: 'email profile openid offline_access',
  post_logout_redirect_uri: window.location.origin,
  accessTokenExpiringNotificationTime: 10,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
});

Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.INFO;

mgr.events.addUserLoaded(function(user) {
  console.log('New User Loaded：', arguments);
  console.log('acess_token: ', user.access_token);
  ApiInstance.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${user.access_token}`;
});

mgr.events.addAccessTokenExpiring(function() {
  console.log('AccessToken Expiring：', arguments);
});

mgr.events.addAccessTokenExpired(function() {
  console.log('AccessToken Expired：', arguments);
  mgr
    .signoutRedirect()
    .then(function(resp) {
      console.log('signed out', resp);
    })
    .catch(function(err) {
      console.log(err);
    });
});

mgr.events.addSilentRenewError(function() {
  console.error('Silent Renew Error：', arguments);
});

mgr.events.addUserSignedOut(function() {
  console.log('UserSignedOut：', arguments);
  mgr
    .signoutRedirect()
    .then(function(resp) {
      console.log('signed out', resp);
    })
    .catch(function(err) {
      console.log(err);
    });
});

export default new (class SecurityService {
  get UserManager() {
    return mgr;
  }

  get userStoreKey() {
    return `oidc.${mgr._userStoreKey}`;
  }

  // Renew the token manually
  renewToken() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .signinSilent()
        .then(function(user) {
          if (user == null) {
            self.signIn(null);
          } else {
            return resolve(user);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Get the user who is logged in
  getUser() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Check if there is any user logged in
  getSignedIn() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(false);
          } else {
            return resolve(true);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Redirect of the current window to the authorization endpoint.
  signIn() {
    mgr.signinRedirect().catch(function(err) {
      console.log(err);
    });
  }

  // Redirect of the current window to the end session endpoint
  signOut() {
    localStorage.removeItem('lastEmote');
    mgr
      .signoutRedirect()
      .then(function(resp) {
        console.log('signed out', resp);
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  // Get the profile of the user logged in
  getProfile() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user.profile);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Get the token id
  getIdToken() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user.id_token);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Get the session state
  getSessionState() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user.session_state);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Get the access token of the logged in user
  getAcessToken() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user.access_token);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Takes the scopes of the logged in user
  getScopes() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user.scopes);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }

  // Get the user roles logged in
  getRole() {
    let self = this;
    return new Promise((resolve, reject) => {
      mgr
        .getUser()
        .then(function(user) {
          if (user == null) {
            self.signIn();
            return resolve(null);
          } else {
            return resolve(user.profile.role);
          }
        })
        .catch(function(err) {
          console.log(err);
          return reject(err);
        });
    });
  }
})();
