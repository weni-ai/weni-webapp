<template>
  <UnnnicDrawerNext
    :open="open"
    lazyMount
    @update:open="handleOpenChange"
  >
    <UnnnicDrawerContent
      class="change-history-drawer"
      size="extra-large"
      data-testid="change-history-drawer"
    >
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle class="change-history-drawer__title">
          {{ title }}
        </UnnnicDrawerTitle>

        <UnnnicDrawerDescription>
          <dl class="change-history-drawer__metadata">
            <div class="change-history-drawer__metadata-row">
              <dt class="change-history-drawer__metadata-label">
                {{ $t('settings.change_history.drawer.author') }}
              </dt>
              <dd class="change-history-drawer__metadata-value">
                <UnnnicSkeletonLoading
                  v-if="isDetailLoading"
                  v-bind="metadataSkeletonProps"
                />
                <template v-else>
                  {{ detailData?.user_email || '–' }}
                </template>
              </dd>
            </div>

            <div class="change-history-drawer__metadata-row">
              <dt class="change-history-drawer__metadata-label">
                {{ $t('settings.change_history.drawer.date') }}
              </dt>
              <dd class="change-history-drawer__metadata-value">
                <UnnnicSkeletonLoading
                  v-if="isDetailLoading"
                  v-bind="metadataSkeletonProps"
                />
                <template v-else>
                  {{ formatDetailDate(detailData?.occurred_at) }}
                </template>
              </dd>
            </div>

            <div class="change-history-drawer__metadata-row">
              <dt class="change-history-drawer__metadata-label">
                {{ $t('settings.change_history.drawer.area') }}
              </dt>
              <dd class="change-history-drawer__metadata-value">
                <UnnnicSkeletonLoading
                  v-if="isDetailLoading"
                  v-bind="metadataSkeletonProps"
                />
                <template v-else>
                  {{ moduleLabel(detailData?.module) }}
                </template>
              </dd>
            </div>

            <div
              v-if="detailData?.user_ip"
              class="change-history-drawer__metadata-row"
            >
              <dt class="change-history-drawer__metadata-label">
                {{ $t('settings.change_history.drawer.source_ip') }}
              </dt>
              <dd class="change-history-drawer__metadata-value">
                {{ detailData.user_ip }}
              </dd>
            </div>
          </dl>
        </UnnnicDrawerDescription>
      </UnnnicDrawerHeader>

      <div class="change-history-drawer__body">
        <ChangeHistoryDetailCards
          :detail="detailData"
          :loading="isDetailLoading"
        />
      </div>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import ChangeHistoryDetailCards from '@/components/settings/ChangeHistoryDetailCards.vue';
import { useChangeHistoryStore } from '@/store/changeHistory.js';
import { formatDate } from '@/utils/formatDate.js';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  change: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:open']);

const changeHistoryStore = useChangeHistoryStore();
const { t, te, locale } = useI18n();
const { isDetailLoading, detailData } = storeToRefs(changeHistoryStore);

const title = computed(() =>
  props.change ? changeDescription(props.change) : '',
);

const metadataSkeletonProps = {
  class: 'change-history-drawer__metadata-skeleton',
  height: '19.6px',
  width: '100%',
};

watch(
  () => [props.open, props.change?.uuid],
  ([isOpen, uuid]) => {
    if (isOpen && uuid) {
      changeHistoryStore.fetchDetail(uuid);
      return;
    }

    if (!isOpen) {
      changeHistoryStore.clearDetail();
    }
  },
);

function formatDetailDate(date) {
  return formatDate(date, {
    locale: locale.value,
    pattern: 'd MMM yyyy, HH:mm:ss',
    withTimezone: true,
  });
}

function translateOrRaw(key, fallback) {
  return te(key) ? t(key) : fallback;
}

function moduleLabel(module) {
  if (!module) return '–';

  return translateOrRaw(`settings.change_history.modules.${module}`, module);
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

function handleOpenChange(isOpen) {
  emit('update:open', isOpen);
}
</script>

<style lang="scss" scoped>
.change-history-drawer {
  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__metadata {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__metadata-row {
    width: 100%;

    display: flex;
    align-items: center;
    gap: $unnnic-space-3;
  }

  &__metadata-label {
    width: 170px;

    @include unnnic-font-body;
    color: $unnnic-color-fg-muted;
  }

  &__metadata-value {
    flex: 1;
    margin: 0;

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__metadata-skeleton {
    display: flex;
  }

  &__body {
    overflow-y: auto;
    padding: $unnnic-space-6;
  }
}
</style>
