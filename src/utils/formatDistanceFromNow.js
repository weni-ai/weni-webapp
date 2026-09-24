import { formatDistanceToNow } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';

const locales = {
  en: enUS,
  'en-us': enUS,
  'en-US': enUS,
  es,
  'pt-br': ptBR,
  'pt-BR': ptBR,
};

export function formatDistanceFromNow(date, locale) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: locales[locale] || enUS,
  });
}
