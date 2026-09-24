import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useThemeStore } from '@/store/theme';

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('theme');
    document.body.removeAttribute('unnnic-theme');
    setActivePinia(createPinia());
  });

  it('defaults to light and does not set the body attribute when storage is empty', () => {
    const setAttribute = vi.spyOn(document.body, 'setAttribute');

    const themeStore = useThemeStore();

    expect(themeStore.name).toBe('light');
    expect(setAttribute).not.toHaveBeenCalled();
  });

  it('hydrates name and the body attribute from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    const themeStore = useThemeStore();

    expect(themeStore.name).toBe('dark');
    expect(document.body.getAttribute('unnnic-theme')).toBe('dark');
  });

  it('setTheme updates state, storage, and the body attribute', () => {
    const themeStore = useThemeStore();

    themeStore.setTheme('dark');

    expect(themeStore.name).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.body.getAttribute('unnnic-theme')).toBe('dark');
  });

  it('defaults to light when localStorage getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });

    const themeStore = useThemeStore();

    expect(themeStore.name).toBe('light');
    expect(document.body.getAttribute('unnnic-theme')).toBeNull();
  });

  it('updates state and the body attribute when localStorage setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    const themeStore = useThemeStore();

    expect(() => themeStore.setTheme('dark')).not.toThrow();
    expect(themeStore.name).toBe('dark');
    expect(document.body.getAttribute('unnnic-theme')).toBe('dark');
  });
});
