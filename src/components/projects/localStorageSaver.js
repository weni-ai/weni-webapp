export default function (key, defaultValue = {}) {
  const data = localStorage.getItem(key);

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
      localStorage.setItem(key, JSON.stringify(this.value));
    },
  };
}
