import { shallowMount } from '@vue/test-utils';
import SelectTag from '@/components/KnowUserModal/Steps/SelectTag.vue';

const wrapper = shallowMount(SelectTag)

describe('SelectTag.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});