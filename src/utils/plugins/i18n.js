import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt_br from '../../locales/pt_br.json';

Vue.use(VueI18n);

const languages = {
  'pt-br': pt_br,
  'pt-BR': pt_br,
  en: en,
  es: es,
};

const messages = Object.assign(languages);

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;
