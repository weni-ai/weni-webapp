import { shallowMount } from '@vue/test-utils';
import CompanySector from '@/components/KnowUserModal/Steps/CompanySector.vue';

const wrapper = shallowMount(CompanySector)

describe('CompanySector.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});