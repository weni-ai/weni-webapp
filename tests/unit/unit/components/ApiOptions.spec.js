import { shallowMount } from '@vue/test-utils';
import ApiOptions from '@/components/ApiOptions.vue';

const wrapper = shallowMount(ApiOptions)

describe('ApiOptions.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});