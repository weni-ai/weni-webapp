import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import moment from 'moment-timezone';
import countries from '@/assets/countries';
import projects from '@/api/projects';
import ProjectDescriptionChanges from '@/utils/ProjectDescriptionChanges';
import { unnnicToastManager } from '@weni/unnnic-system';
import { useOrgStore } from '@/store/org';

export const DEFAULT_LANGUAGE = 'en-us';

export const AVAILABLE_LANGUAGES = [
  { value: 'en-us', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt-br', label: 'Português (Brasil)' },
];

let currenciesPromise = null;

function fetchCurrencies() {
  if (!currenciesPromise) {
    currenciesPromise = projects
      .getCurrencies()
      .then(({ data }) =>
        (data.currencies || []).map((code) => ({ value: code, label: code })),
      )
      .catch((error) => {
        currenciesPromise = null;
        throw error;
      });
  }

  return currenciesPromise;
}

export function resetCurrencyOptionsCache() {
  currenciesPromise = null;
}

export function useProjectSettings() {
  const store = useStore();
  const orgStore = useOrgStore();
  const { t } = useI18n();

  const loading = ref(false);
  const name = ref('');
  const description = ref('');
  const timezone = ref('');
  const language = ref(DEFAULT_LANGUAGE);
  const currency = ref('');
  const currencyOptions = ref([]);

  const currentProject = computed(() => store.getters.currentProject);
  const currentOrg = computed(() => orgStore.currentOrg);

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

  const selectedCurrency = computed(() =>
    currencyOptions.value.find(({ value }) => value === currency.value),
  );

  function loadCurrencyOptions() {
    fetchCurrencies()
      .then((options) => {
        currencyOptions.value = options;
      })
      .catch(() => {
        currencyOptions.value = [];
        unnnicToastManager.error(t('settings.workspace.currency_load_error'));
      });
  }

  loadCurrencyOptions();

  function initializeFromProject(project) {
    if (project) {
      name.value = project.name || '';
      description.value = project.description || '';
      timezone.value = project.timezone || '';
      language.value = project.language || DEFAULT_LANGUAGE;
      currency.value = project.currency || '';
    }
  }

  function hasChanges(originalProject) {
    if (!originalProject) return false;

    const originalLanguage = originalProject.language || DEFAULT_LANGUAGE;

    return (
      name.value !== (originalProject.name || '') ||
      description.value !== (originalProject.description || '') ||
      timezone.value !== (originalProject.timezone || '') ||
      language.value !== originalLanguage ||
      currency.value !== (originalProject.currency || '')
    );
  }

  function isSaveDisabled(originalProject) {
    if (!name.value || !description.value) return true;
    return !hasChanges(originalProject);
  }

  async function saveProject({ projectUuid, onSuccess }) {
    try {
      loading.value = true;

      const languageToSave = language.value || DEFAULT_LANGUAGE;

      const response = await store.dispatch('editProject', {
        organization: currentOrg.value.uuid,
        projectUuid,
        name: name.value,
        description: description.value,
        timezone: timezone.value,
        language: languageToSave,
        currency: currency.value || null,
      });

      name.value = response.data.name;
      description.value = response.data.description || '';
      timezone.value = response.data.timezone || '';
      language.value = response.data.language || DEFAULT_LANGUAGE;
      currency.value = response.data.currency || '';

      ProjectDescriptionChanges.register({
        projectUuid,
        description: response.data?.description || '',
      });

      unnnicToastManager.success(t('settings.workspace.save_success'));

      if (onSuccess) {
        onSuccess({
          name: response.data.name,
          description: response.data.description || '',
          timezone: response.data.timezone || '',
          language: response.data.language || DEFAULT_LANGUAGE,
          currency: response.data.currency || '',
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail || t('settings.workspace.save_error');

      unnnicToastManager.error(errorMessage);
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
    currency,
    currentProject,
    currentOrg,
    timezones,
    timezoneOptions,
    selectedTimezone,
    languageOptions,
    selectedLanguage,
    currencyOptions,
    selectedCurrency,
    initializeFromProject,
    hasChanges,
    isSaveDisabled,
    saveProject,
  };
}
