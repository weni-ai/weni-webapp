import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import axios from 'axios';

import { useNewsStore } from '@/store/news';
import dashboard from '@/api/dashboard';
import getEnv from '@/utils/env';

vi.mock('@/api/dashboard', () => ({
  default: {
    newsletterList: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/utils/env', () => ({
  default: vi.fn((name) => {
    const values = {
      GITHUB_PLATFORM_UPDATES_REPOSITORY: 'org/platform-updates',
      GITHUB_API: 'https://api.github.com',
      GITHUB_CONTENT_API: 'https://raw.githubusercontent.com',
    };

    return values[name];
  }),
}));

describe('useNewsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem('lastViewedNews');
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('exposes the default state when localStorage is empty', () => {
      const newsStore = useNewsStore();

      expect(newsStore.status).toBeNull();
      expect(newsStore.all).toEqual([]);
      expect(newsStore.lastViewedNews).toBe('');
      expect(newsStore.platformNews).toEqual({
        status: null,
        mostRecentMonth: '',
        data: '',
      });
    });

    it('hydrates lastViewedNews from localStorage', () => {
      localStorage.setItem('lastViewedNews', '2024-08');

      const newsStore = useNewsStore();

      expect(newsStore.lastViewedNews).toBe('2024-08');
    });
  });

  describe('loadNews', () => {
    it('sets status to loading then loaded and reverses newsletter results', async () => {
      dashboard.newsletterList.mockResolvedValue({
        data: { results: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      });

      const newsStore = useNewsStore();

      newsStore.loadNews();

      expect(newsStore.status).toBe('loading');
      expect(dashboard.newsletterList).toHaveBeenCalledWith(0, 40);

      await flushPromises();

      expect(newsStore.status).toBe('loaded');
      expect(newsStore.all).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
    });

    it('falls back to response.data when results is missing', async () => {
      dashboard.newsletterList.mockResolvedValue({
        data: [{ id: 'a' }, { id: 'b' }],
      });

      const newsStore = useNewsStore();

      newsStore.loadNews();
      await flushPromises();

      expect(newsStore.all).toEqual([{ id: 'b' }, { id: 'a' }]);
    });

    it('sets status to error when the request fails', async () => {
      dashboard.newsletterList.mockRejectedValue(new Error('network'));

      const newsStore = useNewsStore();

      newsStore.loadNews();

      expect(newsStore.status).toBe('loading');

      await flushPromises();

      expect(newsStore.status).toBe('error');
    });
  });

  describe('loadLatestNews', () => {
    it('loads the most recent monthly markdown from GitHub', async () => {
      const content = '# :us:\n\nUpdates';

      axios.get
        .mockResolvedValueOnce({
          data: [
            { name: 'develop', commit: { sha: 'dev-sha' } },
            { name: 'main', commit: { sha: 'main-sha' } },
          ],
        })
        .mockResolvedValueOnce({
          data: {
            tree: [
              { path: 'README.md' },
              { path: '2024-01.md' },
              { path: '2024-08.md' },
              { path: '2024-03.md' },
            ],
          },
        })
        .mockResolvedValueOnce({ data: content });

      const newsStore = useNewsStore();

      const result = newsStore.loadLatestNews();

      expect(newsStore.platformNews.status).toBe('loading');

      await result;

      expect(getEnv).toHaveBeenCalledWith('GITHUB_PLATFORM_UPDATES_REPOSITORY');
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        '/repos/org/platform-updates/branches',
        {
          baseURL: 'https://api.github.com',
        },
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        '/repos/org/platform-updates/git/trees/main-sha',
        { baseURL: 'https://api.github.com' },
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        '/org/platform-updates/main-sha/2024-08.md',
        { baseURL: 'https://raw.githubusercontent.com' },
      );
      expect(newsStore.platformNews.status).toBe('complete');
      expect(newsStore.platformNews.mostRecentMonth).toBe('2024-08');
      expect(newsStore.platformNews.data).toBe(content);
    });

    it('sets platformNews status to error when the request fails', async () => {
      axios.get.mockRejectedValue(new Error('network'));

      const newsStore = useNewsStore();

      await newsStore.loadLatestNews();

      expect(newsStore.platformNews.status).toBe('error');
    });
  });
});
