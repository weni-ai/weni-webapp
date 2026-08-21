import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ProjectPreferences from '@/views/settings/ProjectPreferences.vue';
import { project, org } from '../../../__mocks__';
import { createTestingPinia } from '@pinia/testing';
import { useProjectStore } from '@/store/project';

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('@/utils/ProjectDescriptionChanges', () => ({
  default: {
    register: vi.fn(),
  },
}));

vi.mock('@/api/projects', () => ({
  default: {
    getCurrencies: vi.fn().mockResolvedValue({
      data: { currencies: ['BRL', 'USD', 'EUR'] },
    }),
  },
}));

const mockProject = {
  ...project,
  uuid: 'project-123',
  name: 'Test Project',
  description: 'Test description',
  timezone: 'America/Sao_Paulo',
  language: 'en-us',
  currency: 'BRL',
};

const updatedProjectData = {
  name: 'Updated Project',
  description: 'Updated description',
  timezone: 'America/New_York',
  language: 'pt-br',
  currency: 'USD',
};

const stubs = {
  UnnnicInput: true,
  UnnnicFormElement: true,
  UnnnicSelect: true,
  UnnnicButton: true,
  ProjectDescriptionTextarea: true,
};

const projectPinia = ({ currentProject = mockProject } = {}) =>
  createTestingPinia({
    initialState: {
      Org: {
        currentOrg: {
          ...org,
          uuid: 'org-123',
        },
      },
      Project: {
        currentProject,
      },
    },
  });

const mountPreferences = ({ currentProject = mockProject } = {}) =>
  shallowMount(ProjectPreferences, {
    global: {
      plugins: [projectPinia({ currentProject })],
      stubs,
    },
  });

describe('ProjectPreferences.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mountPreferences();
    useProjectStore().editProject.mockResolvedValue({
      data: updatedProjectData,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should render the component', () => {
      expect(wrapper.find('.project-preferences').exists()).toBe(true);
    });

    it('should initialize form values from currentProject', () => {
      expect(wrapper.vm.name).toBe(mockProject.name);
      expect(wrapper.vm.description).toBe(mockProject.description);
      expect(wrapper.vm.timezone).toBe(mockProject.timezone);
      expect(wrapper.vm.language).toBe(mockProject.language);
      expect(wrapper.vm.currency).toBe(mockProject.currency);
    });
  });

  describe('isSaveButtonDisabled', () => {
    it('should be disabled when currentProject is null', async () => {
      const nullWrapper = mountPreferences({ currentProject: null });

      expect(nullWrapper.vm.isSaveButtonDisabled).toBe(true);
    });

    it('should be disabled when no changes made', () => {
      expect(wrapper.vm.isSaveButtonDisabled).toBe(true);
    });

    it('should be enabled when name is changed', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isSaveButtonDisabled).toBe(false);
    });

    it('should be enabled when language is changed', async () => {
      wrapper.vm.language = 'pt-br';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isSaveButtonDisabled).toBe(false);
    });

    it('should be disabled when name is empty', async () => {
      wrapper.vm.name = '';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isSaveButtonDisabled).toBe(true);
    });

    it('should be disabled when description is empty', async () => {
      wrapper.vm.description = '';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isSaveButtonDisabled).toBe(true);
    });
  });

  describe('handleSave', () => {
    it('should not proceed when currentProject is null', async () => {
      const nullWrapper = mountPreferences({ currentProject: null });

      await nullWrapper.vm.handleSave();

      expect(useProjectStore().editProject).not.toHaveBeenCalled();
    });

    it('should call editProject action with correct parameters', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();

      await wrapper.vm.handleSave();

      expect(useProjectStore().editProject).toHaveBeenCalledWith(
        expect.objectContaining({
          projectUuid: mockProject.uuid,
          name: 'New Project Name',
          description: mockProject.description,
          timezone: mockProject.timezone,
          language: mockProject.language,
          currency: mockProject.currency,
        }),
      );
    });

    it('should commit setCurrentProject on success', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();

      await wrapper.vm.handleSave();

      expect(useProjectStore().setCurrentProjectState).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Project',
          description: 'Updated description',
          timezone: 'America/New_York',
          language: 'pt-br',
          currency: 'USD',
        }),
      );
    });
  });

  describe('language field', () => {
    it('should have language options available', () => {
      expect(wrapper.vm.languageOptions).toBeDefined();
      expect(wrapper.vm.languageOptions.length).toBeGreaterThan(0);
    });

    it('should include all expected language options', () => {
      const options = wrapper.vm.languageOptions;
      expect(options).toContainEqual({ value: 'en-us', label: 'English' });
      expect(options).toContainEqual({ value: 'es', label: 'Español' });
      expect(options).toContainEqual({
        value: 'pt-br',
        label: 'Português (Brasil)',
      });
    });

    it('should correctly select current language', () => {
      expect(wrapper.vm.language).toBeDefined();
      expect(wrapper.vm.language).toBe('en-us');
    });
  });

  describe('currency field', () => {
    it('should initialize currency from currentProject', () => {
      expect(wrapper.vm.currency).toBe('BRL');
      expect(wrapper.vm.currencyOptions).toBeDefined();
    });

    it('should be enabled when currency is changed', async () => {
      wrapper.vm.currency = 'USD';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isSaveButtonDisabled).toBe(false);
    });
  });

  describe('watch currentProject', () => {
    it('should reinitialize form when currentProject changes', async () => {
      const newProject = {
        ...mockProject,
        name: 'Different Project',
        language: 'es',
      };

      const newWrapper = mountPreferences({ currentProject: newProject });

      expect(newWrapper.vm.name).toBe('Different Project');
      expect(newWrapper.vm.language).toBe('es');
    });
  });
});
