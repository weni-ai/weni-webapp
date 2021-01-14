import rocketChat from './rc-login.js'
import bothubLogin from './bothub-login.js';
import { i18nProvider } from './settings/i18n-provider';
import { auth } from './settings/authConfig.js'
import { navigation } from './settings/navigation.js'

const coreConfig = {
  navigation,
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
  lifecycleHooks: {
    luigiAfterInit: () => {
      i18nProvider.afterInit();
      document.getElementById('navbar').appendChild(document.getElementsByClassName("iframeContainer")[0]);
    }
  },
  auth,
};

i18nProvider.init().then(() => {
  Luigi.setConfig(coreConfig);
})


