import { shallowMount } from '@vue/test-utils';
import CompanySubSector from '@/components/KnowUserModal/Steps/CompanySubSector.vue';

const wrapper = shallowMount(CompanySubSector)

describe('CompanySubSector.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});