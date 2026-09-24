import { createI18n } from 'vue-i18n';
import { registerMessageCompiler } from '@intlify/core-base';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import pt_br from '@/locales/pt_br.json';
import ro from '@/locales/ro.json';
import { icuMessageCompiler } from './icuMessageCompiler';

const messages = {
  'pt-br': pt_br,
  'pt-BR': pt_br,
  en,
  es,
  ro,
};

/**
 * The app runs vue-i18n in legacy mode, which drops the `messageCompiler`
 * option (it is never forwarded to the core context). Registering the compiler
 * globally is the supported way to make legacy mode use it, so the shared
 * singleton renders ICU plural/select messages emitted by the migrated remotes
 * and by weni-webapp's own migrated locales.
 */
registerMessageCompiler(icuMessageCompiler);

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  messageCompiler: icuMessageCompiler,
});
