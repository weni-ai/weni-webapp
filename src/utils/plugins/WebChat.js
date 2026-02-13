import { waitFor } from '../waitFor';
import { transformIntoDraggableBubble } from '../transformIntoDraggableBubble';

const WEBCHAT_SCRIPT_URL =
  'https://weni-sp-integrations-production.s3.amazonaws.com/apptypes/wwc/2fd0fbb9-baee-42e4-8003-28c2cc90c374/script.js';

export default function (
  d = document,
  s = 'script',
  u = WEBCHAT_SCRIPT_URL,
  w = window,
  v = 'isWeniWebChatAlreadyInserted',
) {
  const nonce = 'wwc';
  if (w[v]) {
    return;
  } else {
    w[v] = !0;
  }
  let h = d.getElementsByTagName(s)[0],
    k = d.createElement(s);
  k.onload = function () {
    let l = d.createElement(s);
    l.src = u;
    l.async = true;
    h.parentNode.insertBefore(l, k.nextSibling);
  };
  k.async = true;
  k.src = 'https://cdn.cloud.weni.ai/webchat-latest.umd.js';
  h.parentNode.insertBefore(k, h);

  waitFor(() => document.querySelector('button.push-launcher')).then((button) =>
    transformIntoDraggableBubble(button, button.parentNode, nonce),
  );
}
