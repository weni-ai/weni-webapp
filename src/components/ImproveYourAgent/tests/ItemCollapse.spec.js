import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ItemCollapse from '@/components/ImproveYourAgent/ItemCollapse.vue';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {},
    fallbackWarn: false,
    missingWarn: false,
  });
  
config.global.plugins = [i18n, UnnnicSystem];

config.global.mocks = {
  $t: (key) => key,
};

describe('ItemCollapse', () => {
  let wrapper;
  const defaultProps = {
    icon: 'test-icon',
    title: 'Test Title',
    description: 'Test Description',
    open: false,
  };

  beforeEach(() => {
    wrapper = mount(ItemCollapse, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key) => key,
        },
      },
    });
  });

  describe('rendering', () => {
    it('renders the component properly', () => {
      expect(wrapper.exists()).toBeTruthy();
      expect(wrapper.find('.item-collapse').exists()).toBeTruthy();
    });

    it('renders header with correct props', () => {
      const header = wrapper.find('[data-test-id="item-collapse-header"]');
      const icon = wrapper.findComponent('[data-test-id="item-collapse-icon"]');
      const title = wrapper.find('[data-test-id="header__title"]');

      expect(header.exists()).toBeTruthy();
      expect(icon.props('icon')).toBe('test-icon');
      expect(title.text()).toBe('Test Title');
    });

    it('renders content with correct props', () => {
      const description = wrapper.find('[data-test-id="content__description"]');
      const button = wrapper.findComponent('[data-test-id="item-collapse-button"]');

      expect(description.text()).toBe('Test Description');
      expect(button.exists()).toBeTruthy();
      expect(button.props('text')).toBe('home.improve_your_agent.show_me');
    });

    it('applies active class when open prop is true', async () => {
      await wrapper.setProps({ open: true });
      expect(wrapper.find('.item-collapse__content--active').exists()).toBeTruthy();
      expect(wrapper.find('.header__arrow--active').exists()).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('emits update:open event when header is clicked', async () => {
      const header = wrapper.find('[data-test-id="item-collapse-header"]');
      await header.trigger('click');

      expect(wrapper.emitted('update:open')).toBeTruthy();
      expect(wrapper.emitted('update:open')[0]).toEqual([true]);
    });

    it('emits show-me event when button is clicked', async () => {
      const button = wrapper.findComponent('[data-test-id="item-collapse-button"]');
      await button.trigger('click');

      expect(wrapper.emitted('show-me')).toBeTruthy();
      expect(wrapper.emitted('show-me')).toHaveLength(1);
    });
  });

  describe('content height management', () => {
    let contentElement;
  
    beforeEach(() => {
      contentElement = document.createElement('div');
      vi.spyOn(contentElement, 'scrollHeight', 'get').mockReturnValue(100);
  
      wrapper = mount(ItemCollapse, {
        props: defaultProps,
        global: {
          stubs: {
            UnnnicIcon: true,
            UnnnicButton: true,
          },
        },
      });
    });
  
    it('initializes with zero height when closed', () => {
      const content = wrapper.find('[data-test-id="item-collapse-content"]');
      expect(content.element.style.maxHeight).toBe('0');
    });
  
    it('adjusts height when opened', async () => {
      const content = wrapper.find('[data-test-id="item-collapse-content"]');
      vi.spyOn(content.element, 'scrollHeight', 'get').mockReturnValue(100);
      await wrapper.setProps({ open: true });
      await nextTick();
      expect(content.element.style.maxHeight).toBe('100px');
    });
  
    it('resets height when closed', async () => {
      const content = wrapper.find('[data-test-id="item-collapse-content"]');
      vi.spyOn(content.element, 'scrollHeight', 'get').mockReturnValue(100);
      await wrapper.setProps({ open: true });
      await nextTick();
      await wrapper.setProps({ open: false });
      await nextTick();
      expect(content.element.style.maxHeight).toBe('0');
    });
  
    it('handles mounted state correctly when open is true', async () => {
      wrapper = mount(ItemCollapse, {
        props: {
          ...defaultProps,
          open: true,
        },
        global: {
          stubs: {
            UnnnicIcon: true,
            UnnnicButton: true,
          },
        },
      });
  
      const content = wrapper.find('[data-test-id="item-collapse-content"]');
      vi.spyOn(content.element, 'scrollHeight', 'get').mockReturnValue(100);
      await nextTick();
      expect(content.element.style.maxHeight).toBe('100px');
    });
  });

  describe('watch behavior', () => {
    it('updates content height when open prop changes', async () => {
      const content = wrapper.find('[data-test-id="item-collapse-content"]');
      vi.spyOn(content.element, 'scrollHeight', 'get').mockReturnValue(100);
      await wrapper.setProps({ open: true });
      await nextTick();

      expect(content.element.style.maxHeight).toBe('100px');

      await wrapper.setProps({ open: false });
      await nextTick();
      expect(wrapper.find('[data-test-id="item-collapse-content"]').element.style.maxHeight).toBe('0');
    });
  });
});