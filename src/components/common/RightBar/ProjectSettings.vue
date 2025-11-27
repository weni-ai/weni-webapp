<template>
  <section class="weni-update-project-container">
    <section class="weni-update-project">
      <h5 class="weni-update-project__title">
        {{ $t('projects.project_settings.title') }}
      </h5>
      <UnnnicInput
        v-model="name"
        :label="$t('orgs.create.project_name')"
      />
      <section>
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
      </section>

      <UnnnicFormElement :label="$t('settings.project.language')">
        <UnnnicSelectSmart
          :modelValue="selectedLanguageValue"
          :options="languageOptions"
          autocomplete
          autocompleteClearOnFocus
          @update:model-value="language = $event[0].value"
        />
      </UnnnicFormElement>

      <section
        v-if="isEnableToExtendedMode"
        class="weni-update-project__extended-mode"
      >
        <section class="weni-update-project__extended-mode__description">
          <h5 class="weni-update-project__title">
            {{ $t('projects.project_settings.extended_mode.title') }}
          </h5>
          <p>{{ $t('projects.project_settings.extended_mode.description') }}</p>
          <p>
            <UnnnicIcon
              icon="account_tree"
              size="sm"
              scheme="weni-600"
            />
            {{
              $t('projects.project_settings.extended_mode.conversations_flows')
            }}
          </p>
          <p>
            <UnnnicIcon
              icon="monitoring"
              size="sm"
              scheme="weni-600"
            />
            {{
              $t(
                'projects.project_settings.extended_mode.customized_dashboards',
              )
            }}
          </p>
          <p>
            <UnnnicIcon
              icon="browse"
              size="sm"
              scheme="weni-600"
            />
            {{
              $t('projects.project_settings.extended_mode.integrate_channels')
            }}
          </p>
        </section>

        <UnnnicButton
          class="weni-update-project__button"
          type="secondary"
          :loading="loading"
          @click="showExtendedModeModal = true"
        >
          {{ $t('projects.project_settings.extended_mode.button') }}
        </UnnnicButton>
      </section>
    </section>

    <section>
      <UnnnicButton
        :disabled="isSaveButtonDisabled"
        class="weni-update-project__button"
        type="primary"
        :loading="loading"
        @click="handleSave"
      >
        {{ $t('orgs.save') }}
      </UnnnicButton>
    </section>
    <UnnnicModalDialog
      v-model="showExtendedModeModal"
      class="modal-extended-mode"
      type="attention"
      size="sm"
      :showCloseIcon="true"
      :title="$t('projects.project_settings.extended_mode.modal.title')"
      showActionsDivider
      :secondaryButtonProps="{
        text: $t('common.cancel'),
        'data-test': 'cancel-button',
      }"
      :primaryButtonProps="{
        text: $t('common.upgrade'),
        'data-test': 'confirm-button',
        loading: isBtnModalLoading,
      }"
      @secondary-button-click="showExtendedModeModal = false"
      @primary-button-click="upgradedProject"
    >
      {{ $t('projects.project_settings.extended_mode.modal.description') }}
    </UnnnicModalDialog>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useFeatureFlagsStore } from '@/store/featureFlags';
import { useProjectSettings } from '@/composables/useProjectSettings';
import ProjectDescriptionTextarea from '@/views/projects/form/DescriptionTextarea.vue';
import apiProjects from '@/api/projects';
import { PROJECT_COMMERCE } from '@/utils/constants';
import Unnnic from '@weni/unnnic-system';
import {
  ORG_ROLE_MODERATOR,
  ORG_ROLE_ADMIN,
} from '@/components/orgs/orgListItem.vue';

