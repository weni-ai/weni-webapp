export default function (event, data) {
  let sents = 0;

  document.querySelectorAll('iframe').forEach(({ contentWindow }) => {
    if (contentWindow && contentWindow.postMessage) {
      contentWindow.postMessage(
        {
          ...data,
          event,
        },
        '*',
      );

      sents++;
    }
  });

  return sents;
}
