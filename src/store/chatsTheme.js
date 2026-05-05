import { defineStore } from 'pinia';
import { ref } from 'vue';

export const CHATS_THEME_LIGHT = 'light';
export const CHATS_THEME_DARK = 'dark';

const VALID_THEMES = new Set([CHATS_THEME_LIGHT, CHATS_THEME_DARK]);

export const useChatsThemeStore = defineStore('chatsTheme', () => {
  const theme = ref(CHATS_THEME_LIGHT);

  function setTheme(value) {
    if (!VALID_THEMES.has(value)) return;
    theme.value = value;
  }

  return {
    theme,
    setTheme,
  };
});
