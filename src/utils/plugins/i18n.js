import { createI18n } from 'vue-i18n';

import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt_br from '../../locales/pt_br.json';

const languages = {
  'pt-br': pt_br,
  'pt-BR': pt_br,
  en: en,
  es: es,
};

const messages = Object.assign(languages);

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
