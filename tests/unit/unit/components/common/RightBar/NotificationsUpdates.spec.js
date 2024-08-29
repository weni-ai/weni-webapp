import NotificationsUpdates from '@/components/common/RightBar/NotificationsUpdates.vue';
import { createLocalVue, mount } from '@vue/test-utils';
import { vi } from 'vitest';

import Vuex from 'vuex';

const localVue = createLocalVue();

localVue.use(Vuex);

const store = new Vuex.Store({
  state() {
    return {
      News: {
        lastViewedNews: null,

        platformNews: {
          status: null,
          mostRecentMonth: '2024-08',
          data: `"# :brazil:\n\n### :rocket: Atualizações e melhorias\n\n#### Nova Topbar:\n\nA topbar da plataforma está de cara nova! [Conheça](http://google.com)\n\n#### Nova Sidebar:\n\nA sidebar da plataforma está de cara nova! [Conheça](http://google.com)\n\n### :fly: Correções de bugs\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\n# :us:\n\n### :rocket: Updates and improvements\n\n#### New Insights module:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n#### New Insights module:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n### :fly: Bug fixes\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\n# :es:\n\n### :rocket: Actualizaciones y mejoras\n\n#### Nuevo módulo Insights:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n#### Nuevo módulo Insights:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n### :fly: Corrección de errores\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n"`,
        },
      },
    };
  },

  actions: {},
});

const setup = () =>
  mount(NotificationsUpdates, {
    localVue,
    store,

    propsData: {},

    mocks: {
      $t: (key) => key,
    },
  });

window.localStorage.setItem = vi.fn();

describe('NotificationsUpdates.vue', () => {
  it('updates lastViewedNews to the most recent platform news month update', () => {
    setup();

    expect(store.state.News.lastViewedNews).toBe('2024-08');

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'lastViewedNews',
      '2024-08',
    );
  });
});
