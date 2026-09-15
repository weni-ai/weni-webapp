import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';

import { useChangeHistoryStore } from '@/store/changeHistory';
import { useProjectStore } from '@/store/project';
import changeHistoryApi from '@/api/changeHistory';

vi.mock('@/api/changeHistory.js', () => ({
  default: {
    list: vi.fn(),
    retrieve: vi.fn(),
  },
}));

vi.mock('@/api/projects', () => ({
  default: {},
}));

const PROJECT_UUID = 'project-uuid';

function mockListResponse({ results = [], next = null } = {}) {
  changeHistoryApi.list.mockResolvedValue({
    data: { results, next },
  });
}

describe('useChangeHistoryStore', () => {
  let changeHistoryStore;
  let projectStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    projectStore = useProjectStore();
    projectStore.currentProject = { uuid: PROJECT_UUID };
    changeHistoryStore = useChangeHistoryStore();
    vi.clearAllMocks();
  });

  describe('loadChangeHistory', () => {
    it('forwards the current filters to the list API', async () => {
      mockListResponse();

      changeHistoryStore.setFilters({
        search: 'agent name',
        area: 'AGENT_BUILDER',
        type: 'MY_AGENTS',
      });

      await changeHistoryStore.loadChangeHistory();

      expect(changeHistoryApi.list).toHaveBeenCalledWith({
        projectUuid: PROJECT_UUID,
        cursor: null,
        search: 'agent name',
        area: 'AGENT_BUILDER',
        type: 'MY_AGENTS',
      });
    });

    it('forwards empty filters when none are set', async () => {
      mockListResponse();

      await changeHistoryStore.loadChangeHistory();

      expect(changeHistoryApi.list).toHaveBeenCalledWith({
        projectUuid: PROJECT_UUID,
        cursor: null,
        search: '',
        area: null,
        type: null,
      });
    });

    it('sends the current filters again when loading the next page', async () => {
      changeHistoryApi.list
        .mockResolvedValueOnce({
          data: {
            results: [{ uuid: 'change-1' }],
            next: 'https://api.example/change-history?cursor=page-2',
          },
        })
        .mockResolvedValueOnce({
          data: { results: [{ uuid: 'change-2' }], next: null },
        });

      changeHistoryStore.setFilters({
        search: 'queue',
        area: 'LIVE_DESK',
        type: 'QUEUE',
      });

      await changeHistoryStore.loadChangeHistory();
      await changeHistoryStore.loadChangeHistory();

      expect(changeHistoryApi.list).toHaveBeenNthCalledWith(2, {
        projectUuid: PROJECT_UUID,
        cursor: 'page-2',
        search: 'queue',
        area: 'LIVE_DESK',
        type: 'QUEUE',
      });
    });

    it('does not call the API without a current project', async () => {
      projectStore.currentProject = null;

      await changeHistoryStore.loadChangeHistory();

      expect(changeHistoryApi.list).not.toHaveBeenCalled();
      expect(changeHistoryStore.status).toBe('complete');
    });
  });

  describe('reset', () => {
    it('reloads from the first page with the current filters', async () => {
      mockListResponse({ results: [{ uuid: 'change-1' }] });

      changeHistoryStore.setFilters({
        search: 'flow',
        area: 'AUTOMATION_FLOW',
        type: null,
      });
      changeHistoryStore.nextCursor = 'stale-cursor';
      changeHistoryStore.changes = [{ uuid: 'stale' }];

      await changeHistoryStore.reset();
      await flushPromises();

      expect(changeHistoryStore.changes).toEqual([{ uuid: 'change-1' }]);
      expect(changeHistoryApi.list).toHaveBeenCalledWith({
        projectUuid: PROJECT_UUID,
        cursor: null,
        search: 'flow',
        area: 'AUTOMATION_FLOW',
        type: null,
      });
    });
  });
});
