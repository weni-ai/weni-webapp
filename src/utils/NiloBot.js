import getEnv from './env';

(function (d, s, u) {
  let h = d.getElementsByTagName(s)[0],
    k = d.createElement(s);
  k.onload = function () {
    let l = d.createElement(s);
    l.src = u;
    l.async = true;
    h.parentNode.insertBefore(l, k.nextSibling);
  };
  k.async = true;
  k.src = 'https://storage.googleapis.com/push-webchat/wwc-latest.js';
  h.parentNode.insertBefore(k, h);
})(document, 'script', getEnv('BOT_URL'));

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
