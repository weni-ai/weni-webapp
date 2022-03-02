import { shallowMount } from '@vue/test-utils';
import NewInfiniteLoading from '@/components/NewInfiniteLoading.vue';

describe('NewInfiniteLoading.vue', () => {
  let wrapper;

  beforeEach(() => {
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
