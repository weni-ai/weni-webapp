import env from '@/utils/env';

export default function (
  userEmail = null,
  h = window,
  o = document,
  t = 'https://static.hotjar.com/c/hotjar-',
  j = '.js?sv=',
  a,
  r,
) {
  if (env('HOTJAR_ID')) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: Number(env('HOTJAR_ID')), hjsv: 6 };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);

    var userId = userEmail;
    window.hj('identify', userId, {});
  }
}
