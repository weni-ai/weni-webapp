import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import orgPermissionsRead from '@/components/orgs/orgPermissionsRead.vue';
import i18n from '@/utils/plugins/i18n';
import org from '../../../__mocks__/org';

const localVue = createLocalVue();
localVue.use(Vuex);
describe('orgPermissionsRead.vue', () => {
  let wrapper;
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      getMembers: jest.fn(),
      addAuthorization: jest.fn(),
      changeAuthorization: jest.fn(),
      removeAuthorization: jest.fn(),
    };

    store = new Vuex.Store({
      modules: {
        org: {
          actions,
        },
        Account: {
          state: {
            profile: {
              username: 'test',
            },
          },
        },
      },
    });

    wrapper = shallowMount(orgPermissionsRead, {
      localVue,
      store,
      i18n,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        orgRole: true,
        SearchUser: true,
        InfiniteLoading: true,
      },
      propsData: {
        org,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('test props', async () => {
    expect(wrapper.vm.org).toBe(org);
  });

  it('isMe()', () => {
    const validator = wrapper.vm.isMe({ user__username: 'test' });
    expect(validator).toBeTruthy;
  });

  it('onSearch()', async () => {
    wrapper.vm.$refs.infiniteLoading.reset = jest.fn();
    await wrapper.vm.onSearch();
    expect(wrapper.vm.permissions).toEqual([]);
    expect(wrapper.vm.page).toEqual(0);
    expect(wrapper.vm.complete).toEqual(false);
  });
});
