import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import changeHistoryApi from '@/api/changeHistory.js';
import rootStore from '@/store';
import i18n from '@/utils/plugins/i18n.js';

function parseCursor(next) {
  if (!next) return null;

  // The API returns `next` as an absolute URL, so it has to be parsed as one.
  return new URL(next, window.location.origin).searchParams.get('cursor');
}

export const useChangeHistoryStore = defineStore('changeHistory', () => {
  const changes = ref([]);
  const nextCursor = ref(null);
  const status = ref(null);

  const filters = ref({
    search: '',
    area: null,
    type: null,
  });

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

  const areaOptions = computed(() => [
    {
      value: 'AGENT_BUILDER',
      label: i18n.global.t('settings.change_history.areas.AGENT_BUILDER'),
    },
    {
      value: 'LIVE_DESK',
      label: i18n.global.t('settings.change_history.areas.LIVE_DESK'),
    },
    {
      value: 'CHANNELS',
      label: i18n.global.t('settings.change_history.areas.CHANNELS'),
    },
    {
      value: 'AUTOMATION_FLOW',
      label: i18n.global.t('settings.change_history.areas.AUTOMATION_FLOW'),
    },
  ]);

  const AREA_TYPES = {
    AGENT_BUILDER: ['MY_AGENTS', 'KNOWLEDGE_BASE', 'INSTRUCTIONS'],
    LIVE_DESK: ['QUEUE', 'SECTOR'],
  };

  const typeOptions = computed(() => {
    const types = AREA_TYPES[filters.value.area] || [];

    return types.map((type) => ({
      value: type,
      label: i18n.global.t(`settings.change_history.types.${type}`),
    }));
  });

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

    const projectUuid = rootStore.getters.currentProject?.uuid;

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
    const projectUuid = rootStore.getters.currentProject?.uuid;

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
    areaOptions,
    typeOptions,
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
