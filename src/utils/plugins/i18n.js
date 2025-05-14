import { createI18n } from 'vue-i18n';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import pt_br from '@/locales/pt_br.json';
const insightsEn = await import('insights/locales/en');
const insightsEs = await import('insights/locales/es');
const insightsPtBr = await import('insights/locales/pt_br');
const commerceEn = await import('commerce/locales/en_us');
const commerceEs = await import('commerce/locales/es_es');
const commercePtBr = await import('commerce/locales/pt_br');

function mergeLocales(base, ...modules) {
  return Object.assign({}, base, ...modules);
}

const portuguese = mergeLocales(pt_br, insightsPtBr, commercePtBr);
const english = mergeLocales(en, insightsEn, commerceEn);
const spanish = mergeLocales(es, insightsEs, commerceEs);

const messages = {
  'pt-br': portuguese,
  'pt-BR': portuguese,
  en: english,
  es: spanish,
};

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
