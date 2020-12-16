import oidcProvider from '@luigi-project/plugin-auth-oidc';
import rocketChat from './rc-login.js'
import bothubLogin from './bothub-login.js'

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
      title: 'Ilhasoft',
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
  lifecycleHooks: {
    luigiAfterInit: () => {
      // console.log('login');
      // getLogin();
    }
  }
});
