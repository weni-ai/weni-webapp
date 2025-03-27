import { createI18n } from 'vue-i18n';

import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt_br from '../../locales/pt_br.json';
import en_insights from '../../locales/en_insights.json';
import es_insights from '../../locales/es_insights.json';
import pt_br_insights from '../../locales/pt_br_insights.json';
import en_commerce from '../../locales/en_commerce.json';
import es_commerce from '../../locales/es_commerce.json';
import pt_br_commerce from '../../locales/pt_br_commerce.json';

const br = {
  ...pt_br,
  ...pt_br_insights,
  ...pt_br_commerce,
}

const english = {
  ...en,
  ...en_insights,
  ...en_commerce,
}

const spanish = {
  ...es,
  ...es_insights,
  ...es_commerce,
}

const languages = {
  'pt-br': br,
  'pt-BR': br,
  en: english,
  es: spanish,
};

const messages = Object.assign(languages);

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
