import oidcProvider from '@luigi-project/plugin-auth-oidc';
import rocketChat from './rc-login.js'
import bothubLogin from './bothub-login.js';
import { i18nProvider } from './i18n-provider';

const coreConfig = {
  navigation: {
    nodes: () => [
      {
        pathSegment: 'dashboard',
        label: 'h',
        viewUrl: '/sampleapp.html#/home',
        anonymousAccess: true,
        children: [
          {
            pathSegment: 'home',
            label: 'SIDEBAR.HOME',
            icon: 'house-2-2',
            viewUrl: '/sampleapp.html#/home',
            category: 'SIDEBAR.MAIN_MENU',
            anonymousAccess: true,
          },
          {
            pathSegment: 'login',
            label: 'Login',
            icon: 'gauge-dashboard-2',
            viewUrl: '/sampleapp.html#/login',
            category: 'SIDEBAR.MAIN_MENU',
            anonymousAccess: true,
          },
          {
            pathSegment: 'bothub',
            label: 'SIDEBAR.BH',
            icon: 'science-fiction-robot-2',
            // viewUrl: 'https://development.bothub.it/',
            viewUrl: 'http://localhost:8081/',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'push',
            label: 'SIDEBAR.PUSH',
            icon: 'hierarchy-3-2',
            viewUrl: 'https://rp-connect.push.al/oidc/authenticate/',
            category: 'SIDEBAR.SYSTEMS',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'rocketchat',
            label: 'SIDEBAR.RC',
            icon: 'messaging-we-chat-2',
            viewUrl: 'https://platform-rocket-test.push.al/',
            category: 'SIDEBAR.SYSTEMS',
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
    customTranslationImplementation: i18nProvider,
    hideNavigation: true,
    responsiveNavigation: 'semiCollapsible',
    iframeCreationInterceptor: (iframe, viewGroup, navigationNode, microFrontendType) => {
      const token = Luigi.auth().store.getAuthData();
      var onLoad = null;
      if (token && token.accessToken) {
        if(navigationNode.pathSegment == "rocketchat") {
          onLoad = () => {
            const currentFrame = Luigi.elements().getCurrentMicrofrontendIframe();
            if (currentFrame.src !== iframe.src) return;
            rocketChat.rocketChatLogin(iframe.src, currentFrame, token.accessToken); 
          };
        } else if (navigationNode.pathSegment == "bothub") {
          onLoad = () => {
            const currentFrame = Luigi.elements().getCurrentMicrofrontendIframe();
            if (currentFrame.src !== iframe.src) return;
            bothubLogin.bothubLogin(iframe.src, currentFrame, token.accessToken); 
          };
        }
      }
      iframe.onload = onLoad;
    },
    appLoadingIndicator: {
      hideAutomatically: true
    },
    header: {
      title: 'Weni',
      logo: '/logo.png'
    },
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
  lifecycleHooks: {
    luigiAfterInit: () => {
      i18nProvider.afterInit();
      document.getElementById('navbar').appendChild(document.getElementsByClassName("iframeContainer")[0]);
    }
  },
  auth: {
    use: 'openIdConnect',
    openIdConnect: {
      idpProvider: oidcProvider,
      authority: 'http://keycloak-connect.push.al/auth/realms/ilhasoft/',
      client_id: 'connect-frontend',
      response_type: 'code',
      response_mode: 'fragment',
      automaticSilentRenew: true,
      userInfoFn: async (authSettings, authData) => ({ name: 'name', email: 'email'}),
      accessTokenExpiringNotificationTime: 60,
    },
    disableAutoLogin: true,
  },
};

i18nProvider.init().then(() => {
  Luigi.setConfig(coreConfig);
})


