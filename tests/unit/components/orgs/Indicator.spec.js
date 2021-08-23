import { shallowMount, createLocalVue } from '@vue/test-utils';
import Indicator from '@/components/orgs/indicator.vue';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

describe('Indicator.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Indicator, {
      localVue,
      i18n,
      propsData: {
        steps: 1,
        names: [],
        current: 0,
      },
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('nameForStep()', () => {
    it('Test valid prop for method', async () => {
      const names = [1, 2, 3];
      await wrapper.setProps({ names });
      const response = wrapper.vm.nameForStep(2);
      expect(response).toStrictEqual(names[1]);
    });
  });
});
