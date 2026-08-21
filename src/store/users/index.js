import { defineStore } from 'pinia';
import users from '@/api/users';

export const useUsersStore = defineStore('users', () => {
  function searchUsers({ search }) {
    return users.search(search);
  }

  return {
    searchUsers,
  };
});
