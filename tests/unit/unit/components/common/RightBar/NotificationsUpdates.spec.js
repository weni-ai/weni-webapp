import NotificationsUpdates from '@/components/common/RightBar/NotificationsUpdates.vue';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useNewsStore } from '@/store/news';

const PLATFORM_NEWS_DATA = `"# :brazil:\n\n### :rocket: Atualizações e melhorias\n\n#### Nova Topbar:\n\nA topbar da plataforma está de cara nova! [Conheça](http://google.com)\n\n#### Nova Sidebar:\n\nA sidebar da plataforma está de cara nova! [Conheça](http://google.com)\n\n### :fly: Correções de bugs\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\n# :us:\n\n### :rocket: Updates and improvements\n\n#### New Insights module:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n#### New Insights module:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n### :fly: Bug fixes\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\n# :es:\n\n### :rocket: Actualizaciones y mejoras\n\n#### Nuevo módulo Insights:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n#### Nuevo módulo Insights:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. [Conheça](http://google.com)\n\n### :fly: Corrección de errores\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n"`;

const setup = () => {
  const pinia = createTestingPinia({ stubActions: false });
  const newsStore = useNewsStore();

  newsStore.lastViewedNews = null;
  newsStore.platformNews.status = null;
  newsStore.platformNews.mostRecentMonth = '2024-08';
  newsStore.platformNews.data = PLATFORM_NEWS_DATA;

  return mount(NotificationsUpdates, {
    global: {
      plugins: [pinia],
    },
    props: {},
  });
};

window.localStorage.setItem = vi.fn();

describe('NotificationsUpdates.vue', () => {
  it('updates lastViewedNews to the most recent platform news month update', () => {
    setup();

    const newsStore = useNewsStore();

    expect(newsStore.lastViewedNews).toBe('2024-08');

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'lastViewedNews',
      '2024-08',
    );
  });
});
