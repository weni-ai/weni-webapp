import { shallowMount } from '@vue/test-utils';
import growth from '@/components/dashboard/growth.vue';

describe('growth.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(growth, {
      global: {
        stubs: {
          UnnnicCard: true,
        },
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should return percentage', async () => {
    const res = await wrapper.vm.getPercentage(20, 10); // 10 to 20 -> 100%
    expect(res).toEqual(100);
  });

  it('should return null percentage', async () => {
    const res = await wrapper.vm.getPercentage(10, 0); // 10 to 20 -> 100%
    expect(res).toEqual(null);
  });
});
