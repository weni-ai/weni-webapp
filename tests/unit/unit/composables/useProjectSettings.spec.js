import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  useProjectSettings,
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
} from '@/composables/useProjectSettings';

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
  }),
}));

// Mock vuex
const mockDispatch = vi.fn();
const mockStore = {
  dispatch: mockDispatch,
  getters: {
    currentProject: {
      uuid: 'project-123',
      name: 'Test Project',
      description: 'Test description',
      timezone: 'America/Sao_Paulo',
      language: 'en-us',
    },
    currentOrg: {
      uuid: 'org-123',
      name: 'Test Org',
    },
  },
};

vi.mock('vuex', () => ({
  useStore: () => mockStore,
}));

// Mock unnnicToastManager
vi.mock('@weni/unnnic-system', () => ({
  unnnicToastManager: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    attention: vi.fn(),
  },
}));

// Mock ProjectDescriptionChanges
vi.mock('@/utils/ProjectDescriptionChanges', () => ({
  default: {
    register: vi.fn(),
  },
}));

// Mock moment-timezone
vi.mock('moment-timezone', () => ({
  default: {
    tz: {
      names: () => ['America/Sao_Paulo', 'America/New_York', 'Europe/London'],
    },
  },
}));

// Mock countries
vi.mock('@/assets/countries', () => ({
  default: [
    {
      native: 'Brazil',
      timezones: [
        {
          zoneName: 'America/Sao_Paulo',
          gmtOffset: -10800,
          gmtOffsetName: 'UTC-03:00',
        },
      ],
    },
    {
      native: 'United States',
      timezones: [
        {
          zoneName: 'America/New_York',
          gmtOffset: -18000,
          gmtOffsetName: 'UTC-05:00',
        },
      ],
    },
  ],
}));

