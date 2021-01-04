import oidcProvider from '@luigi-project/plugin-auth-oidc';
import rocketChat from './rc-login.js'
import bothubLogin from './bothub-login.js'

Luigi.setConfig({
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
            label: 'Home',
            icon: 'house-2-2',
            viewUrl: '/sampleapp.html#/home',
            category: 'Main menu',
            anonymousAccess: true,
          },
          {
            pathSegment: 'login',
            label: 'Login',
            icon: 'gauge-dashboard-2',
            viewUrl: '/sampleapp.html#/login',
            category: 'Main menu',
            anonymousAccess: true,
          },
          {
            pathSegment: 'bothub',
            label: 'Bothub',
            icon: 'science-fiction-robot-2',
            // viewUrl: 'https://development.bothub.it/',
            viewUrl: 'http://localhost:8081/',
            category: 'Systems',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'push',
            label: 'Push',
            icon: 'hierarchy-3-2',
            viewUrl: 'https://rp-connect.push.al/oidc/authenticate/',
            category: 'Systems',
            loadingIndicator: {
              enabled: false,
              hideAutomatically: true,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'rocketchat',
            label: 'RocketChat',
            icon: 'messaging-we-chat-2',
            viewUrl: 'https://platform-rocket-test.push.al/',
            category: 'Systems',
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
});
