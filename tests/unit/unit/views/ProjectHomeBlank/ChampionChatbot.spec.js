import { shallowMount } from '@vue/test-utils';
import ChampionChatbot from '@/views/ProjectHomeBlank/ChampionChatbot.vue';

const wrapper = shallowMount(ChampionChatbot)

describe('ChampionChatbot.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});