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

function mergeLocales(...modules) {
  const validModules = modules.filter(
    (module) =>
      module && typeof module === 'object' && Object.keys(module).length > 0,
  );

  function deepMerge(target, source, visited = new WeakSet()) {
    if (visited.has(source)) {
      return target;
    }
    visited.add(source);

    const result = { ...target };

    for (const key in source) {
      if (Object.hasOwn(source, key)) {
        if (
          result[key] &&
          typeof result[key] === 'object' &&
          typeof source[key] === 'object' &&
          !Array.isArray(result[key]) &&
          !Array.isArray(source[key])
        ) {
          result[key] = deepMerge(result[key], source[key], visited);
        } else {
          result[key] = source[key];
        }
      }
    }

    visited.delete(source);
    return result;
  }

  return validModules.reduce((acc, module) => deepMerge(acc, module), {});
}

const portuguese = mergeLocales(insightsPtBr, commercePtBr, pt_br);
const english = mergeLocales(insightsEn, commerceEn, en);
const spanish = mergeLocales(insightsEs, commerceEs, es);

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
