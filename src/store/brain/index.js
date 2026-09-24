import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useBrainStore = defineStore('brain', () => {
  const name = ref('');
  const goal = ref('');
  const content = reactive({
    text: '',
    files: [],
    sites: [],
  });

  function brainFormReset() {
    name.value = '';
    goal.value = '';

    content.text = '';
    content.files = [];
    content.sites = [];
  }

  return {
    name,
    goal,
    content,
    brainFormReset,
  };
});
