<template>
  <UnnnicTable
    class="change-history-table"
    version="2"
  >
    <UnnnicTableHeader>
      <UnnnicTableRow>
        <UnnnicTableHead
          v-for="column in columns"
          :key="`change-history-table-head-${column.id}`"
          :width="column.width"
          :data-testid="`change-history-table-head-${column.id}`"
        >
          {{ $t(`settings.change_history.table.${column.id}`) }}
        </UnnnicTableHead>
      </UnnnicTableRow>
    </UnnnicTableHeader>

    <UnnnicTableBody>
      <UnnnicTableRow
        v-for="change in changeHistoryStore.changes"
        :key="change.uuid"
        @click="openDrawer(change)"
      >
        <UnnnicTableCell ellipsis>
          <div class="change-history-table__change">
            <UnnnicIcon
              class="change-history-table__icon"
              :icon="entityIcon(change.entity)"
              size="avatar-nano"
              scheme="fg-emphasized"
            />
            <p class="change-history-table__description">
              {{ changeDescription(change) }}
            </p>
          </div>
        </UnnnicTableCell>
        <UnnnicTableCell
          class="change-history-table__author"
          ellipsis
        >
          {{ change.user_email }}
        </UnnnicTableCell>
        <UnnnicTableCell
          class="change-history-table__date"
          ellipsis
        >
          {{ formatDate(change.occurred_at) }}
        </UnnnicTableCell>
      </UnnnicTableRow>
    </UnnnicTableBody>
  </UnnnicTable>

  <section
    v-if="changeHistoryStore.isFirstLoading || changeHistoryStore.isLoadingMore"
    class="change-history-table__loading"
    data-testid="change-history-table-loading"
  >
    <UnnnicSkeletonLoading
      v-for="index in skeletonRows"
      :key="`loading-${index}`"
      height="60px"
      width="100%"
    />
  </section>

  <ChangeHistoryDrawer
    :open="drawerOpen"
    :change="selectedChange"
    @update:open="handleDrawerOpenChange"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChangeHistoryDrawer from '@/components/settings/ChangeHistoryDrawer.vue';
import { useChangeHistoryStore } from '@/store/changeHistory.js';
import { formatDate as formatDateUtil } from '@/utils/formatDate.js';

const INITIAL_SKELETON_ROWS = 8;
const NEXT_PAGE_SKELETON_ROWS = 4;

const changeHistoryStore = useChangeHistoryStore();
const { t, te, locale } = useI18n();

const drawerOpen = ref(false);
const selectedChange = ref(null);

const skeletonRows = computed(() =>
  changeHistoryStore.isFirstLoading
    ? INITIAL_SKELETON_ROWS
    : NEXT_PAGE_SKELETON_ROWS,
);

const columns = [
  { id: 'change', width: '50%' },
  { id: 'author', width: '25%' },
  { id: 'date', width: '25%' },
];

const ENTITY_ICONS = {
  AGENT: 'workspaces',
  USER: 'person',
  FLOW: 'account_tree',
  CHANNEL: 'stacks',
  TRIGGER: 'bolt',
  CAMPAIGN: 'flag',
  QUEUE: 'headphones',
  SECTOR: 'headphones',
  HOLIDAY: 'event',
  WORKING_HOURS: 'schedule',
  CONTENT_BASE: 'database',
  CONTENT_BASE_AGENT: 'workspaces',
  CONTENT_BASE_FILE: 'article',
  CONTENT_BASE_INSTRUCTION: 'format_list_bulleted',
  CONTENT_BASE_LINK: 'article',
  CONTENT_BASE_TEXT: 'article',
  INTELLIGENCE: 'neurology',
  LLM: 'psychology',
  PROJECT: 'folder',
};

function formatDate(date) {
  return formatDateUtil(date, { locale: locale.value });
}

function entityIcon(entity) {
  return ENTITY_ICONS[entity] || 'history';
}

function translateOrRaw(key, fallback) {
  return te(key) ? t(key) : fallback;
}

function changeDescription({ action, entity, object_name: name } = {}) {
  if (!action || !entity) return '';

  const key = `settings.change_history.change_description.${action}_${entity}`;

  if (te(key)) {
    return t(key, { name: name || '–' });
  }

  return t('settings.change_history.change_description.default', {
    action: translateOrRaw(`settings.change_history.actions.${action}`, action),
    entity: translateOrRaw(
      `settings.change_history.entities.${entity}`,
      entity,
    ),
    name: name || '–',
  });
}

function openDrawer(change) {
  selectedChange.value = change;
  drawerOpen.value = true;
}

function handleDrawerOpenChange(isOpen) {
  drawerOpen.value = isOpen;

  if (!isOpen) {
    selectedChange.value = null;
  }
}
</script>

<style lang="scss" scoped>
.change-history-table {
  &__loading {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-05;
  }

  &__change {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    min-width: 0;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__description {
    margin: $unnnic-space-1 0;

    flex: 1;
    min-width: 0;

    @include unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

:deep(.change-history-table__author) {
  @include unnnic-font-emphasis;
  color: $unnnic-color-fg-emphasized;
}

:deep(.change-history-table__date) {
  @include unnnic-font-body;
  color: $unnnic-color-fg-base;
}
</style>
