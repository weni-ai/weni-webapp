import { shallowMount } from '@vue/test-utils';
import WarningMaxActiveContacts from '@/components/billing/WarningMaxActiveContacts.vue';
import { createTestingPinia } from '@pinia/testing';

import { org } from '../../../__mocks__';

describe('WarningMaxActiveContacts.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(WarningMaxActiveContacts, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              news: {
                status: null,
              },
              Org: {
                currentOrg: org,
                orgs: { data: [org] },
              },
            },
          }),
        ],
        stubs: {
          UnnnicIconSvg: true,
          UnnnicSlider: true,
          UnnnicTable: true,
          UnnnicTableRow: true,
        },
      },
      props: {
        ranges: [],
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
