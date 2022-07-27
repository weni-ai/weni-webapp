import { shallowMount } from '@vue/test-utils';
import NewInfiniteLoading from '@/components/NewInfiniteLoading.vue';

describe('NewInfiniteLoading.vue', () => {
  let wrapper;

  beforeEach(() => {
    const observe = jest.fn();
    const unobserve = jest.fn();

    // you can also pass the mock implementation
    // to jest.fn as an argument
    window.IntersectionObserver = jest.fn(() => ({
      observe,
      unobserve,
    }));

    wrapper = shallowMount(NewInfiniteLoading, {
      mocks: {
        $t: () => '',
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
