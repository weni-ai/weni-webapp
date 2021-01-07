class I18nProvider {
    init() {
      // Could also be an Ajax based implementation.
      this.translationTable = {
        en: {
          SIDEBAR: {
            'MAIN_MENU': 'Main Menu',
            SYSTEMS: 'Systems',
            HOME: 'Home',
            RC: 'RocketChat',
            BH: 'Bothub',
            PUSH: 'Push',
            HIDE: 'Hide',
            LOGIN: 'Login',
            LOGOUT: 'Logout',
          },
        },
        'pt-br': {
            SIDEBAR: {
              "MAIN_MENU": 'Menu Principal',
              SYSTEMS: 'Sistemas',
              HOME: 'Página Inicial',
              RC: 'RocketChat',
              BH: 'Bothub',
              PUSH: 'Push',
              HIDE: 'Encolher',
              LOGIN: 'Login',
              LOGOUT: 'Sair',
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
      console.log(key, obj, interpolations);
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
        value = value.replace(
          new RegExp('{' + EscapingHelpers.escapeKeyForRegexp(item) + '}', 'gi'),
          interpolations[item]
        );
      });
      return value;
    }
  }
  
  export const i18nProvider = new I18nProvider();