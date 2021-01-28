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
      'profile-update': () => {
        console.log('onPictureUpdate');
        const date = new Date();
        document.getElementById('weni-navbar').setAttribute('update', date);
      },
    },
  },
  iframeCreationInterceptor: (iframe, viewGroup, navigationNode, microFrontendType) => {
    console.log({ navigationNode });
  },
  lifecycleHooks: {
    luigiAfterInit: () => {
      i18nProvider.afterInit();
      const sidebarClass = customElements.get('side-bar-sidebar');
      const navbarClass = customElements.get('side-bar-navbar');

      const navbar = new navbarClass();
      navbar.id = 'weni-navbar';

      const sidebar = new sidebarClass();
      sidebar.id = 'weni-sidebar';
      
      const outer = document.getElementById('app');
      const inner = document.getElementsByClassName("iframeContainer")[0].parentElement;
      inner.className += ' weni-navbar';
      
      outer.prepend(sidebar);
      inner.prepend(navbar);
    }
  },
  auth: auth(),
};

i18nProvider.init().then(() => {
  Luigi.setConfig(coreConfig);
})