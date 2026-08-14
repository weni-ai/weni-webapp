import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME = 'light';
const UNNNIC_THEME_ATTRIBUTE = 'unnnic-theme';

function readPersistedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyUnnnicTheme(value) {
  document.body.setAttribute(UNNNIC_THEME_ATTRIBUTE, value);
}

export const useThemeStore = defineStore('theme', () => {
  const persisted = readPersistedTheme();
  const name = ref(persisted || DEFAULT_THEME);

  if (persisted) {
    applyUnnnicTheme(persisted);
  }

  function setTheme(value) {
    name.value = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore persistence failures (private mode, storage quota).
    }
    applyUnnnicTheme(value);
  }

  return {
    name,
    setTheme,
  };
});
