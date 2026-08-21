import { extend } from 'lodash';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRightBarStore = defineStore('RightBar', () => {
  const lastInsertedId = ref(0);
  const all = ref([]);

  function OPEN_RIGHT_BAR(data) {
    all.value.push(data);
  }

  function CLOSE_RIGHT_BAR(id) {
    all.value = all.value.filter((rightBar) => rightBar.id !== id);
  }

  function openRightBar(data) {
    extend(data, { id: ++lastInsertedId.value });

    OPEN_RIGHT_BAR(data);

    return data.id;
  }

  async function closeRightBar(id) {
    CLOSE_RIGHT_BAR(id);
  }

  return {
    lastInsertedId,
    all,
    openRightBar,
    closeRightBar,
  };
});
