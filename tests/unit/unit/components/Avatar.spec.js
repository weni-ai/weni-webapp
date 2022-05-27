import { shallowMount } from '@vue/test-utils';
import Avatar from '@/components/Avatar.vue';

describe('Avatar.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Avatar, {
      mocks: {
        $t: () => '',
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('imageBackground()', async () => {
    await wrapper.setProps({
      imageUrl: 'top',
    });

    expect(wrapper.vm.imageBackground).toEqual("background-image: url('top')");
  });
});
