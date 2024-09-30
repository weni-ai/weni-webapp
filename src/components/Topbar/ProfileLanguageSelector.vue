<template>
  <section class="language-selector">
    <h3>{{ $t('language_selector.title') }}</h3>

    <section class="languages">
      <section
        v-for="({ flag, language }, index) in languages"
        :key="index"
        class="language"
        :class="{ 'language--selected': isSelectedLanguage(language) }"
        :data-test="language"
        @click.stop="changeLanguage(language)"
      >
        <img :src="flag" />

        {{ language }}
      </section>
    </section>
  </section>
</template>

<script>
export default { name: 'ProfileLanguageSelector' };
</script>

<script setup>
import { computed, getCurrentInstance } from 'vue';
import i18n from '@/utils/plugins/i18n.js';

import FlagPtBr from '@/assets/flags/pt-br.png';
import FlagEn from '@/assets/flags/en.png';
import FlagEs from '@/assets/flags/es.png';

const instance = getCurrentInstance();

function use(name) {
  const { proxy } = instance;
  const module = proxy[`$${name}`];
  return module;
}

const store = use('store');

const languages = computed(() => [
  {
    language: 'pt-br',
    flag: FlagPtBr,
  },
  {
    language: 'en',
    flag: FlagEn,
  },
  {
    language: 'es',
    flag: FlagEs,
  },
]);

function isSelectedLanguage(language) {
  return i18n.global.locale === language;
}

function changeLanguage(language) {
  store.dispatch('updateAccountLanguage', {
    language,
  });
}
</script>

<style lang="scss">
.language-selector {
  padding-inline: $unnnic-spacing-xs;
  padding-bottom: $unnnic-spacing-nano;

  h3 {
    margin: 0;
    margin-bottom: $unnnic-spacing-nano;

    color: $unnnic-color-neutral-clean;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }
}

.languages {
  display: flex;
  column-gap: $unnnic-spacing-nano;

  .language {
    cursor: pointer;
    user-select: none;

    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    column-gap: $unnnic-spacing-xs;
    padding: $unnnic-spacing-nano - $unnnic-border-width-thinner
      $unnnic-spacing-ant - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-md;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    &:hover {
      border-color: $unnnic-color-weni-600;
    }

    &--selected {
      background-color: $unnnic-color-weni-50;
      border-color: $unnnic-color-weni-600;

      font-weight: $unnnic-font-weight-bold;
    }
  }
}
</style>
