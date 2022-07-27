export default function (input, setValue) {
  input.addEventListener('input', () => {
    const oldValue = input.value.split('');

    oldValue.splice(input.selectionStart, 0, 'pointer');

    const newValue = oldValue.filter(
      (char) => char === 'pointer' || /\d/.test(char),
    );

    if (newValue.length > 1) {
      newValue.splice(0, 0, '+');
    }

    const withoutPointer = () => {
      return newValue.filter((char) => char !== 'pointer').join('');
    };

    const add = (position, char) => {
      const hasPointerBefore = newValue.slice(0, position).includes('pointer');
      const positionToAdd = hasPointerBefore ? position + 1 : position;
      newValue.splice(positionToAdd, 0, char);
    };

    if (/\+55\d/.test(withoutPointer())) {
      add(3, ' ');

      if (/\+55 \d{3}/.test(withoutPointer())) {
        add(6, ' ');
      }

      if (/\+55 \d{2} \d{9}/.test(withoutPointer())) {
        add(12, '-');
      } else if (/\+55 \d{2} \d{5}/.test(withoutPointer())) {
        add(11, '-');
      }
    }

    input.value = newValue.filter((char) => char !== 'pointer').join('');

    const pointerIndex = newValue.indexOf('pointer');

    if (pointerIndex >= 1 && !/\d/.test(newValue[pointerIndex - 1])) {
      input.selectionStart = input.selectionEnd =
        newValue.indexOf('pointer') - 1;
    } else {
      input.selectionStart = input.selectionEnd = newValue.indexOf('pointer');
    }

    setValue(input.value);
  });
}
