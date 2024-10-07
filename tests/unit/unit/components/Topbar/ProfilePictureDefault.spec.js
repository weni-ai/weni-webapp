import ProfilePictureDefault from '@/components/Topbar/ProfilePictureDefault.vue';
import { mount } from '@vue/test-utils';

const setup = ({ text } = {}) =>
  mount(ProfilePictureDefault, {
    props: {
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
