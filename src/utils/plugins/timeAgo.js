import en from 'javascript-time-ago/locale/en';
import pt_br from 'javascript-time-ago/locale/pt';
import TimeAgo from 'javascript-time-ago';
import LuigiClient from '@luigi-project/client';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(pt_br)

const locale = {
    'pt-br': 'pt',
    en: 'en',
    'en-US': 'en',
}

export const getTimeAgo = (date, textLocale='en') => {
    const timeAgo = new TimeAgo(locale[textLocale] || 'en');
    return timeAgo.format(date);
};