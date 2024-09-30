import { createLocalVue, mount } from '@vue/test-utils';
import SidebarOptionInside from '@/components/Sidebar/SidebarOptionInside.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import VueI18n from 'vue-i18n';

const localVue = createLocalVue();

localVue.use(UnnnicSystem);
localVue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en',
  silentTranslationWarn: true,
});

const elements = {
  optionInside: '[data-test="option-inside"]',
  iconRight: '[data-test="icon-right"]',
};

const setup = ({ iconRight = undefined, isAccordion = false } = {}) =>
  mount(SidebarOptionInside, {
    localVue,
    i18n,

    props: {
      tag: 'section',
      enableTooltip: true,
      tooltipText: 'tooltip text',
      title: 'title',
      label: 'label name',
      iconRight,
      isAccordion,
    },
  });

describe('SidebarOptionInside.vue', () => {
  let wrapper;

  it('when has icon right prop should render this icon', () => {
    wrapper = setup({ iconRight: 'close' });

    const iconRight = wrapper.find(elements.iconRight);

    expect(iconRight.text()).toContain('close');
  });

  it('when it is an accordion should render the correct icon right', () => {
    wrapper = setup({ isAccordion: true });

    const iconRight = wrapper.find(elements.iconRight);

    expect(iconRight.text()).toContain('keyboard_arrow_down');
  });

  it('when the user clicks on option should emits click event', () => {
    wrapper = setup();

    const optionInside = wrapper.find(elements.optionInside);

    optionInside.trigger('click');

    expect(wrapper.emitted().click).toBeTruthy();
  });
});
