import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useUsersStore } from '@/store/users';
import usersApi from '@/api/users';

vi.mock('@/api/users', () => ({
  default: {
    search: vi.fn(),
  },
}));

describe('useUsersStore', () => {
  let usersStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    usersStore = useUsersStore();
    vi.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('calls the search API with the given term and returns the response', async () => {
      const response = { data: [{ email: 'jane@example.com' }] };
      usersApi.search.mockResolvedValue(response);

      const result = await usersStore.searchUsers({ search: 'jane' });

      expect(usersApi.search).toHaveBeenCalledWith('jane');
      expect(result).toBe(response);
    });

    it('propagates API errors', async () => {
      const error = new Error('search failed');
      usersApi.search.mockRejectedValue(error);

      await expect(usersStore.searchUsers({ search: 'jane' })).rejects.toThrow(
        error,
      );

      expect(usersApi.search).toHaveBeenCalledWith('jane');
    });
  });
});
