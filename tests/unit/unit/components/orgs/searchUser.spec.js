import { shallowMount, createLocalVue } from '@vue/test-utils';
import SearchUser from '@/components/orgs/searchUser.vue';
import i18n from '@/utils/plugins/i18n';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('SearchUser.vue', () => {
  let wrapper;
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      searchUsers: jest.fn(),
    };

    store = new Vuex.Store({
      actions,
    });

    wrapper = shallowMount(SearchUser, {
      localVue,
      store,
      i18n,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicAutocomplete: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('onEnter()', async () => {
    wrapper.vm.onEnter();
    expect(wrapper.emitted('enter')).toBeTruthy();
  });

  it('selectUser()', async () => {
    wrapper.vm.selectUser();
    expect(wrapper.emitted('select')).toBeTruthy();
  });

  describe('fetchUsers()', () => {
    it('test when emails not exists', async () => {
      wrapper.setData({
        email: null,
      });
      await wrapper.vm.fetchUsers();
      expect(wrapper.vm.users).toEqual([]);
    });

    it('test when email exists but got an error', async () => {
      wrapper.setData({
        email: 'test@a.com',
      });

      actions.searchUsers.mockImplementation(() => {
        throw new Error('error fetching');
      });
      expect(wrapper.vm.users).toEqual([]);
    });

    it('test when email exists an goes it right', async () => {
      wrapper.setData({
        email: 'test@a.com',
      });
      expect(actions.searchUsers).not.toHaveBeenCalled();
      await wrapper.vm.fetchUsers();
      expect(actions.searchUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('onSearch()', async () => {
    const spy = jest.spyOn(wrapper.vm, 'fetchUsers');
    await wrapper.vm.onSearch();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('it change when value() changes', async () => {
    const spy = jest.spyOn(wrapper.vm, 'onSearch');

    await wrapper.setProps({
      value: 'top',
    });

    expect(wrapper.vm.email).toEqual('top');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
