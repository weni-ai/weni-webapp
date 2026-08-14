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
      <template v-if="isLoading">
        <UnnnicTableRow
          v-for="index in 5"
          :key="`loading-${index}`"
        >
          <UnnnicTableCell
            v-for="column in columns"
            :key="`loading-${index}-${column.id}`"
          >
            <UnnnicSkeletonLoading
              height="1.25rem"
              width="100%"
            />
          </UnnnicTableCell>
        </UnnnicTableRow>
      </template>

      <template v-else>
        <UnnnicTableRow
          v-for="change in changes"
          :key="change.uuid"
          @click="$emit('row-click', change)"
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
      </template>
    </UnnnicTableBody>
  </UnnnicTable>
</template>

<script setup>
import { format } from 'date-fns';
import { enUS, es, ptBR, ro } from 'date-fns/locale';
import { useI18n } from 'vue-i18n';

defineProps({
  changes: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['row-click']);

const { t, te, locale } = useI18n();

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

const dateLocales = {
  en: enUS,
  es,
  pt_br: ptBR,
  ro,
};

function formatDate(date) {
  return format(new Date(date), 'd MMM yyyy, HH:mm', {
    locale: dateLocales[locale.value] || enUS,
  });
}

function entityIcon(entity) {
  return ENTITY_ICONS[entity] || 'history';
}

function translateOrRaw(key, fallback) {
  return te(key) ? t(key) : fallback;
}

function changeDescription({ action, entity, object_name: name }) {
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
</script>

<style lang="scss" scoped>
.change-history-table {
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
