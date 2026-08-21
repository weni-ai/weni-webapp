import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import account from '@/views/account.vue';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

describe('account.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(account, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              account: {
                profile,
              },
              Org: {
                currentOrg: org,
              },
              Project: {
                currentProject: project,
              },
            },
          }),
        ],
        stubs: {
          UnnnicButton: true,
          UnnnicInput: true,
          avatar: true,
          UnnnicCard: true,
        },
        mocks: {
          $route: {},
        },
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