const props = defineProps({
  projectUuid: {
    type: String,
    default: '',
  },
  projectName: {
    type: String,
    default: '',
  },
  projectDescription: {
    type: String,
    default: '',
  },
  projectTimezone: {
    type: String,
    default: '',
  },
  projectLanguage: {
    type: String,
    default: '',
  },
  authorizations: {
    type: Array,
    default: () => [],
  },
  pendingAuthorizations: {
    type: Array,
    default: () => [],
  },
  hasChat: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['updated-project']);

const store = useStore();
const { t } = useI18n();

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
  isSaveDisabled,
  saveProject,
} = useProjectSettings();

// Extended mode state
const showExtendedModeModal = ref(false);
const isBtnModalLoading = ref(false);
const isUserEnabledExtendedMode = ref(false);

// Computed values for select components
const selectedTimezoneValue = computed(() =>
  selectedTimezone.value ? [selectedTimezone.value] : [],
);

const selectedLanguageValue = computed(() =>
  selectedLanguage.value ? [selectedLanguage.value] : [],
);

// Create a project-like object from props for the composable functions
const projectFromProps = computed(() => ({
  name: props.projectName,
  description: props.projectDescription,
  timezone: props.projectTimezone,
  language: props.projectLanguage,
}));

// Check if form has changes compared to props
const isSaveButtonDisabled = computed(() =>
  isSaveDisabled(projectFromProps.value),
);

// Extended mode logic
const isEnableToExtendedMode = computed(() => {
  const org = store.getters?.currentOrg;
  const projects = store.state.Project?.projects;

  const project = projects
    ?.flatMap((org) => org.data)
    ?.find((project) => project.uuid === props.projectUuid);

  const isUserAdminOrModerator = [ORG_ROLE_MODERATOR, ORG_ROLE_ADMIN].includes(
    org?.authorization?.role,
  );

  const isCommerceProject = project?.project_mode === PROJECT_COMMERCE;

  return (
    isUserAdminOrModerator &&
    isCommerceProject &&
    isUserEnabledExtendedMode.value
  );
});

// Initialize form values from props
function initializeFromProps() {
  initializeFromProject(projectFromProps.value);
}

async function handleSave() {
  await saveProject({
    projectUuid: props.projectUuid,
    onSuccess: (data) => {
      emit('updated-project', data);
    },
  });
}

async function upgradedProject() {
  try {
    isBtnModalLoading.value = true;

    await apiProjects.updateModeProject({
      projectUuid: props.projectUuid,
      projectMode: 'general',
    });

    Unnnic.unnnicCallAlert({
      props: {
        text: t('projects.project_settings.extended_mode.modal.success'),
        icon: 'check_circle',
        scheme: 'feedback-green',
      },
      seconds: 5,
    });
  } catch (error) {
    Unnnic.unnnicCallAlert({
      props: {
        text: t('projects.project_settings.extended_mode.modal.error'),
        type: 'error',
      },
    });
    console.error('upgradeProjectError', error);
  } finally {
    isBtnModalLoading.value = false;
    showExtendedModeModal.value = false;
  }
}

// Watch for prop changes when navigating between projects or when parent updates props
watch(
  projectFromProps,
  () => {
    initializeFromProps();
  },
  { deep: true },
);

onMounted(() => {
  const featureFlagsStore = useFeatureFlagsStore();
  isUserEnabledExtendedMode.value = featureFlagsStore.flags.newConnectPlataform;
  initializeFromProps();
});
</script>

<style lang="scss" scoped>
.weni-update-project-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.weni-update-project {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: $unnnic-spacing-sm;

  &__title {
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    margin: 0;
  }

  p {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-xs;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    margin: 0;
  }

  &__button {
    width: 100%;
  }

  &__extended-mode {
    display: flex;
    padding: $unnnic-spacing-sm;
    flex-direction: column;
    align-items: flex-start;
    gap: $unnnic-spacing-sm;
    align-self: stretch;

    border-radius: $unnnic-spacing-nano;
    border: 1px solid $unnnic-color-neutral-soft;

    &__description {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $unnnic-spacing-ant;
      align-self: stretch;
    }
  }
}
</style>
