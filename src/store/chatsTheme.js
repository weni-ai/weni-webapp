import { defineStore } from 'pinia';
import { ref } from 'vue';

export const CHATS_THEME_LIGHT = 'light';
export const CHATS_THEME_DARK = 'dark';

const VALID_THEMES = new Set([CHATS_THEME_LIGHT, CHATS_THEME_DARK]);

// Host-owned persistence key for the chats theme preference.
const STORAGE_KEY = 'chats-theme';
// The chats remote (`chats-webapp`) reads its initial theme from unnnic's own
// key. Deep-linking straight into `/settings/chats` boots the remote before
// the live-desk ever mounts, so unless we seed this key from `chats-theme`,
// unnnic falls back to its default (light) and the round-trip
// `notifyParentOfTheme` emit overwrites the user's real dark preference.
const UNNNIC_STORAGE_KEY = 'unnnic-theme';

function readPersistedTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(stored) ? stored : CHATS_THEME_LIGHT;
  } catch {
    return CHATS_THEME_LIGHT;
  }
}

function syncUnnnicTheme(value) {
  try {
    localStorage.setItem(UNNNIC_STORAGE_KEY, value);
  } catch {
    // Ignore persistence failures (private mode, storage quota).
  }
}

export const useChatsThemeStore = defineStore('chatsTheme', () => {
  const initial = readPersistedTheme();
  const theme = ref(initial);
  syncUnnnicTheme(initial);

  function setTheme(value) {
    if (!VALID_THEMES.has(value)) return;
    theme.value = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore persistence failures (private mode, storage quota).
    }
    syncUnnnicTheme(value);
  }

  return {
    theme,
    setTheme,
  };
});
