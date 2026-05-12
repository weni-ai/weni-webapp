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
    language: 'en',
    flag: FlagEn,
  },
  {
    language: 'pt-br',
    flag: FlagPtBr,
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
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-space-2;

  h3 {
    margin: 0;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }
}

.languages {
  display: flex;
  column-gap: $unnnic-space-2;

  .language {
    cursor: pointer;
    user-select: none;

    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    white-space: nowrap;
    column-gap: $unnnic-space-1;
    padding: $unnnic-space-2;
    border: $unnnic-border-width-thinner solid $unnnic-color-border-base;
    border-radius: $unnnic-radius-2;
    background-color: $unnnic-color-bg-base;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;

    &:hover {
      border-color: $unnnic-color-border-accent-strong;
    }

    &--selected {
      background-color: $unnnic-color-bg-accent-plain;
      border-color: $unnnic-color-border-accent-strong;
    }
  }
}
</style>
