<template>
  <section class="language-selector">
    <button
      type="button"
      class="language-selector__row language-selector__row--header"
      data-test="back"
      @click.stop="$emit('back')"
    >
      <UnnnicIcon
        icon="arrow_back"
        size="sm"
        scheme="inherit"
        class="language-selector__row-icon"
      />

      <span class="language-selector__row-label">
        {{ $t('language_selector.title') }}
      </span>
    </button>

    <button
      v-for="{ code, label } in languages"
      :key="code"
      type="button"
      class="language-selector__row"
      :data-test="code"
      @click.stop="changeLanguage(code)"
    >
      <span class="language-selector__row-label">{{ label }}</span>
    </button>
  </section>
</template>

<script>
export default { name: 'ProfileLanguageSelector' };
</script>

<script setup>
import { getCurrentInstance } from 'vue';

defineEmits(['back']);

const instance = getCurrentInstance();

function use(name) {
  const { proxy } = instance;
  const module = proxy[`$${name}`];
  return module;
}

const store = use('store');

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt-br', label: 'Português (Brasil)' },
  { code: 'es', label: 'Español' },
];

function changeLanguage(language) {
  store.dispatch('updateAccountLanguage', {
    language,
  });
}
</script>

<style lang="scss" scoped>
.language-selector {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-xs;

  &__row {
    cursor: pointer;
    user-select: none;
    text-align: start;

    appearance: none;
    background-color: transparent;
    border: 0;

    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-xs;
    padding: $unnnic-spacing-xs;
    border-radius: $unnnic-border-radius-sm;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

    &:hover {
      background-color: $unnnic-color-neutral-light;
    }

    &-icon {
      font-size: 1.125 * $unnnic-font-size;
    }

    &-label {
      flex: 1;
    }
  }
}
</style>
