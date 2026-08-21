import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import changeHistoryApi from '@/api/changeHistory.js';
import { useProjectStore } from '@/store/project';

function parseCursor(next) {
  if (!next) return null;

  // The API returns `next` as an absolute URL, so it has to be parsed as one.
  return new URL(next, window.location.origin).searchParams.get('cursor');
}

export const useChangeHistoryStore = defineStore('changeHistory', () => {
  const changes = ref([]);
  const nextCursor = ref(null);
  const status = ref(null);

  const filters = ref({});

  const detailData = ref(null);
  const detailStatus = ref(null);

  const isFirstLoading = computed(
    () => status.value === 'loading' && changes.value.length === 0,
  );

  const isLoadingMore = computed(
    () => status.value === 'loading' && changes.value.length > 0,
  );

  const hasMoreToLoad = computed(
    () => !['loading', 'complete', 'error'].includes(status.value),
  );

  const isDetailLoading = computed(() => detailStatus.value === 'loading');

  function setFilters(nextFilters) {
    filters.value = { ...nextFilters };
  }

  function clearDetail() {
    detailData.value = null;
    detailStatus.value = null;
  }

  function clear() {
    changes.value = [];
    nextCursor.value = null;
    status.value = null;
    clearDetail();
  }

  async function loadChangeHistory() {
    if (!hasMoreToLoad.value) return;

    const projectUuid = useProjectStore().currentProject?.uuid;

    if (!projectUuid) {
      status.value = 'complete';
      return;
    }

    status.value = 'loading';

    try {
      const { data } = await changeHistoryApi.list({
        projectUuid,
        cursor: nextCursor.value,
        ...filters.value,
      });

      const results = data.results || [];

      changes.value = [...changes.value, ...results];
      nextCursor.value = parseCursor(data.next);

      status.value = nextCursor.value && results.length ? 'loaded' : 'complete';
    } catch {
      status.value = 'error';
    }
  }

  async function fetchDetail(uuid) {
    const projectUuid = useProjectStore().currentProject?.uuid;

    if (!projectUuid || !uuid) {
      detailStatus.value = 'error';
      return;
    }

    detailStatus.value = 'loading';
    detailData.value = null;

    try {
      const { data } = await changeHistoryApi.retrieve({ projectUuid, uuid });
      detailData.value = data;
      detailStatus.value = 'loaded';
    } catch {
      detailStatus.value = 'error';
    }
  }

  async function reset() {
    clear();
    await loadChangeHistory();
  }

  return {
    changes,
    nextCursor,
    status,
    filters,
    detailData,
    detailStatus,
    isFirstLoading,
    isLoadingMore,
    hasMoreToLoad,
    isDetailLoading,
    setFilters,
    clear,
    clearDetail,
    loadChangeHistory,
    fetchDetail,
    reset,
  };
});
