import { shallowMount } from '@vue/test-utils';
import orgPermissions from '@/components/common/RightBar/orgPermissions.vue';

const wrapper = shallowMount(orgPermissions)

describe('orgPermissions.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});