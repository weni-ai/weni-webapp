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

    iframeCreationInterceptor: (iframe, viewGroup, navigationNode, microFrontendType) => {
      iframe.removeAttribute('sandbox');
    },
  },
  communication: {
    customMessagesListeners: {
      'profile-update': () => {
        const date = new Date();
        document.getElementById('weni-navbar').setAttribute('update', date);
      },
      'change-theme': ({ theme }) => {
        document.getElementById('weni-navbar').setAttribute('theme', theme);
        document.getElementById('weni-sidebar').setAttribute('theme', theme);
      },
      'change-org': () => {
        const date = new Date();
        document.getElementById('weni-navbar').setAttribute('orgUpdate', date);
      },

      'open-modal': ({ props }) => {
        document.getElementById('weni-modal').vueComponent.open(props);
      },

      'redirect-login': () => {
        Luigi.auth().login();
      },
    },
  },
  lifecycleHooks: {
    luigiAfterInit: () => {
      i18nProvider.afterInit();
      const sidebarClass = customElements.get('side-bar-sidebar');
      const navbarClass = customElements.get('side-bar-navbar');
      const modalClass = customElements.get('side-bar-modal');

      const navbar = new navbarClass();
      navbar.id = 'weni-navbar';

      const sidebar = new sidebarClass();
      sidebar.id = 'weni-sidebar';

      const modal = new modalClass();
      modal.id = 'weni-modal';
      
      const outer = document.getElementById('app');
      const inner = document.getElementsByClassName("iframeContainer")[0].parentElement;
      inner.className += ' weni-navbar';
      
      outer.prepend(sidebar);
      inner.prepend(navbar);
      outer.append(modal);
    }
  },
  auth: auth(),
};

i18nProvider.init().then(() => {
  Luigi.setConfig(coreConfig);
})