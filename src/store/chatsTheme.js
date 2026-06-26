import { defineStore } from 'pinia';
import { ref } from 'vue';

export const CHATS_THEME_LIGHT = 'light';
export const CHATS_THEME_DARK = 'dark';

const VALID_THEMES = new Set([CHATS_THEME_LIGHT, CHATS_THEME_DARK]);

// Host-owned persistence key for the chats theme preference. It must be
// independent from unnnic's own `unnnic-theme` key: the host rewrites
// `unnnic-theme` on every load (the `isChatsDarkModeActive` watcher), which
// would otherwise clobber the saved chats preference before chats re-emits it.
const STORAGE_KEY = 'chats-theme';

function readPersistedTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(stored) ? stored : CHATS_THEME_LIGHT;
  } catch {
    return CHATS_THEME_LIGHT;
  }
}

export const useChatsThemeStore = defineStore('chatsTheme', () => {
  const theme = ref(readPersistedTheme());

  function setTheme(value) {
    if (!VALID_THEMES.has(value)) return;
    theme.value = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore persistence failures (private mode, storage quota).
    }
  }

  return {
    theme,
    setTheme,
  };
});
