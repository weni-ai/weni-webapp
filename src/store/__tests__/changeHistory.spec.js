import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';

import { useChangeHistoryStore } from '@/store/changeHistory';
import { useProjectStore } from '@/store/project';
import changeHistoryApi from '@/api/changeHistory.js';

vi.mock('@/api/changeHistory.js', () => ({
  default: {
    list: vi.fn(),
    retrieve: vi.fn(),
  },
}));

describe('useChangeHistoryStore', () => {
  let changeHistoryStore;
  let projectStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    changeHistoryStore = useChangeHistoryStore();
    projectStore = useProjectStore();
    vi.clearAllMocks();
  });

  describe('loadChangeHistory', () => {
    it('marks the list complete when there is no current project', async () => {
      await changeHistoryStore.loadChangeHistory();

      expect(changeHistoryApi.list).not.toHaveBeenCalled();
      expect(changeHistoryStore.status).toBe('complete');
    });

    it('loads results for the current Pinia project', async () => {
      projectStore.currentProject = { uuid: 'project-123' };
      changeHistoryApi.list.mockResolvedValue({
        data: {
          results: [{ uuid: 'change-1' }],
          next: null,
        },
      });

      await changeHistoryStore.loadChangeHistory();

      expect(changeHistoryApi.list).toHaveBeenCalledWith({
        projectUuid: 'project-123',
        cursor: null,
      });
      expect(changeHistoryStore.changes).toEqual([{ uuid: 'change-1' }]);
      expect(changeHistoryStore.status).toBe('complete');
    });
  });

  describe('fetchDetail', () => {
    it('loads the detail for the current Pinia project', async () => {
      projectStore.currentProject = { uuid: 'project-123' };
      changeHistoryApi.retrieve.mockResolvedValue({
        data: { uuid: 'change-1', action: 'updated' },
      });

      const pending = changeHistoryStore.fetchDetail('change-1');
      expect(changeHistoryStore.detailStatus).toBe('loading');

      await pending;
      await flushPromises();

      expect(changeHistoryApi.retrieve).toHaveBeenCalledWith({
        projectUuid: 'project-123',
        uuid: 'change-1',
      });
      expect(changeHistoryStore.detailData).toEqual({
        uuid: 'change-1',
        action: 'updated',
      });
      expect(changeHistoryStore.detailStatus).toBe('loaded');
    });
  });
});
