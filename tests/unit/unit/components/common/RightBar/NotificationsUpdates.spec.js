import NotificationsUpdates from '@/components/common/RightBar/NotificationsUpdates.vue';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import { createStore } from 'vuex';
import { moduleStorage } from '@/utils/moduleStorage';

const store = createStore({
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
    global: {
      plugins: [store],
    },
    props: {},
  });

describe('NotificationsUpdates.vue', () => {
  beforeEach(() => {
    moduleStorage.setItem = vi.fn();
  });

  it('updates lastViewedNews to the most recent platform news month update', () => {
    setup();

    expect(store.state.News.lastViewedNews).toBe('2024-08');

    expect(moduleStorage.setItem).toHaveBeenCalledWith(
      'lastViewedNews',
      '2024-08',
    );
  });
});
