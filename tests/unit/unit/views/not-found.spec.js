import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import notFound from '@/views/not-found.vue';

vi.mock('@/api/request.js', () => ({}));
vi.mock('@/api/account.js', () => {
  return {
    profile: () => ({ data: { language: 'pt-br' } }),
  };
});

describe('notFound.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(notFound, {
      global: {
        plugins: [],
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
