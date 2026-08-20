import { extend } from 'lodash';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModalStore = defineStore('Modal', () => {
  const lastId = ref(0);
  const actives = ref([]);

  function OPEN_MODAL(data) {
    actives.value.push(data);
  }

  function CLOSE_MODAL(id) {
    actives.value = actives.value.filter((active) => active.id !== id);
  }

  async function openModal(data) {
    extend(data, { id: ++lastId.value });

    OPEN_MODAL(data);

    return data.id;
  }

  async function closeModal(id) {
    CLOSE_MODAL(id);
  }

  return {
    lastId,
    actives,
    OPEN_MODAL,
    CLOSE_MODAL,
    openModal,
    closeModal,
  };
});
