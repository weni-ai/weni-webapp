import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import moment from 'moment-timezone';
import countries from '@/assets/countries';
import { openAlertModal } from '@/utils/openServerErrorAlertModal';
import ProjectDescriptionChanges from '@/utils/ProjectDescriptionChanges';

export const AVAILABLE_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt-br', label: 'Português Brasileiro' },
];

export function useProjectSettings() {
  const store = useStore();
  const { t } = useI18n();

  const loading = ref(false);
  const name = ref('');
  const description = ref('');
  const timezone = ref('');
  const language = ref('');

  const currentProject = computed(() => store.getters.currentProject);
  const currentOrg = computed(() => store.getters.currentOrg);

  const timezones = computed(() => {
    const timezoneNames = moment.tz.names();

    return _.sortBy(
      _.uniqBy(
        countries
          .map((country) => [
            ...country.timezones.map((tz) => ({
              ...tz,
              country: country.native,
            })),
          ])
          .flat()
          .filter((tz) => timezoneNames.includes(tz.zoneName)),
        'zoneName',
      ),
      ['gmtOffset', 'country', 'zoneName'],
    ).map((tz) => ({
      ...tz,
      toString() {
        return `(${tz.gmtOffsetName.replace('UTC', 'UTC ')}) ${tz.country}/${tz.zoneName}`
          .replace(/\//g, ' / ')
          .replace(/_/g, ' ');
      },
    }));
  });

  const timezoneOptions = computed(() =>
    timezones.value.map(({ toString, zoneName }) => ({
      value: zoneName,
      label: toString(),
    })),
  );

  const selectedTimezone = computed(() =>
    timezoneOptions.value.find(({ value }) => value === timezone.value),
  );

  const languageOptions = computed(() => AVAILABLE_LANGUAGES);

  const selectedLanguage = computed(() =>
    languageOptions.value.find(({ value }) => value === language.value),
  );

  function initializeFromProject(project) {
    if (project) {
      name.value = project.name || '';
      description.value = project.description || '';
      timezone.value = project.timezone || '';
      language.value = project.language || '';
    }
  }

  function hasChanges(originalProject) {
    if (!originalProject) return false;

    return (
      name.value !== (originalProject.name || '') ||
      description.value !== (originalProject.description || '') ||
      timezone.value !== (originalProject.timezone || '') ||
      language.value !== (originalProject.language || '')
    );
  }

  function isSaveDisabled(originalProject) {
    if (!name.value || !description.value) return true;
    return !hasChanges(originalProject);
  }

  async function saveProject({ projectUuid, onSuccess }) {
    try {
      loading.value = true;

      const response = await store.dispatch('editProject', {
        organization: currentOrg.value.uuid,
        projectUuid,
        name: name.value,
        description: description.value,
        timezone: timezone.value,
        language: language.value,
      });

      // Sync all fields from server response to ensure local state matches backend
      name.value = response.data.name;
      description.value = response.data.description || '';
      timezone.value = response.data.timezone || '';
      language.value = response.data.language || '';

      ProjectDescriptionChanges.register({
        projectUuid,
        description: response.data?.description || '',
      });

      openAlertModal({
        type: 'success',
        title: t('orgs.save_success'),
        description: t('projects.save_success_text'),
      });

      if (onSuccess) {
        onSuccess({
          name: response.data.name,
          description: response.data.description || '',
          timezone: response.data.timezone || '',
          language: response.data.language || '',
        });
      }
    } catch (error) {
      openAlertModal({
        type: 'warn',
        description: error?.response?.data?.detail || undefined,
      });
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    name,
    description,
    timezone,
    language,
    currentProject,
    currentOrg,
    timezones,
    timezoneOptions,
    selectedTimezone,
    languageOptions,
    selectedLanguage,
    initializeFromProject,
    hasChanges,
    isSaveDisabled,
    saveProject,
  };
}
