import { shallowMount } from '@vue/test-utils';
import TutorialSliderContainer from '@/components/TutorialSliderContainer.vue';

const wrapper = shallowMount(TutorialSliderContainer)

describe('TutorialSliderContainer.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});