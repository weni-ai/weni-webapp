class I18nProvider {
    init() {
      // Could also be an Ajax based implementation.
      this.translationTable = {
        en: {
          SIDEBAR: {
            'MAIN_MENU': 'Main Menu',
            SYSTEMS: 'Systems',
            HOME: 'Home',
            RC: 'Agents',
            BH: 'Artificial Intelligence',
            PUSH: 'Flows',
            HIDE: 'Hide',
            SHOW: 'Show',
            ACCOUNT: 'Account',
            PROFILE: 'Settings',
            PROJECT: 'Project',
            HELP: 'Question',
          },
          NAVBAR: {
            ALL_PROJECTS: 'See all projects',
            SEARCH_PLACEHOLDER: 'Search for Flows created in the project or any Intelligences...',
            NO_RESULTS: 'Hmm... The search term was not found or does not exist :(',
            LOGIN: 'Login',
            LOGOUT: 'Logout',
            LOGOUT_TITLE: 'Leaving?',
            LOGOUT_MESSAGE: 'Are you sure you want to logout? Any unsaved changes will be lost.', 
            ACCOUNT: 'Account',
            CANCEL: 'Cancel',
            CHANGE_ORG: 'Change organization',
            LOADING:'Searching...'
          },
        },
        'pt-br': {
            SIDEBAR: {
              "MAIN_MENU": 'Menu principal',
              SYSTEMS: 'Módulos',
              HOME: 'Início',
              RC: 'Agentes',
              BH: 'Inteligência Artificial',
              PUSH: 'Fluxos',
              HIDE: 'Encolher',
              SHOW: 'Expandir',
              ACCOUNT: 'Conta',
              PROFILE: 'Ajustes',
              PROJECT: 'Projeto',
              HELP: 'Ajuda',
            },
            NAVBAR: {
              ALL_PROJECTS: 'Ver todos os projetos',
              SEARCH_PLACEHOLDER: 'Busque por Fluxos criados no projeto ou por quaisquer Inteligências...',
              NO_RESULTS: 'Hmm... O termo procurado não foi encontrado ou não existe :(',
              LOGIN: 'Login',
              LOGOUT: 'Sair',
              LOGOUT_TITLE: 'Sair da Conta',
              LOGOUT_MESSAGE: 'Deseja mesmo sair da conta? Caso não tenha salvo alguma alteração, o conteúdo será perdido.',
              ACCOUNT: 'Conta',
              CANCEL: 'Cancelar',
              CHANGE_ORG: 'Trocar organização',
              LOADING:'Buscando...'
            },
          },
      };
      return Promise.resolve();
    }
  
    afterInit() {
      this.currentLanguage = Luigi.i18n().getCurrentLocale();
      Luigi.i18n().addCurrentLocaleChangeListener((locale) => {
        this.currentLanguage = locale;
      });
    }
  
    // This function will be used by Luigi Core for translation
    getTranslation(key, interpolations = undefined, locale = undefined) {
      if (!key) return '';
      this.currentLanguage = locale || this.currentLanguage || Luigi.i18n().getCurrentLocale();
      const result = this.findTranslation(
        key,
        this.translationTable[this.currentLanguage],
        interpolations
      );
      return result ? result : key;
    }
  
    /**
     * @private
     * Finds the translated value based on given key.
     * @param {string} key key to be translated
     * @param {*} obj translation table
     */
    findTranslation(key, obj, interpolations) {
      let splitted = key.split('.');
      for (let i = 0; i < splitted.length; i++) {
        let key = splitted[i];
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          obj = obj[key];
        } else {
          if (interpolations)
            return this.findInterpolations(obj[key], interpolations);
          return obj[key];
        }
      }
    }
  
    /**
     * @private
     * Replaces values that are defiend in translation strings
     * @param {string} key key to be translated
     * @param {*} interpolations translation table
     * @example
     * findInterpolations('Environment {num}', {num: 1})
     */
    findInterpolations(value, interpolations) {
      Object.keys(interpolations).forEach(item => {
        if (!value) { return value }
        value = value.replace(
          new RegExp('{' + EscapingHelpers.escapeKeyForRegexp(item) + '}', 'gi'),
          interpolations[item]
        );
      });
      return value;
    }
  }
  
  export const i18nProvider = new I18nProvider();