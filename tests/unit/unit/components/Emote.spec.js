import { shallowMount } from '@vue/test-utils';
import Emote from '@/components/Emote.vue';

describe('Emote.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Emote, {
      mocks: {
        $t: () => '',
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('is smile the initial emote', () => {
    const SMILE = 3;
    expect(wrapper.vm.$data.current).toBe(SMILE);
  });

  it('does current data change when user pass the mouse enter', () => {
    const oldCurrent = wrapper.vm.$data.current;

    wrapper.find('span').trigger('mouseenter');
    expect(wrapper.vm.$data.current).not.toBe(oldCurrent);
  });

  it('does lastEmote value from localStorage change when user change the emote', async () => {
    const oldLastEmote = localStorage.getItem('lastEmote');
    await wrapper.find('span').trigger('mouseenter');
    expect(localStorage.getItem('lastEmote')).not.toBe(oldLastEmote);
  });
});
