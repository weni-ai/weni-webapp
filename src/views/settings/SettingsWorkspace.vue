<template>
  <section class="settings-workspace">
    <UnnnicPageHeader
      :title="$t('settings.workspace.title')"
      :description="$t('settings.workspace.description')"
    >
      <template #actions>
        <UnnnicButton
          :text="$t('settings.workspace.project_details')"
          type="secondary"
          @click="showProjectDetails = true"
        />
        <UnnnicButton
          :text="$t('save_changes')"
          type="primary"
          :disabled="!canSave"
          :loading="isSaving"
          @click="saveAll"
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
            <ProjectPreferences ref="projectPreferencesRef" />
          </UnnnicTabsContent>

          <UnnnicTabsContent :value="tabs[1].value">
            <AgentBuilderCredentials
              :saveTrigger="saveTrigger"
              @update:is-save-available="credentialsSaveAvailable = $event"
              @saved="onCredentialsSaved"
            />
          </UnnnicTabsContent>

          <UnnnicTabsContent :value="tabs[2].value">
            <AgentBuilderChangesHistory />
          </UnnnicTabsContent>
        </UnnnicTabs>
      </template>
    </UnnnicPageHeader>

    <AgentBuilderProjectDetails v-model="showProjectDetails" />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { safeAsyncComponent } from '@/utils/moduleFederation';
import ProjectPreferences from './ProjectPreferences.vue';

const { tm } = useI18n();

const AgentBuilderCredentials = safeAsyncComponent(
  () => import('agent_builder/WorkspaceCredentials'),
);

const AgentBuilderChangesHistory = safeAsyncComponent(
  () => import('agent_builder/WorkspaceChangesHistory'),
);

const AgentBuilderProjectDetails = safeAsyncComponent(
  () => import('agent_builder/WorkspaceProjectDetails'),
);

const projectPreferencesRef = ref(null);
const showProjectDetails = ref(false);
const saveTrigger = ref(0);
const credentialsSaveAvailable = ref(false);

const tabs = computed(() => {
  const localeTabs = tm('settings.workspace.tabs');
  return Object.entries(localeTabs).map(([key, value]) => ({
    value: key,
    label: value,
  }));
});

const projectPreferencesSaveAvailable = computed(
  () => projectPreferencesRef.value?.isSaveAvailable ?? false,
);

const canSave = computed(() => {
  return (
    credentialsSaveAvailable.value || projectPreferencesSaveAvailable.value
  );
});

const isSaving = computed(() => projectPreferencesRef.value?.loading ?? false);

async function saveAll() {
  if (projectPreferencesSaveAvailable.value) {
    await projectPreferencesRef.value?.save();
  }

  saveTrigger.value++;
}

function onCredentialsSaved({ success }) {
  if (!success) return;
}
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