describe('useProjectSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AVAILABLE_LANGUAGES', () => {
    it('should export correct language options', () => {
      expect(AVAILABLE_LANGUAGES).toEqual([
        { value: 'en-us', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'pt-br', label: 'Português Brasileiro' },
      ]);
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    it('should export English as default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en-us');
    });
  });

  describe('initial state', () => {
    it('should return initial state with default language', () => {
      const {
        loading,
        name,
        description,
        timezone,
        language,
      } = useProjectSettings();

      expect(loading.value).toBe(false);
      expect(name.value).toBe('');
      expect(description.value).toBe('');
      expect(timezone.value).toBe('');
      expect(language.value).toBe(DEFAULT_LANGUAGE);
    });

    it('should return computed properties', () => {
      const {
        currentProject,
        currentOrg,
        timezoneOptions,
        languageOptions,
      } = useProjectSettings();

      expect(currentProject.value).toBeDefined();
      expect(currentOrg.value).toBeDefined();
      expect(timezoneOptions.value).toBeDefined();
      expect(languageOptions.value).toEqual(AVAILABLE_LANGUAGES);
    });
  });

  describe('initializeFromProject', () => {
    it('should initialize form values from project', () => {
      const { name, description, timezone, language, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'pt-br',
      };

      initializeFromProject(project);

      expect(name.value).toBe('Test Project');
      expect(description.value).toBe('Test description');
      expect(timezone.value).toBe('America/Sao_Paulo');
      expect(language.value).toBe('pt-br');
    });

    it('should handle null project and keep default language', () => {
      const { name, description, timezone, language, initializeFromProject } =
        useProjectSettings();

      initializeFromProject(null);

      // Should keep the default language
      expect(name.value).toBe('');
      expect(description.value).toBe('');
      expect(timezone.value).toBe('');
      expect(language.value).toBe(DEFAULT_LANGUAGE);
    });

    it('should default to English when project has no language set', () => {
      const { name, description, timezone, language, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        // language is undefined
      };

      initializeFromProject(project);

      expect(name.value).toBe('Test Project');
      expect(description.value).toBe('Test description');
      expect(timezone.value).toBe('America/Sao_Paulo');
      expect(language.value).toBe(DEFAULT_LANGUAGE);
    });

    it('should default to English when project language is empty string', () => {
      const { language, initializeFromProject } = useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: '',
      };

      initializeFromProject(project);

      expect(language.value).toBe(DEFAULT_LANGUAGE);
    });
  });

  describe('hasChanges', () => {
    it('should return false when no changes', () => {
      const { name, description, timezone, language, hasChanges, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);

      expect(hasChanges(project)).toBe(false);
    });

    it('should return true when name changed', () => {
      const { name, description, timezone, language, hasChanges, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);
      name.value = 'Changed Name';

      expect(hasChanges(project)).toBe(true);
    });

    it('should return true when language changed', () => {
      const { name, description, timezone, language, hasChanges, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);
      language.value = 'pt-br';

      expect(hasChanges(project)).toBe(true);
    });

    it('should return false when original project is null', () => {
      const { hasChanges } = useProjectSettings();
      expect(hasChanges(null)).toBe(false);
    });

    it('should return false when comparing default language with project missing language', () => {
      const { language, hasChanges, initializeFromProject } = useProjectSettings();

      // Project without language should default to 'en-us'
      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        // language is undefined
      };

      initializeFromProject(project);

      // language.value should be 'en-us' (DEFAULT_LANGUAGE)
      // Comparing with original project (no language) should use DEFAULT_LANGUAGE
      expect(hasChanges(project)).toBe(false);
    });

    it('should detect change when language differs from default', () => {
      const { language, hasChanges, initializeFromProject } = useProjectSettings();

      // Project without language
      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        // language is undefined, defaults to 'en-us'
      };

      initializeFromProject(project);
      language.value = 'pt-br';

      expect(hasChanges(project)).toBe(true);
    });
  });

  describe('isSaveDisabled', () => {
    it('should return true when name is empty', () => {
      const { name, description, isSaveDisabled, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);
      name.value = '';

      expect(isSaveDisabled(project)).toBe(true);
    });

    it('should return true when description is empty', () => {
      const { description, isSaveDisabled, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);
      description.value = '';

      expect(isSaveDisabled(project)).toBe(true);
    });

    it('should return true when no changes', () => {
      const { isSaveDisabled, initializeFromProject } = useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);

      expect(isSaveDisabled(project)).toBe(true);
    });

    it('should return false when there are changes', () => {
      const { name, isSaveDisabled, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);
      name.value = 'Changed Name';

      expect(isSaveDisabled(project)).toBe(false);
    });
  });

  describe('saveProject', () => {
    it('should dispatch editProject action with correct params', async () => {
      const { name, description, timezone, language, saveProject, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);
      name.value = 'Updated Project';

      mockDispatch.mockResolvedValue({
        data: {
          name: 'Updated Project',
          description: 'Test description',
          timezone: 'America/Sao_Paulo',
          language: 'en-us',
        },
      });

      await saveProject({
        projectUuid: 'project-123',
        onSuccess: vi.fn(),
      });

      expect(mockDispatch).toHaveBeenCalledWith('editProject', {
        organization: 'org-123',
        projectUuid: 'project-123',
        name: 'Updated Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      });
    });

    it('should send English as default language when project has no language set', async () => {
      const { name, description, timezone, language, saveProject, initializeFromProject } =
        useProjectSettings();

      // Initialize with a project that has no language
      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        // language is not set
      };

      initializeFromProject(project);
      name.value = 'Updated Project';

      // Manually clear the language to simulate edge case
      language.value = '';

      mockDispatch.mockResolvedValue({
        data: {
          name: 'Updated Project',
          description: 'Test description',
          timezone: 'America/Sao_Paulo',
          language: 'en-us',
        },
      });

      await saveProject({
        projectUuid: 'project-123',
        onSuccess: vi.fn(),
      });

      // Should send 'en-us' (DEFAULT_LANGUAGE) even when language.value is empty
      expect(mockDispatch).toHaveBeenCalledWith('editProject', {
        organization: 'org-123',
        projectUuid: 'project-123',
        name: 'Updated Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: DEFAULT_LANGUAGE,
      });
    });

    it('should sync form values from server response', async () => {
      const { name, description, timezone, language, saveProject, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);

      mockDispatch.mockResolvedValue({
        data: {
          name: 'Server Updated Name',
          description: 'Server Updated Description',
          timezone: 'America/New_York',
          language: 'pt-br',
        },
      });

      await saveProject({
        projectUuid: 'project-123',
        onSuccess: vi.fn(),
      });

      expect(name.value).toBe('Server Updated Name');
      expect(description.value).toBe('Server Updated Description');
      expect(timezone.value).toBe('America/New_York');
      expect(language.value).toBe('pt-br');
    });

    it('should call onSuccess callback with server response data', async () => {
      const { saveProject, initializeFromProject } = useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);

      const responseData = {
        name: 'Updated Project',
        description: 'Updated description',
        timezone: 'America/Sao_Paulo',
        language: 'pt-br',
      };

      mockDispatch.mockResolvedValue({ data: responseData });

      const onSuccess = vi.fn();

      await saveProject({
        projectUuid: 'project-123',
        onSuccess,
      });

      expect(onSuccess).toHaveBeenCalledWith({
        name: responseData.name,
        description: responseData.description,
        timezone: responseData.timezone,
        language: responseData.language,
      });
    });

    it('should set loading state during save', async () => {
      const { loading, saveProject, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);

      let loadingDuringSave = false;

      mockDispatch.mockImplementation(() => {
        loadingDuringSave = loading.value;
        return Promise.resolve({
          data: project,
        });
      });

      await saveProject({
        projectUuid: 'project-123',
        onSuccess: vi.fn(),
      });

      expect(loadingDuringSave).toBe(true);
      expect(loading.value).toBe(false);
    });
  });

  describe('selectedTimezone', () => {
    it('should return matching timezone option', () => {
      const { timezone, selectedTimezone, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'en-us',
      };

      initializeFromProject(project);

      expect(selectedTimezone.value).toBeDefined();
      expect(selectedTimezone.value?.value).toBe('America/Sao_Paulo');
    });
  });

  describe('selectedLanguage', () => {
    it('should return matching language option', () => {
      const { language, selectedLanguage, initializeFromProject } =
        useProjectSettings();

      const project = {
        name: 'Test Project',
        description: 'Test description',
        timezone: 'America/Sao_Paulo',
        language: 'pt-br',
      };

      initializeFromProject(project);

      expect(selectedLanguage.value).toBeDefined();
      expect(selectedLanguage.value?.value).toBe('pt-br');
      expect(selectedLanguage.value?.label).toBe('Português Brasileiro');
    });

    it('should return undefined for unknown language', () => {
      const { language, selectedLanguage } = useProjectSettings();

      language.value = 'unknown';

      expect(selectedLanguage.value).toBeUndefined();
    });
  });
});

