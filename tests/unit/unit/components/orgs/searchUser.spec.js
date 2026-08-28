import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import SearchUser from '@/components/orgs/searchUser.vue';
import { useUsersStore } from '@/store/users';

describe('SearchUser.vue', () => {
  let wrapper;
  let usersStore;

  beforeEach(() => {
    wrapper = shallowMount(SearchUser, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          UnnnicAutocomplete: true,
          UnnnicFormElement: true,
          UnnnicSelect: true,
        },
      },
    });

    usersStore = useUsersStore();
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
        search: '',
      });
      await wrapper.vm.fetchUsers();
      expect(wrapper.vm.users).toEqual([]);
    });

    it('test when email exists but got an error', async () => {
      wrapper.setData({
        search: 'test@a.com',
      });

      usersStore.searchUsers.mockImplementation(() => {
        throw new Error('error fetching');
      });
      await wrapper.vm.fetchUsers();
      expect(wrapper.vm.users).toEqual([]);
    });

    it('test when email exists an goes it right', async () => {
      wrapper.setData({
        search: 'test@a.com',
      });
      expect(usersStore.searchUsers).not.toHaveBeenCalled();
      await wrapper.vm.fetchUsers();
      expect(usersStore.searchUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('onSearch()', async () => {
    const spy = vi.spyOn(wrapper.vm, 'fetchUsers');
    await wrapper.vm.onSearch();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('it change when modelValue() changes', async () => {
    const spy = vi.spyOn(wrapper.vm, 'onSearch');

    await wrapper.setProps({
      modelValue: 'top',
    });

    expect(wrapper.vm.email).toEqual('top');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
