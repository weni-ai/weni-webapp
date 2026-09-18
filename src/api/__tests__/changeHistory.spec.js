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
        area: 'NEXUS',
        type: 'MY_AGENTS',
      });

      expect(get).toHaveBeenCalledWith(
        '/v2/projects/project-1/change-history',
        {
          params: {
            cursor: 'next-cursor',
            object_name: 'agent',
            module: 'NEXUS',
            entity: 'AGENT',
          },
        },
      );
    });

    it('maps knowledge base to CONTENT_BASE_FILE', async () => {
      await changeHistoryApi.list({
        projectUuid: 'project-1',
        area: 'NEXUS',
        type: 'KNOWLEDGE_BASE',
      });

      expect(get).toHaveBeenCalledWith(
        '/v2/projects/project-1/change-history',
        {
          params: {
            cursor: undefined,
            object_name: undefined,
            module: 'NEXUS',
            entity: 'CONTENT_BASE_FILE',
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
