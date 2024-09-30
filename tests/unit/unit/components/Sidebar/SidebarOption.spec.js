import { createLocalVue, mount } from '@vue/test-utils';
import SidebarOption from '@/components/Sidebar/SidebarOption.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import VueRouter from 'vue-router';

const localVue = createLocalVue();

localVue.use(UnnnicSystem);
localVue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      name: 'url-1',
      path: '/some-url-1',
    },
    {
      name: 'url-2',
      path: '/some-url-2',
    },
  ],
});

const elements = {
  sidebarOptionInside: { name: 'SidebarOptionInside' },
  accordionContent: '[data-test="accordion-content"]',
};

const setup = ({
  variant = undefined,
  isInDropdown = false,
  useDropdown = false,
  option = {
    icon: 'home',
    label: 'Início',
    type: 'isExactActive',
    viewUrl: '/projects/4aece8e0-6f92-4464-9900-39c6fd06147a',
  },
} = {}) =>
  mount(SidebarOption, {
    localVue,
    router,

    props: {
      option,
      align: 'left',
      iconRight: undefined,
      iconRotate180deg: false,
      isExpanded: true,
      tooltipText: undefined,
      useEllipsis: false,
      isInDropdown,
      useDropdown,
      variant,
    },

    mocks: {
      $t: (key) => key,
    },
  });

describe('SidebarOption.vue', () => {
  let wrapper;

  describe.each([
    {
      props: { variant: 'static' },
      expectedResolvedVariant: 'static',
    },
    {
      props: { isInDropdown: true },
      expectedResolvedVariant: 'dropdown-content',
    },
    {
      props: { useDropdown: true },
      expectedResolvedVariant: 'outline',
    },
    {
      props: {},
      expectedResolvedVariant: 'normal',
    },
  ])('when props is $props', ({ props, expectedResolvedVariant }) => {
    it(`passes variant ${expectedResolvedVariant}`, () => {
      wrapper = setup(props);

      const sidebarOptionInside = wrapper.findComponent(
        elements.sidebarOptionInside,
      );

      expect(sidebarOptionInside.props('variant')).toBe(
        expectedResolvedVariant,
      );
    });
  });

  describe('when it is an accordion', () => {
    beforeEach(() => {
      router.push('/some-url-1');

      wrapper = setup({
        option: {
          label: 'Accordion Title ',
          icon: 'neurology',
          type: 'isActive',
          children: [
            {
              label: 'First Link',
              viewUrl: '/some-url-1',
              type: 'isActive',
            },
            {
              label: 'Second Link',
              viewUrl: '/some-url-2',
              type: 'isActive',
            },
          ],
        },
      });
    });

    it('should show accordion content when the user clicks on it', async () => {
      const sidebarOptionInside = wrapper.findComponent(
        elements.sidebarOptionInside,
      );

      await sidebarOptionInside.vm.$emit('click');

      const accordionContent = wrapper.find(elements.accordionContent);

      expect(accordionContent.isVisible()).toBeTruthy();
    });
  });
});
