import { shallowMount } from '@vue/test-utils';
import activeContacts from '@/views/billing/tabs/activeContacts.vue';

const wrapper = shallowMount(activeContacts)

describe('activeContacts.vue', () => {
  it('renders correctly', () => {
    expect(wrapper).toBeDefined()
  });
});