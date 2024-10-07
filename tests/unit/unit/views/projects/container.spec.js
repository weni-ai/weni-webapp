import { shallowMount } from '@vue/test-utils';
import Container from '@/views/projects/container.vue';

describe('AppGrid.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Container, {});
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
