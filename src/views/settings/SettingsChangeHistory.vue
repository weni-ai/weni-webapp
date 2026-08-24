<template>
  <section class="settings-change-history">
    <UnnnicPageHeader
      :title="$t('settings.change_history.title')"
      :description="$t('settings.change_history.description')"
    >
    </UnnnicPageHeader>
  </section>
</template>

<script setup></script>

<style lang="scss" scoped>
.settings-change-history {
  padding: $unnnic-space-4;

  display: flex;
  flex-direction: column;
}
</style>
