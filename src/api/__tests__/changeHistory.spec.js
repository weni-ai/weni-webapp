import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('@/api/request.js', () => ({
  default: {
    $http: () => ({ get }),
  },
}));

import changeHistoryApi from '@/api/changeHistory.js';

describe('changeHistoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({ data: { results: [] } });
  });

  describe('list', () => {
    it('adapts UI filters into cursor and query params', async () => {
      await changeHistoryApi.list({
        projectUuid: 'project-1',
        cursor: 'next-cursor',
        search: 'agent',
        area: 'AGENT_BUILDER',
        type: 'MY_AGENTS',
      });

      expect(get).toHaveBeenCalledWith(
        '/v2/projects/project-1/change-history',
        {
          params: {
            cursor: 'next-cursor',
            object_name: 'agent',
            module: 'AGENT_BUILDER',
            entity: 'MY_AGENTS',
          },
        },
      );
    });

    it('omits empty filter params', async () => {
      await changeHistoryApi.list({ projectUuid: 'project-1' });

      expect(get).toHaveBeenCalledWith(
        '/v2/projects/project-1/change-history',
        {
          params: {
            cursor: undefined,
            object_name: undefined,
            module: undefined,
            entity: undefined,
          },
        },
      );
    });
  });
});
