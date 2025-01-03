<template>
  <section class="item-collapse">
    <header
      class="item-collapse__header"
      @click="toggleCollapse"
    >
      <UnnnicIcon
        :icon="icon"
        size="avatar-nano"
        scheme="neutral-cloudy"
      />
      <p class="header__title">{{ title }}</p>
      <UnnnicIcon
        class="header__arrow"
        :class="{ 'header__arrow--active': open }"
        icon="keyboard_arrow_down"
        size="md"
        scheme="neutral-cloudy"
      />
    </header>

    <section
      ref="content"
      class="item-collapse__content"
      :class="{ 'item-collapse__content--active': open }"
    >
      <p class="content__description">
        {{ description }}
      </p>

      <UnnnicButton
        class="content__button"
        type="primary"
        :text="$t('home.improve_your_agent.show_me')"
        @click="$emit('show-me')"
      />
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';

const emit = defineEmits(['update:open', 'show-me']);

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
});

const content = ref(null);

function toggleCollapse() {
  emit('update:open', !props.open);
}

function resetContentHeight() {
  content.value.style.maxHeight = '0';
}

function adjustContentHeight(open) {
  const contentElement = content.value;
  contentElement.style.maxHeight = open
    ? `${contentElement.scrollHeight}px`
    : '0';
}

onMounted(() => {
  resetContentHeight();

  nextTick(() => {
    if (props.open) adjustContentHeight(props.open);
  });
});

watch(
  () => props.open,
  (open) => {
    nextTick(() => {
      adjustContentHeight(open);
    });
  },
);
</script>

<style lang="scss" scoped>
.item-collapse {
  display: flex;
  flex-direction: column;

  &__header {
    display: grid;
    gap: $unnnic-spacing-xs;
    align-items: center;
    grid-template-columns: auto 1fr auto;

    cursor: pointer;

    .header__title {
      margin: 0;

      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-light;
    }

    .header__arrow {
      transition: transform 200ms ease;

      &--active {
        transform: rotate(180deg);
      }
    }
  }

  &__content {
    display: grid;
    gap: $unnnic-spacing-sm;
    overflow: hidden;

    transition: max-height 200ms ease;

    .content__description {
      margin: 0;
      margin-top: $unnnic-spacing-sm;

      color: $unnnic-color-neutral-cleanest;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
  }
}
</style>
