import ProfileLanguageSelector from '@/components/Topbar/ProfileLanguageSelector.vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useAccountStore } from '@/store/account';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const languages = ['pt-br', 'en', 'es'];

const setup = () =>
  mount(ProfileLanguageSelector, {
    global: {
      plugins: [createTestingPinia(), UnnnicSystem],
    },
  });

describe('ProfileLanguageSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  it.each(languages)('renders %s element', (language) => {
    const languageElement = wrapper.find(`[data-test="${language}"]`);

    expect(languageElement.exists()).toBeTruthy();
  });

  describe.each(languages)('when the user clicks on %s element', (language) => {
    it(`should call updateAccountLanguage with ${language}`, async () => {
      const languageElement = wrapper.find(`[data-test="${language}"]`);
      const accountStore = useAccountStore();

      await languageElement.trigger('click');

      expect(accountStore.updateAccountLanguage).toHaveBeenCalledWith({
        language,
      });
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
