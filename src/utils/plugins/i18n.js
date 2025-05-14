import { createI18n } from 'vue-i18n';

import en from '../../locales/en.json';
import es from '../../locales/es.json';
import pt_br from '../../locales/pt_br.json';
const localeInsightsEn = await import('insights/locales/en');
const localeInsightsEs = await import('insights/locales/es');
const localeInsightsPtBr = await import('insights/locales/pt_br');
const localeCommerceEn = await import('commerce/locales/en_us');
const localeCommerceEs = await import('commerce/locales/es_es');
const localeCommercePtBr = await import('commerce/locales/pt_br');

const br = {
  ...pt_br,
  ...localeInsightsPtBr,
  ...localeCommercePtBr,
};

const english = {
  ...en,
  ...localeInsightsEn,
  ...localeCommerceEn,
};

const spanish = {
  ...es,
  ...localeInsightsEs,
  ...localeCommerceEs,
};

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
