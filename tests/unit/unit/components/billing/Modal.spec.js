import { shallowMount } from '@vue/test-utils';
import Modal from '@/components/billing/Modal.vue';

describe('Modal.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Modal, {
      global: {
        plugins: [],
        stubs: {
          UnnnicIconSvg: true,
          UnnnicSlider: true,
          UnnnicTable: true,
          UnnnicTableRow: true,
        },
      },
      props: {
        ranges: [],
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
