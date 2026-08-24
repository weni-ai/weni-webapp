<template>
  <section
    ref="root"
    class="settings-change-history"
  >
    <UnnnicPageHeader
      :title="$t('settings.change_history.title')"
      :description="$t('settings.change_history.description')"
    >
    </UnnnicPageHeader>

    <ChangeHistoryTable />
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import ChangeHistoryTable from '@/components/settings/ChangeHistoryTable.vue';
import { useChangeHistoryStore } from '@/store/changeHistory.js';

const SAFE_DISTANCE = 10;

const changeHistoryStore = useChangeHistoryStore();

const root = ref(null);
const scrollContainer = ref(null);
const isCheckingScroll = ref(false);
const hasScroll = ref(false);

function findScrollContainer(element) {
  let parent = element?.parentElement;

  while (parent) {
    const { overflowY } = getComputedStyle(parent);

    if (['auto', 'scroll'].includes(overflowY)) return parent;

    parent = parent.parentElement;
  }

  return document.scrollingElement;
}

function isScrollReachedBottom() {
  const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;

  return scrollTop + clientHeight + SAFE_DISTANCE >= scrollHeight;
}

function updateHasScroll() {
  const container = scrollContainer.value;

  hasScroll.value =
    !!container && container.scrollHeight > container.clientHeight;
}

/** Loads more pages while the list is shorter than the scroll container. */
async function fillViewportIfNeeded() {
  if (isCheckingScroll.value) return;

  isCheckingScroll.value = true;

  try {
    await nextTick();

    updateHasScroll();

    if (!scrollContainer.value) return;

    if (!changeHistoryStore.hasMoreToLoad) return;

    if (!hasScroll.value) changeHistoryStore.loadChangeHistory();
  } finally {
    isCheckingScroll.value = false;
  }
}

function handleScroll() {
  if (!changeHistoryStore.hasMoreToLoad) return;

  if (isScrollReachedBottom()) changeHistoryStore.loadChangeHistory();
}

watch(
  () => changeHistoryStore.changes.length,
  () => {
    fillViewportIfNeeded();
  },
);

watch(
  () => changeHistoryStore.filters,
  () => {
    changeHistoryStore.reset();
  },
  { deep: true },
);

onMounted(() => {
  scrollContainer.value = findScrollContainer(root.value);
  scrollContainer.value?.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', updateHasScroll);

  fillViewportIfNeeded();
});

onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', updateHasScroll);
  changeHistoryStore.clear();
});
</script>

<style lang="scss" scoped>
.settings-change-history {
  padding: $unnnic-space-4;

  display: flex;
  flex-direction: column;

  overflow-x: clip;
}
</style>
