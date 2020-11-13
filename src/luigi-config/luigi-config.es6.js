import oAuth2ImplicitGrant from '@luigi-project/plugin-auth-oauth2';
import oidcProvider from '@luigi-project/plugin-auth-oidc';

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
            viewUrl: 'http://rp-connect.bothub.it:8000/oidc/authenticate/',
            loadingIndicator: {
              enabled: false,
            },
            anonymousAccess: true,
          },
          {
            pathSegment: 'rocketchat',
            label: 'RocketChat',
            icon: 'paper-plane',
            viewUrl: 'https://ilhasoft.push.al',
            loadingIndicator: {
              enabled: true,
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
      authority: 'http://a952b93a015ce4bce801616b27a59fa2-1568107756.sa-east-1.elb.amazonaws.com/auth/realms/ilhasoft/',
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
    events: {
      onAuthSuccessful: (settings, authData) => {
        var win = document.getElementsByTagName('iframe')[0].contentWindow;
        console.log({ win })
        // console.log('authSuccessful', { iframes: Luigi.elements().getMicrofrontendIframes()});
        for (element in Luigi.elements().getMicrofrontendIframes()) {
          var obj = {
            name: "Jack"
          };
          console.log(element.contentWindow);
          element.contentWindow.postMessage(JSON.stringify({key: 'storage', data: obj}), "*");
        }
      },
    }
  },
});
