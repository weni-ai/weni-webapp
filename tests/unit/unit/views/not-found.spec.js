import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createStore } from 'vuex';
import notFound from '@/views/not-found.vue';
import { org } from '../../__mocks__';
import project from '../../__mocks__/project';

vi.mock('@/api/request.js', () => ({}));
vi.mock('@/api/account.js', () => {
  return {
    profile: () => ({ data: { language: 'pt-br' } }),
  };
});

describe('notFound.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return org;
      },
      currentProject: () => {
        return project;
      },
    };

    store = createStore({
      getters,
      actions,
    });

    wrapper = shallowMount(notFound, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: RouterLinkStub,
          UnnnicButton: true,
          emoji: true,
          UnnnicAccordion: true,
        },
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
