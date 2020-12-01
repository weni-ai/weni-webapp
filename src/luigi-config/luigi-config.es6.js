import oAuth2ImplicitGrant from '@luigi-project/plugin-auth-oauth2';
import oidcProvider from '@luigi-project/plugin-auth-oidc';
import axios from 'axios';
import rocketChat from './rc-login.js'

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
            viewUrl: 'https://development.bothub.it/',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'push',
            label: 'Push',
            icon: 'paper-plane',
            viewUrl: 'https://rp-connect.push.al/oidc/authenticate/',
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
            viewUrl: 'https://platform-rocket-test.push.al/',
            // viewUrl: 'http://localhost:3000/',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
        ]
      }
    ]
  },
  settings: {
    hideNavigation: false,
    responsiveNavigation: 'semiCollapsible',
    iframeCreationInterceptor: (iframe, viewGroup, navigationNode, microFrontendType) => {
      const token = Luigi.auth().store.getAuthData();
      if (token && token.accessToken && navigatioNode.pathSegment == "rocketchat") {
        iframe.onload = () => {
          const currentFrame = Luigi.elements().getCurrentMicrofrontendIframe();
          if (currentFrame.src !== iframe.src) return;
          rocketChat.rocketChatLogin(currentFrame, token.accessToken); 
        };
      }
    },
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
      authority: 'http://keycloak-connect.push.al/auth/realms/ilhasoft/',
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
