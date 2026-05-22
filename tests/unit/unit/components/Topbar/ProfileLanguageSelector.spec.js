import ProfileLanguageSelector from '@/components/Topbar/ProfileLanguageSelector.vue';
import { mount } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';
import { createStore } from 'vuex';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const store = createStore({
  actions: {
    updateAccountLanguage(_, { language }) {
      i18n.global.locale = language;
    },
  },
});

const languages = ['pt-br', 'en', 'es'];

const setup = () =>
  mount(ProfileLanguageSelector, {
    global: {
      plugins: [store, UnnnicSystem],
    },
  });

describe('ProfileLanguageSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    i18n.global.locale = 'en';
    wrapper = setup();
  });

  it.each(languages)('renders %s element', (language) => {
    const languageElement = wrapper.find(`[data-test="${language}"]`);

    expect(languageElement.exists()).toBeTruthy();
  });

  describe.each(languages)('when the user clicks on %s element', (language) => {
    it(`should change the system language to ${language}`, async () => {
      const languageElement = wrapper.find(`[data-test="${language}"]`);

      await languageElement.trigger('click');

      expect(i18n.global.locale).toBe(language);
    });
  });

  it('renders the back row', () => {
    const backRow = wrapper.find('[data-test="back"]');

    expect(backRow.exists()).toBeTruthy();
  });

  describe('when the user clicks on back row', () => {
    it('emits the back event', async () => {
      const backRow = wrapper.find('[data-test="back"]');

      await backRow.trigger('click');

      expect(wrapper.emitted('back')).toBeTruthy();
    });
  });
});
