import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import SearchUser from '@/components/orgs/searchUser.vue';
import { createStore } from 'vuex';

describe('SearchUser.vue', () => {
  let wrapper;
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      searchUsers: vi.fn(),
    };

    store = createStore({
      actions,
    });

    wrapper = shallowMount(SearchUser, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicAutocomplete: true,
          UnnnicFormElement: true,
          UnnnicSelectSmart: true,
        },
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
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
    const spy = vi.spyOn(wrapper.vm, 'fetchUsers');
    await wrapper.vm.onSearch();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('it change when value() changes', async () => {
    const spy = vi.spyOn(wrapper.vm, 'onSearch');

    await wrapper.setProps({
      value: 'top',
    });

    expect(wrapper.vm.email).toEqual('top');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
