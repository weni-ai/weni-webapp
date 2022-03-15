import en from 'javascript-time-ago/locale/en';
import pt_br from 'javascript-time-ago/locale/pt';
import es from 'javascript-time-ago/locale/es';
import TimeAgo from 'javascript-time-ago';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(pt_br);
TimeAgo.addLocale(es);

const locale = {
  'pt-br': 'pt',
  en: 'en',
  'en-US': 'en',
  es: 'es',
};

export const getTimeAgo = (date, textLocale = 'en') => {
  const timeAgo = new TimeAgo(locale[textLocale] || 'en');
  return timeAgo.format(date);
};
