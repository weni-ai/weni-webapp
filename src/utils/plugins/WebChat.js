import { waitFor } from '../waitFor';
import { transformIntoDraggableBubble } from '../transformIntoDraggableBubble';

export default function (d = document, s = 'script') {
  let h = d.getElementsByTagName(s)[0],
    k = d.createElement(s);
  k.onload = function () {
    let j = d.createElement('div');
    j.id = 'wwc';
    d.body.appendChild(j);

    // WebChat Config
    let p = {
      title: 'Especialista',
      inputTextFieldHint: 'Digite aqui sua mensagem...',
      showFullScreenButton: true,
      displayUnreadCount: true,
      initPayload: 'Falar com especialista',
      mainColor: '#009E96',
      profileAvatar:
        'https://weni-sp-integrations-production.s3.amazonaws.com/apptypes/wwc/1807661c-caf2-4a13-9c64-b2006c4f15dd/avatar.png',
      tooltipMessage: 'Oi! Tem um especialista pronto para te ajudar.',
      openLauncherImage:
        'https://weni-sp-integrations-production.s3.amazonaws.com/apptypes/wwc/1807661c-caf2-4a13-9c64-b2006c4f15dd/avatar.png',
      selector: '#wwc',
      customizeWidget: {
        headerBackgroundColor: '#009E96',
        launcherColor: '#009E96',
        userMessageBubbleColor: '#009E96',
        quickRepliesFontColor: '#009E96',
        quickRepliesBackgroundColor: '#009E9633',
        quickRepliesBorderColor: '#009E96',
      },
      params: {
        images: {
          dims: {
            width: 300,
            height: 200,
          },
        },
        storage: 'session',
      },
      socketUrl: 'https://websocket.weni.ai',
      host: 'https://flows.weni.ai',
      channelUuid: 'a326544e-7059-4ff1-b397-bb6ad6a5167f',
    };

    p['customMessageDelay'] = () => {
      return 1 * 1000;
    };

    WebChat.default.init(p);
  };

  k.async = true;
  k.src = 'https://storage.googleapis.com/push-webchat/wwc-latest.js';
  h.parentNode.insertBefore(k, h);

  waitFor(() => document.querySelector('button.push-launcher')).then((button) =>
    transformIntoDraggableBubble(button, button.parentNode),
  );
}
