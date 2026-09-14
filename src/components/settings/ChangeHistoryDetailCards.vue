<template>
  <article
    class="change-history-detail-cards"
    data-testid="change-history-detail-cards"
  >
    <div
      v-if="loading"
      class="change-history-detail-cards__card change-history-detail-cards__card--loading"
      data-testid="change-history-detail-cards-loading"
    >
      <UnnnicSkeletonLoading
        height="20px"
        width="40%"
      />
      <div class="change-history-detail-cards__loading-lines">
        <UnnnicSkeletonLoading
          v-for="index in LOADING_LINES"
          :key="`detail-loading-${index}`"
          height="20px"
          :width="index === LOADING_LINES || index === 0 ? '45%' : '100%'"
        />
      </div>
    </div>

    <template v-else-if="detail">
      <div
        v-if="isUpdate"
        class="change-history-detail-cards__comparison"
        data-testid="change-history-detail-cards-comparison"
      >
        <section
          class="change-history-detail-cards__card change-history-detail-cards__card--previous"
        >
          <h3 class="change-history-detail-cards__title">
            {{ cardTitle('previous') }}
          </h3>
          <p class="change-history-detail-cards__value">
            {{ previousValue }}
          </p>
        </section>

        <section
          class="change-history-detail-cards__card change-history-detail-cards__card--current"
        >
          <h3 class="change-history-detail-cards__title">
            {{ cardTitle('current') }}
          </h3>
          <p class="change-history-detail-cards__value">
            {{ currentValue }}
          </p>
        </section>
      </div>

      <section
        v-else
        class="change-history-detail-cards__card"
        data-testid="change-history-detail-cards-single"
      >
        <h3 class="change-history-detail-cards__title">
          {{ singleCardTitle }}
        </h3>
        <p class="change-history-detail-cards__value">
          {{ singleCardValue }}
        </p>
      </section>
    </template>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const LOADING_LINES = 14;
const VALUE_KEYS = [
  'text',
  'content',
  'instruction',
  'value',
  'name',
  'object_name',
];

const props = defineProps({
  detail: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const { t, te } = useI18n();

const isUpdate = computed(() => props.detail?.action === 'UPDATE');

const isDelete = computed(() => props.detail?.action === 'DELETE');

const previousValue = computed(() =>
  formatChangeValue(props.detail?.old_value, props.detail?.object_name),
);

const currentValue = computed(() =>
  formatChangeValue(props.detail?.new_value, props.detail?.object_name),
);

const singleCardTitle = computed(() =>
  cardTitle(isDelete.value ? 'removed' : 'new'),
);

const singleCardValue = computed(() => {
  if (isDelete.value) {
    return formatChangeValue(
      props.detail?.old_value,
      props.detail?.object_name,
    );
  }

  return formatChangeValue(props.detail?.new_value, props.detail?.object_name);
});

function cardTitle(variant) {
  const entity = props.detail?.entity;
  if (!entity) return '';

  const key = `settings.change_history.drawer.card_title.${variant}_${entity}`;

  if (te(key)) return t(key);

  const entityKey = `settings.change_history.entities.${entity}`;
  return te(entityKey) ? t(entityKey) : entity;
}

function tryParseJson(value) {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatChangeValue(rawValue, fallbackName) {
  const fallback = fallbackName || '–';
  if (rawValue == null || rawValue === '') return fallback;

  const parsed = tryParseJson(rawValue);

  if (typeof parsed === 'string' || typeof parsed === 'number') {
    return String(parsed);
  }

  if (!parsed || typeof parsed !== 'object') return fallback;

  const preferredKey = VALUE_KEYS.find(
    (key) => parsed[key] != null && parsed[key] !== '',
  );

  if (preferredKey) return String(parsed[preferredKey]);
  if (!Object.keys(parsed).length) return fallback;

  return JSON.stringify(parsed, null, 2);
}
</script>

<style lang="scss" scoped>
.change-history-detail-cards {
  width: 100%;

  &__comparison {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  &__card {
    padding: $unnnic-space-4;
    border: 1px solid $unnnic-color-border-base;
    border-radius: $unnnic-radius-4;
    background-color: $unnnic-color-bg-base;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    width: 100%;

    box-sizing: border-box;

    &--previous {
      flex: 1;

      border-right-width: 0;
      border-radius: $unnnic-radius-4 0 0 $unnnic-radius-4;
    }

    &--current {
      flex: 1;

      border-radius: 0 $unnnic-radius-4 $unnnic-radius-4 0;
    }

    &--loading {
      gap: $unnnic-space-2;
    }
  }

  &__loading-lines {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-05;

    width: 100%;
  }

  &__title {
    margin: 0;

    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__value {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
