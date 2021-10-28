export default function (event, data) {
  document.querySelectorAll('iframe').forEach(({ contentWindow }) => {
    if (contentWindow && contentWindow.postMessage) {
      contentWindow.postMessage(
        {
          ...data,
          event,
        },
        '*',
      );
    }
  });
}
