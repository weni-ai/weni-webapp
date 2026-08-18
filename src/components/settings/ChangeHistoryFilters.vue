<template>
  <section class="change-history-filters">
    <UnnnicInput
      v-model="searchQuery"
      class="change-history-filters__search"
      iconLeft="search-1"
      :placeholder="$t('settings.change_history.filters.search_placeholder')"
      @update:model-value="debouncedSearch"
    />

    <UnnnicSelect
      v-model="selectedArea"
      class="change-history-filters__select"
      clearable
      :placeholder="$t('settings.change_history.filters.all_areas')"
      :options="changeHistoryStore.areaOptions"
      :optionsLines="changeHistoryStore.areaOptions?.length"
      @update:model-value="handleAreaChange"
    />

    <UnnnicSelect
      v-model="selectedType"
      class="change-history-filters__select"
      clearable
      :disabled="!hasTypeOptions"
      :placeholder="$t('settings.change_history.filters.all_types')"
      :options="changeHistoryStore.typeOptions"
      :optionsLines="changeHistoryStore.typeOptions?.length"
      @update:model-value="handleTypeChange"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';

import { useChangeHistoryStore } from '@/store/changeHistory.js';

const SEARCH_DEBOUNCE_MS = 300;

const changeHistoryStore = useChangeHistoryStore();

const searchQuery = ref(changeHistoryStore.filters.search || '');
const selectedArea = ref(changeHistoryStore.filters.area || '');
const selectedType = ref(changeHistoryStore.filters.type || '');

const hasTypeOptions = computed(
  () => changeHistoryStore.typeOptions.length > 0,
);

const debouncedSearch = useDebounceFn((value) => {
  changeHistoryStore.setFilters({
    ...changeHistoryStore.filters,
    search: value,
  });
}, SEARCH_DEBOUNCE_MS);

function handleAreaChange(value) {
  const area = value || null;

  selectedArea.value = area || '';
  selectedType.value = '';

  changeHistoryStore.setFilters({
    ...changeHistoryStore.filters,
    area,
    type: null,
  });
}

function handleTypeChange(value) {
  const type = value || null;

  selectedType.value = type || '';

  changeHistoryStore.setFilters({
    ...changeHistoryStore.filters,
    type,
  });
}
</script>

<style lang="scss" scoped>
.change-history-filters {
  display: flex;
  gap: $unnnic-space-4;
  margin-top: $unnnic-space-4;
  margin-bottom: $unnnic-space-6;

  &__search {
    width: 50%;
  }

  &__select {
    width: 25%;
  }
}
</style>
