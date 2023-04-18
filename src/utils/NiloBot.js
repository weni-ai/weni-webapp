import getEnv from './env';

(function (d, url) {
  const { head } = d;
  const scriptTag = d.createElement('script');

  scriptTag.addEventListener('load', () => {
    const newScriptTag = d.createElement('script');
    newScriptTag.setAttribute('src', url);
    newScriptTag.setAttribute('async', true);
    head.appendChild(newScriptTag);
  });

  scriptTag.setAttribute(
    'src',
    'https://storage.googleapis.com/push-webchat/wwc-latest.js',
  );
  scriptTag.setAttribute('async', true);

  head.appendChild(scriptTag);
})(document, getEnv('BOT_URL'));

function setNiloDisplay(value) {
  const botButton = document.querySelector('#wwc');

  if (botButton) {
    botButton.style.display = value;
  }
}

window.addEventListener('hideBottomRightOptions', () => {
  setNiloDisplay('none');
});

window.addEventListener('showBottomRightOptions', () => {
  setNiloDisplay(null);
});
