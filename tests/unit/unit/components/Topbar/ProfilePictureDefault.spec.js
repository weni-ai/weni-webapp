import ProfilePictureDefault from '@/components/Topbar/ProfilePictureDefault.vue';
import { createLocalVue, mount } from '@vue/test-utils';

const localVue = createLocalVue();

const setup = ({ text } = {}) =>
  mount(ProfilePictureDefault, {
    localVue,

    propsData: {
      text,
    },
  });

describe('ProfilePictureDefault.vue', () => {
  let wrapper;

  it('renders the text properly', () => {
    wrapper = setup({ text: 'AB' });

    expect(wrapper.text()).contain('AB');
  });
});
