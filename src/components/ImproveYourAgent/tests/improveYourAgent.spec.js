import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImproveYourAgent from '@/components/ImproveYourAgent/index.vue';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

const mockRouter = {
  push: vi.fn()
};

config.global.mocks = {
  $t: (key) => key,
};

describe('ImproveYourAgent', () => {
  let wrapper;
  const defaultProps = {
    urlRoutes: {
      home: '/home',
      integrations: '/integrations',
      agent_builder: '/agent-builder'
    }
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();

    wrapper = mount(ImproveYourAgent, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          'router-link': true,
          UnnnicIcon: true,
          ItemCollapse: true,
        },
      },
      setup() {
        return {
          router: mockRouter
        };
      }
    });
  });

  describe('rendering', () => {
    it('renders the component properly', () => {
      expect(wrapper.find('[data-test-id="improve-your-agent"]').exists()).toBeTruthy();
    });

    it('renders the button with correct icon', () => {
      const button = wrapper.find('[data-test-id="improve-your-agent-button"]');
      const icon = wrapper.find('[data-test-id="improve-your-agent-icon"]');
      
      expect(button.exists()).toBeTruthy();
      expect(icon.exists()).toBeTruthy();
    });
  });

  describe('computed properties', () => {
    it('computes allTriggersClicked correctly when not all clicked', () => {
      expect(wrapper.vm.allTriggersClicked).toBeFalsy();
    });

    it('computes allTriggersClicked correctly when all clicked', async () => {
      wrapper = mount(ImproveYourAgent, {
        props: defaultProps
      });

      wrapper.vm.triggersClicked = {
        home: true,
        integrations: true,
        personalization: true,
        performance: true
      };
      await nextTick();

      expect(wrapper.vm.allTriggersClicked).toBeTruthy();
    });

    it('computes improves array with correct', () => {
      wrapper = mount(ImproveYourAgent, {
        props: defaultProps
      });

      expect(wrapper.vm.improves.length).toBe(4);
    });
  });

  describe('localStorage interactions', () => {
    it('loads preferences from localStorage on mount', async () => {
      localStorageMock.setItem('improve-agent-preferences', JSON.stringify({ openByDefault: true }));
      wrapper = mount(ImproveYourAgent, {
        props: defaultProps
      });
      
      await nextTick();
      expect(wrapper.find('[data-test-id="improve-your-agent-content"]').exists()).toBeTruthy();
    });

    it('loads trigger state from localStorage on mount', async () => {
      localStorageMock.setItem('improve-agent-triggers', JSON.stringify({ home: true }));
      wrapper = mount(ImproveYourAgent, {
        props: defaultProps,
        global: {
          mocks: { $t: (key) => key },
          plugins: [[i18n]],
          stubs: { UnnnicIcon: true, ItemCollapse: true },
        }
      });
      
      await nextTick();
      expect(wrapper.vm.triggersClicked.home).toBe(true);
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.getItem.mockImplementationOnce(() => 'invalid-json');
      
      wrapper = mount(ImproveYourAgent, {
        props: defaultProps,
        global: {
          mocks: { $t: (key) => key },
          plugins: [[i18n]],
          stubs: { UnnnicIcon: true, ItemCollapse: true },
        }
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('user interactions', () => {
    it('closes improve section when clicking outside', async () => {
      wrapper.vm.isImprovesOpen = true;
      await nextTick();
      
      const event = new Event('click');
      document.dispatchEvent(event);
      await nextTick();
      
      expect(wrapper.find('[data-test-id="improve-your-agent-content"]').exists()).toBeFalsy();
    });
  });

  describe('navigation handling', () => {
    it('handles navigation correctly for each improve item', async () => {
      wrapper.vm.isImprovesOpen = true;
      await nextTick();

      const improveItems = wrapper.findAll('[data-test-id="item-collapse"]');
      const routes = ['home', 'integrations', 'agent_builder', 'agent_builder'];
      const triggers = ['home', 'integrations', 'personalization', 'performance'];

      for (let i = 0; i < improveItems.length; i++) {
        await improveItems[i].vm.$emit('show-me');
        
        expect(mockRouter.push).toHaveBeenCalledWith(defaultProps.urlRoutes[routes[i]]);
        expect(wrapper.vm.triggersClicked[triggers[i]]).toBe(true);
        expect(wrapper.find('[data-test-id="improve-your-agent-content"]').exists()).toBeFalsy();
      }
    });
  });

});