<template>
  <section class="language-selector">
    <UnnnicPopoverOption
      :label="$t('language_selector.title')"
      icon="arrow_back"
      data-test="back"
      @click.stop="$emit('back')"
    />

    <UnnnicPopoverOption
      v-for="{ code, label } in languages"
      :key="code"
      :label="label"
      :focused="isSelectedLanguage(code)"
      :data-test="code"
      @click.stop="changeLanguage(code)"
    />
  </section>
</template>

<script>
export default { name: 'ProfileLanguageSelector' };
</script>

<script setup>
import { computed } from 'vue';

import { useAccountStore } from '@/store/account';

defineEmits(['back']);

const accountStore = useAccountStore();

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt-br', label: 'Português (Brasil)' },
  { code: 'es', label: 'Español' },
  { code: 'ro', label: 'Română' },
];

const selectedLanguageCode = computed(() => {
  const language = accountStore.profile?.language;

  if (!language) {
    return null;
  }

  return language === 'en-us' ? 'en' : language;
});

function isSelectedLanguage(code) {
  return selectedLanguageCode.value === code;
}

function changeLanguage(language) {
  accountStore.updateAccountLanguage({
    language,
  });
}
</script>

<style lang="scss" scoped>
.language-selector {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-space-2;
  width: 100%;
}
</style>
