import LearningCenterChampionChatbotYoutubePreview from '@/components/common/RightBar/LearningCenterChampionChatbotYoutubePreview.vue';
import {  mount } from '@vue/test-utils';

const setup = ({ videoId } = {}) =>
  mount(LearningCenterChampionChatbotYoutubePreview, {
    props: {
      videoId,
    },
  });

describe('LearningCenterChampionChatbotYoutubePreview.vue', () => {
  let wrapper;

  it('renders the video preview properly', () => {
    wrapper = setup({ videoId: 'abcd1234' });

    const videoPreview = wrapper.find('[data-test="video-preview"]');

    expect(videoPreview.attributes('style')).toContain(
      'background-image: url(https://i.ytimg.com/vi_webp/abcd1234/maxresdefault.webp)',
    );
  });
});
