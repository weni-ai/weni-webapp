import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import axios from 'axios';
import dashboard from '@/api/dashboard';
import getEnv from '@/utils/env';

export const useNewsStore = defineStore('news', () => {
  const status = ref(null);
  const all = ref([]);
  const lastViewedNews = ref(localStorage.getItem('lastViewedNews') || '');

  const platformNews = reactive({
    status: null,
    mostRecentMonth: '',
    data: '',
  });

  function loadNews() {
    status.value = 'loading';
    dashboard
      .newsletterList(0, 40)
      .then((response) => {
        status.value = 'loaded';
        all.value = (response.data?.results || response.data).reverse();
      })
      .catch(() => {
        status.value = 'error';
      });
  }

  async function loadLatestNews() {
    platformNews.status = 'loading';

    try {
      const repository = getEnv('GITHUB_PLATFORM_UPDATES_REPOSITORY');

      const { data: branches } = await axios.get(
        `/repos/${repository}/branches`,
        {
          baseURL: getEnv('GITHUB_API'),
        },
      );

      const main = branches.find(({ name }) => name === 'main').commit.sha;

      const {
        data: { tree: files },
      } = await axios.get(`/repos/${repository}/git/trees/${main}`, {
        baseURL: getEnv('GITHUB_API'),
      });

      const months = files.filter(({ path }) => /^\d{4}-\d{2}\.md$/.test(path));

      const ordered = months.map(({ path }) => path);

      ordered.sort();

      const mostRecent = ordered.at(-1);

      const { data: content } = await axios.get(
        `/${repository}/${main}/${mostRecent}`,
        { baseURL: getEnv('GITHUB_CONTENT_API') },
      );

      platformNews.status = 'complete';
      platformNews.mostRecentMonth = mostRecent.replace(
        /(\d{4}-\d{2}).*/,
        '$1',
      );
      platformNews.data = content;
    } catch {
      platformNews.status = 'error';
    }
  }

  return {
    status,
    all,
    lastViewedNews,
    platformNews,
    loadNews,
    loadLatestNews,
  };
});
