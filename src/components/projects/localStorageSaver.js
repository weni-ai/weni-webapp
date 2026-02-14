import { moduleStorage } from '../../utils/moduleStorage';

export default function (key, defaultValue = {}) {
  const data = moduleStorage.getItem(key);

  let value;

  if (data) {
    try {
      value = JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  } else {
    value = defaultValue;
  }

  return {
    value,

    save() {
      moduleStorage.setItem(key, JSON.stringify(this.value));
    },
  };
}
