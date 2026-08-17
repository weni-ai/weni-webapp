import { format } from 'date-fns';
import { enUS, es, ptBR, ro } from 'date-fns/locale';

const DATE_FNS_LOCALES = {
  en: enUS,
  es,
  pt_br: ptBR,
  ro,
};

export function getDateFnsLocale(appLocale) {
  return DATE_FNS_LOCALES[appLocale] || enUS;
}

export function formatTimezoneOffset(date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }

  return `GMT${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formats a date with the app i18n locale mapped to date-fns.
 *
 * @param {string|number|Date} date
 * @param {object} [options]
 * @param {string} [options.locale] - App locale key (en, pt_br, es, ro)
 * @param {string} [options.pattern='d MMM yyyy, HH:mm'] - date-fns pattern
 * @param {boolean} [options.withTimezone=false] - Append `(GMT±n)` suffix
 * @param {string} [options.emptyValue='–'] - Fallback when date is empty
 */
export function formatDate(
  date,
  {
    locale,
    pattern = 'd MMM yyyy, HH:mm',
    withTimezone = false,
    emptyValue = '–',
  } = {},
) {
  if (!date) return emptyValue;

  const parsedDate = new Date(date);
  const formatted = format(parsedDate, pattern, {
    locale: getDateFnsLocale(locale),
  });

  if (!withTimezone) return formatted;

  return `${formatted} (${formatTimezoneOffset(parsedDate)})`;
}
