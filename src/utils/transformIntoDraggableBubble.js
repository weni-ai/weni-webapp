export function transformIntoDraggableBubble(element, referenceElement, nonce) {
  const style = referenceElement.computedStyleMap?.();

  if (!style) return;

  const { value: initialRight } = style.get('right');
  const { value: initialBottom } = style.get('bottom');

  const backdrop = document.createElement('section');
  if (nonce) backdrop.setAttribute('nonce', nonce);

  backdrop.classList.add('draggable-backdrop');

  element.addEventListener('mousedown', (event) => {
    event.preventDefault();
    referenceElement.parentNode.insertBefore(backdrop, referenceElement);

    const diff = { x: 0, y: 0 };

    referenceElement.style.transition = null;

    function mousemove(event) {
      const { movementX, movementY } = event;

      const { value: bottom } = style.get('bottom');
      const { value: right } = style.get('right');

      referenceElement.style.bottom = `${bottom - movementY}px`;
      referenceElement.style.right = `${right - movementX}px`;

      diff.x += movementX;
      diff.y += movementY;

      const distance = Math.hypot(diff.x, diff.y);

      if (distance > 30) {
        element.style.pointerEvents = 'none';
      }
    }

    window.addEventListener('mousemove', mousemove);

    window.addEventListener(
      'mouseup',
      () => {
        window.removeEventListener('mousemove', mousemove);
        backdrop.parentNode.removeChild(backdrop);

        referenceElement.style.transition = `right 400ms cubic-bezier(.47,1.64,.41,.8), bottom 400ms cubic-bezier(.47,1.64,.41,.8)`;

        if (style.get('bottom').value < initialBottom) {
          referenceElement.style.bottom = `${initialBottom}px`;
        }

        const initialTop = initialRight;

        const correctionBottom =
          element.getBoundingClientRect().top - initialTop;

        if (correctionBottom < 0) {
          referenceElement.style.bottom = `${
            style.get('bottom').value + correctionBottom
          }px`;
        }

        referenceElement.style.right = `${initialRight}px`;

        element.style.pointerEvents = null;
      },
      { once: true },
    );
  });
}
