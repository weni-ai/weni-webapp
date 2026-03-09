<template>
  <section class="settings-workspace">
    <UnnnicPageHeader
      :title="$t('settings.workspace.title')"
      :description="$t('settings.workspace.description')"
    >
      <template #actions>
        <UnnnicButton
          text="TODO: PROJECT DETAILS"
          type="secondary"
        />
        <UnnnicButton
          :text="$t('save_changes')"
          type="primary"
        />
      </template>

      <template #tabs>
        <UnnnicTabs
          :unmountOnHide="false"
          :defaultValue="tabs[0].value"
        >
          <UnnnicTabsList class="settings-workspace__tabs-list">
            <UnnnicTabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
            >
              {{ tab.label }}
            </UnnnicTabsTrigger>
          </UnnnicTabsList>

          <UnnnicTabsContent :value="tabs[0].value">
            <ProjectPreferences />
          </UnnnicTabsContent>
        </UnnnicTabs>
      </template>
    </UnnnicPageHeader>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';
import ProjectPreferences from './ProjectPreferences.vue';

const tabs = computed(() => {
  const localeTabs = i18n.global.tm('settings.workspace.tabs');
  return Object.entries(localeTabs).map(([key, value]) => ({
    value: key,
    label: value,
  }));
});
</script>

<style lang="scss">
.settings-workspace {
  padding: $unnnic-space-4;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  &__tabs-list {
    margin-bottom: $unnnic-space-4;
  }
}
</style>
