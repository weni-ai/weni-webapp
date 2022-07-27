import { shallowMount } from '@vue/test-utils';
import Emoji from '@/components/Emoji.vue';

describe('Emoji.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Emoji, {
      mocks: {
        $t: () => '',
      },
      propsData: {
        name: 'Winking Face',
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
