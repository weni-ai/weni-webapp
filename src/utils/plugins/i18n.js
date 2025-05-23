import { createI18n } from 'vue-i18n';
import { safeImport } from '@/utils/moduleFederation';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import pt_br from '@/locales/pt_br.json';

const insightsEn = await safeImport(
  () => import('insights/locales/en'),
  'insights/locales/en',
);
const insightsEs = await safeImport(
  () => import('insights/locales/es'),
  'insights/locales/es',
);
const insightsPtBr = await safeImport(
  () => import('insights/locales/pt_br'),
  'insights/locales/pt_br',
);
const commerceEn = await safeImport(
  () => import('commerce/locales/en_us'),
  'commerce/locales/en_us',
);
const commerceEs = await safeImport(
  () => import('commerce/locales/es_es'),
  'commerce/locales/es_es',
);
const commercePtBr = await safeImport(
  () => import('commerce/locales/pt_br'),
  'commerce/locales/pt_br',
);

function mergeLocales(base, ...modules) {
  const validModules = modules.filter(
    (module) =>
      module && typeof module === 'object' && Object.keys(module).length > 0,
  );
  return Object.assign({}, base, ...validModules);
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
