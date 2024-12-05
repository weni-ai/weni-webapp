import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import NewInfiniteLoading from '@/components/NewInfiniteLoading.vue';

describe('NewInfiniteLoading.vue', () => {
  let wrapper;

  beforeEach(() => {
    const observe = vi.fn();
    const unobserve = vi.fn();

    // you can also pass the mock implementation
    // to vi.fn as an argument
    window.IntersectionObserver = vi.fn(() => ({
      observe,
      unobserve,
    }));

    wrapper = shallowMount(NewInfiniteLoading, {});
  });

  it('renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
