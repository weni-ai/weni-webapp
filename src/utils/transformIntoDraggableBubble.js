function createBubbleStyle(referenceElement, nonce) {
  const bubbleStyle = document.createElement('style');
  bubbleStyle.setAttribute('nonce', nonce);
  document.body.appendChild(bubbleStyle);

  const referenceElementId = `bubble-${nonce}`;

  referenceElement.setAttribute(referenceElementId, '');

  const bubbleStyles = ['', '', ''];

  function update({ bottom, right, transition }) {
    const BOTTOM_INDEX = 0;
    const RIGHT_INDEX = 1;
    const TRANSITION_INDEX = 2;

    if (bottom) {
      bubbleStyles[BOTTOM_INDEX] = `bottom: ${bottom} !important;`;
    }

    if (right) {
      bubbleStyles[RIGHT_INDEX] = `right: ${right} !important;`;
    }

    if (transition) {
      bubbleStyles[TRANSITION_INDEX] = `transition: ${transition};`;
    }

    bubbleStyle.innerHTML = `
      [${referenceElementId}]:not(.push-full-screen.push-chat-open) {
        ${bubbleStyles.join('')}
      }
    `;
  }

  return {
    update,
  };
}

function createElementStyle(element, nonce) {
  const elementStyle = document.createElement('style');
  elementStyle.setAttribute('nonce', nonce);
  document.body.appendChild(elementStyle);

  const elementId = `element-${nonce}`;

  element.setAttribute(elementId, '');

  const elementStyles = [''];

  function update({ pointerEvents }) {
    const POINTER_EVENTS_INDEX = 0;

    if (pointerEvents) {
      elementStyles[POINTER_EVENTS_INDEX] = `pointer-events: ${pointerEvents};`;
    }

    elementStyle.innerHTML = `
      [${elementId}]:not(.push-full-screen.push-chat-open) {
        ${elementStyles.join('')}
      }
    `;
  }

  return {
    update,
  };
}

export function transformIntoDraggableBubble(element, referenceElement, nonce) {
  const style = referenceElement.computedStyleMap?.();

  if (!style) return;

  const { value: initialRight } = style.get('right');
  const { value: initialBottom } = style.get('bottom');

  const backdrop = document.createElement('section');
  if (nonce) backdrop.setAttribute('nonce', nonce);

  backdrop.setAttribute(
    'style',
    `
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
    `,
  );

  const bubbleStyle = createBubbleStyle(referenceElement, nonce);
  const elementStyle = createElementStyle(element, nonce);

  element.addEventListener('mousedown', (event) => {
    event.preventDefault();
    referenceElement.parentNode.insertBefore(backdrop, referenceElement);

    const diff = { x: 0, y: 0 };

    bubbleStyle.update({
      transition: 'none',
    });

    function mousemove(event) {
      const { movementX, movementY } = event;

      const { value: bottom } = style.get('bottom');
      const { value: right } = style.get('right');

      bubbleStyle.update({
        bottom: `${bottom - movementY}px`,
        right: `${right - movementX}px`,
      });

      diff.x += movementX;
      diff.y += movementY;

      const distance = Math.hypot(diff.x, diff.y);

      if (distance > 30) {
        elementStyle.update({
          pointerEvents: 'none',
        });
      }
    }

    window.addEventListener('mousemove', mousemove);

    window.addEventListener(
      'mouseup',
      () => {
        window.removeEventListener('mousemove', mousemove);
        backdrop.parentNode.removeChild(backdrop);

        bubbleStyle.update({
          transition:
            'right 400ms cubic-bezier(.47,1.64,.41,.8), bottom 400ms cubic-bezier(.47,1.64,.41,.8)',
        });

        if (style.get('bottom').value < initialBottom) {
          bubbleStyle.update({
            bottom: `${initialBottom}px`,
          });
        }

        const initialTop = initialRight;

        const correctionBottom =
          element.getBoundingClientRect().top - initialTop;

        if (correctionBottom < 0) {
          bubbleStyle.update({
            bottom: `${style.get('bottom').value + correctionBottom}px`,
          });
        }

        bubbleStyle.update({
          right: `${initialRight}px`,
        });

        elementStyle.update({
          pointerEvents: 'unset',
        });
      },
      { once: true },
    );
  });
}
