import env from '@/utils/env';

export default function (userEmail = null) {
  return new Promise((resolve, reject) => {
    if (!env('HOTJAR_ID')) {
      resolve();
      return;
    }

    setTimeout(() => {
      try {
        window.hj =
          window.hj ||
          function () {
            (window.hj.q = window.hj.q || []).push(arguments);
          };
        window._hjSettings = { hjid: Number(env('HOTJAR_ID')), hjsv: 6 };

        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.setAttribute('nonce', 'hotjar');
        script.async = true;
        script.src = `https://static.hotjar.com/c/hotjar-${window._hjSettings.hjid}.js?sv=${window._hjSettings.hjsv}`;

        script.onload = () => {
          window.hj('identify', userEmail, {});
          resolve();
        };

        script.onerror = () =>
          reject(new Error('Failed to load Hotjar script'));

        head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    }, 0);
  });
}
