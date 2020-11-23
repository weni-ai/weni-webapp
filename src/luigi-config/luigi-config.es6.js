import oAuth2ImplicitGrant from '@luigi-project/plugin-auth-oauth2';
import oidcProvider from '@luigi-project/plugin-auth-oidc';
import axios from 'axios';

const getLogin = async () => {
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log(Luigi.elements().getMicrofrontendIframes());
  return;
  const apiUrl = 'http://19ceb3782fbe.ngrok.io/';
  axios.post(`${apiUrl}api/v1/login`, {
        username: 'new-user',
        password: 'new-users-passw0rd'
    }).then(function (response) {
      console.log({ response } );
      if (response.data.status === 'success') {
				  frame.contentWindow.postMessage({
					  event: 'login-with-token',
					  loginToken: response.data.data.authToken,
        }, apiUrl);
      }
  })
}

Luigi.setConfig({
  navigation: {
    nodes: () => [
      {
        pathSegment: 'home',
        label: 'Home',
        icon: 'home',
        viewUrl: '/sampleapp.html#/home',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'login',
            label: 'Login',
            icon: 'paper-plane',
            viewUrl: '/sampleapp.html#/login',
            anonymousAccess: true,
          },
          {
            pathSegment: 'bothub',
            label: 'Bothub',
            icon: 'nutrition-activity',
            viewUrl: 'http://bh-connect.bothub.it:8089/',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'push',
            label: 'Push',
            icon: 'paper-plane',
            viewUrl: 'http://rp-connect.ilhasoft.dev:8000/oidc/authenticate/',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'rocketchat',
            label: 'RocketChat',
            icon: 'paper-plane',
            viewUrl: '/sampleapp.html#/rc',
            loadingIndicator: {
              enabled: true,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
          // {
          //   category: { label: 'Links', icon: 'cloud' },
          //   label: 'Luigi Project',
          //   externalLink: {
          //     url: 'https://luigi-project.io/'
          //   }
          // },
          // {
          //   category: 'Links',
          //   label: 'Vue.js',
          //   externalLink: {
          //     url: 'https://vuejs.org/'
          //   }
          // }
        ]
      }
    ]
  },
  settings: {
    hideNavigation: false,
    responsiveNavigation: 'semiCollapsible',
    appLoadingIndicator: {
      hideAutomatically: true
    },
    header: {
      title: 'Ilhasoft',
      logo: '/logo.png'
    },
    responsiveNavigation: 'simpleMobileOnly'
  },
  communication: {
    customMessagesListeners: {
      'on login': (data) => {
        console.log({ data })
        Luigi.auth().login();
      },
      'on logout': () => {
        Luigi.auth().logout();
      }
    }
  },
  auth: {
    use: 'openIdConnect',
    openIdConnect: {
      idpProvider: oidcProvider,
      authority: 'http://yohan.ilhasoft.dev/auth/realms/ilhasoft/',
      // authority: 'http://localhost:8080/auth/realms/example/',
      // client_id: 'vue-test',
      client_id: 'connect-frontend',
      response_type: 'code',
      response_mode: 'fragment',
      // scope: 'audience:server:client_id:client openID profile email groups',
      // redirect_uri: '/sampleapp.html#/login',
      // post_logout_redirect_uri: '/logout.html',
      automaticSilentRenew: true,
      userInfoFn: async (authSettings, authData) => ({ name: 'name', email: 'email'}),
      accessTokenExpiringNotificationTime: 60,
      // profileStorageInterceptorFn:(jwtProfile)=>{},
    },
    disableAutoLogin: true,
  },
  lifecycleHooks: {
    luigiAfterInit: () => {
      // console.log('login');
      // getLogin();
    }
  }
});
