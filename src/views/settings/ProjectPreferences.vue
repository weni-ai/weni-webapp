<template>
  <section class="project-preferences">
    <div class="project-preferences__form">
      <UnnnicInput
        v-model="name"
        :label="$t('orgs.create.project_name')"
      />

      <ProjectDescriptionTextarea v-model="description" />

      <UnnnicFormElement :label="$t('orgs.create.time_zone')">
        <UnnnicSelectSmart
          :modelValue="selectedTimezoneValue"
          :options="timezoneOptions"
          autocomplete
          autocompleteClearOnFocus
          @update:model-value="timezone = $event[0].value"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('settings.workspace.language')">
        <UnnnicSelectSmart
          :modelValue="selectedLanguageValue"
          :options="languageOptions"
          autocomplete
          autocompleteClearOnFocus
          @update:model-value="language = $event[0].value"
        />
      </UnnnicFormElement>
    </div>

    <UnnnicModalDialog
      v-model="showUnsavedChangesModal"
      type="attention"
      :showCloseIcon="true"
      :title="$t('settings.workspace.unsaved_changes.title')"
      showActionsDivider
      :secondaryButtonProps="{
        text: $t('settings.workspace.unsaved_changes.save_and_leave'),
        loading: loading,
      }"
      :primaryButtonProps="{
        text: $t('settings.workspace.unsaved_changes.leave_without_saving'),
      }"
      @secondary-button-click="saveAndLeave"
      @primary-button-click="leaveWithoutSaving"
    >
      {{ $t('settings.workspace.unsaved_changes.description') }}
    </UnnnicModalDialog>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useProjectSettings } from '@/composables/useProjectSettings';
import ProjectDescriptionTextarea from '@/views/projects/form/DescriptionTextarea.vue';

const store = useStore();
const router = useRouter();

const {
  loading,
  name,
  description,
  timezone,
  language,
  timezoneOptions,
  selectedTimezone,
  languageOptions,
  selectedLanguage,
  initializeFromProject,
  hasChanges,
  isSaveDisabled,
  saveProject,
} = useProjectSettings();

const currentProject = computed(() => store.getters.currentProject);

const selectedTimezoneValue = computed(() =>
  selectedTimezone.value ? [selectedTimezone.value] : [],
);

const selectedLanguageValue = computed(() =>
  selectedLanguage.value ? [selectedLanguage.value] : [],
);

const isSaveButtonDisabled = computed(() => {
  if (!currentProject.value) return true;
  return isSaveDisabled(currentProject.value);
});

// Unsaved changes modal state
const showUnsavedChangesModal = ref(false);
let pendingNavigation = null;

// Check if there are unsaved changes
const hasUnsavedChanges = computed(() => {
  if (!currentProject.value) return false;
  return hasChanges(currentProject.value);
});

async function handleSave() {
  if (!currentProject.value?.uuid) return;

  await saveProject({
    projectUuid: currentProject.value.uuid,
    onSuccess: (data) => {
      store.commit('setCurrentProject', {
        ...currentProject.value,
        name: data.name,
        description: data.description,
        timezone: data.timezone,
        language: data.language,
      });
    },
  });
}

// Navigation guard functions
async function saveAndLeave() {
  if (!currentProject.value?.uuid) return;

  await saveProject({
    projectUuid: currentProject.value.uuid,
    onSuccess: (data) => {
      store.commit('setCurrentProject', {
        ...currentProject.value,
        name: data.name,
        description: data.description,
        timezone: data.timezone,
        language: data.language,
      });

      showUnsavedChangesModal.value = false;

      if (pendingNavigation) {
        const navigation = pendingNavigation;
        pendingNavigation = null;
        router.push(navigation);
      }
    },
  });
}

function leaveWithoutSaving() {
  showUnsavedChangesModal.value = false;
  if (pendingNavigation) {
    // Re-initialize form to original values to clear unsaved changes
    if (currentProject.value) {
      initializeFromProject(currentProject.value);
    }
    const navigation = pendingNavigation;
    pendingNavigation = null;
    router.push(navigation);
  }
}

// Vue Router navigation guard
onBeforeRouteLeave((to) => {
  if (hasUnsavedChanges.value) {
    pendingNavigation = to;
    showUnsavedChangesModal.value = true;
    return false;
  }
  return true;
});

const isSaveAvailable = computed(() => !isSaveButtonDisabled.value);

defineExpose({
  isSaveAvailable,
  save: handleSave,
  loading,
});

watch(
  currentProject,
  (project) => {
    if (project) {
      initializeFromProject(project);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (currentProject.value) {
    initializeFromProject(currentProject.value);
  }
});
</script>

<style lang="scss" scoped>
.project-preferences {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
