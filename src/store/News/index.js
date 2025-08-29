import axios from 'axios';
import dashboard from '../../api/dashboard';
import getEnv from '../../utils/env';
import { moduleStorage } from '../../utils/moduleStorage';

const state = {
  status: null,
  all: [],
  lastViewedNews: moduleStorage.getItem('lastViewedNews') || '',

  platformNews: {
    status: null,
    mostRecentMonth: '',
    data: '',
  },
};

const getters = {};

const actions = {
  loadNews({ state }) {
    state.status = 'loading';
    dashboard.newsletterList(0, 40).then((response) => {
      state.status = 'loaded';
      state.all = (response.data?.results || response.data).reverse();
    });
  },

  async loadLatestNews({ state }) {
    state.platformNews.status = 'loading';

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

      state.platformNews.status = 'complete';
      state.platformNews.mostRecentMonth = mostRecent.replace(
        /(\d{4}-\d{2}).*/,
        '$1',
      );
      state.platformNews.data = content;
    } catch {
      state.platformNews.status = 'error';
    }
  },
};

const mutations = {};

export default {
  state,
  getters,
  actions,
  mutations,
};
