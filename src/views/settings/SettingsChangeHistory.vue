<template>
  <section class="settings-change-history">
    <UnnnicPageHeader
      :title="$t('settings.change_history.title')"
      :description="$t('settings.change_history.description')"
    >
      <template #actions>
        <UnnnicButton
          :text="$t('settings.change_history.export_changes')"
          type="secondary"
        />
      </template>
    </UnnnicPageHeader>

    <ChangeHistoryTable
      :changes="changes"
      :isLoading="isLoading"
    />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import changeHistoryApi from '@/api/changeHistory.js';
import ChangeHistoryTable from '@/components/settings/ChangeHistoryTable.vue';

const store = useStore();

const changes = ref([]);
const nextCursor = ref(null);
const isLoading = ref(false);

async function fetchChangeHistory({ cursor = null, append = false } = {}) {
  const projectUuid = store.getters.currentProject?.uuid;

  if (!projectUuid) return;

  isLoading.value = true;

  try {
    const { data } = await changeHistoryApi.list({
      projectUuid,
      cursor,
    });

    changes.value = append ? [...changes.value, ...data.results] : data.results;

    nextCursor.value = data.next
      ? new URLSearchParams(data.next.replace(/^\?/, '')).get('cursor')
      : null;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchChangeHistory();
});
</script>

<style lang="scss" scoped>
.settings-change-history {
  padding: $unnnic-space-4;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  overflow-x: hidden;
}
</style>
