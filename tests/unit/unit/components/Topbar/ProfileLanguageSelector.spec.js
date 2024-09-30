import ProfileLanguageSelector from '@/components/Topbar/ProfileLanguageSelector.vue';
import { createLocalVue, mount } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';
import Vuex from 'vuex';

const localVue = createLocalVue();

localVue.use(Vuex);

const store = new Vuex.Store({
  actions: {
    updateAccountLanguage(_, { language }) {
      i18n.global.locale = language;
    },
  },
});

const languages = ['pt-br', 'en', 'es'];

const setup = ({ text } = {}) =>
  mount(ProfileLanguageSelector, {
    localVue,
    store,

    props: {
      text,
    },

    mocks: {
      $t: (key) => key,
    },
  });

describe('ProfileLanguageSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    i18n.global.locale = 'en';
  });

  it.each(languages)('renders %s element', (language) => {
    wrapper = setup();

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
});
