import { shallowMount, createLocalVue } from '@vue/test-utils';
import Container from '@/views/projects/container.vue';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

describe('AppGrid.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Container, {
      localVue,
      i18n,
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
