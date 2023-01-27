import { shallowMount } from '@vue/test-utils';
import ProjectFormatControl from '@/views/projects/ProjectFormatControl.vue';

const wrapper = shallowMount(ProjectFormatControl)

describe('ProjectFormatControl.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});