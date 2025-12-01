import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import ProjectPreferences from '@/views/settings/ProjectPreferences.vue';
import { project, org } from '../../../__mocks__';

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('@/utils/ProjectDescriptionChanges', () => ({
  default: {
    register: vi.fn(),
  },
}));

describe('ProjectPreferences.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;
  let mutations;

  const mockProject = {
    ...project,
    uuid: 'project-123',
    name: 'Test Project',
    description: 'Test description',
    timezone: 'America/Sao_Paulo',
    language: 'en-us',
  };

  beforeEach(() => {
    actions = {
      editProject: vi.fn().mockResolvedValue({
        data: {
          name: 'Updated Project',
          description: 'Updated description',
          timezone: 'America/New_York',
          language: 'pt-br',
        },
      }),
    };

    mutations = {
      setCurrentProject: vi.fn(),
    };

    getters = {
      currentProject: () => mockProject,
      currentOrg: () => ({
        ...org,
        uuid: 'org-123',
      }),
    };

    store = createStore({
      actions,
      mutations,
      getters,
    });

    wrapper = shallowMount(ProjectPreferences, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicInput: true,
          UnnnicFormElement: true,
          UnnnicSelectSmart: true,
          UnnnicButton: true,
          ProjectDescriptionTextarea: true,
        },
      },
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
    });

    it('should display the correct title', () => {
      expect(wrapper.find('.project-preferences__title').exists()).toBe(true);
    });
  });

  describe('isSaveButtonDisabled', () => {
    it('should be disabled when currentProject is null', async () => {
      const nullProjectStore = createStore({
        actions,
        mutations,
        getters: {
          currentProject: () => null,
          currentOrg: () => ({ uuid: 'org-123' }),
        },
      });

      const nullWrapper = shallowMount(ProjectPreferences, {
        global: {
          plugins: [nullProjectStore],
          stubs: {
            UnnnicInput: true,
            UnnnicFormElement: true,
            UnnnicSelectSmart: true,
            UnnnicButton: true,
            ProjectDescriptionTextarea: true,
          },
        },
      });

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
      const nullProjectStore = createStore({
        actions,
        mutations,
        getters: {
          currentProject: () => null,
          currentOrg: () => ({ uuid: 'org-123' }),
        },
      });

      const nullWrapper = shallowMount(ProjectPreferences, {
        global: {
          plugins: [nullProjectStore],
          stubs: {
            UnnnicInput: true,
            UnnnicFormElement: true,
            UnnnicSelectSmart: true,
            UnnnicButton: true,
            ProjectDescriptionTextarea: true,
          },
        },
      });

      await nullWrapper.vm.handleSave();

      expect(actions.editProject).not.toHaveBeenCalled();
    });

    it('should call editProject action with correct parameters', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();

      await wrapper.vm.handleSave();

      expect(actions.editProject).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          projectUuid: mockProject.uuid,
          name: 'New Project Name',
          description: mockProject.description,
          timezone: mockProject.timezone,
          language: mockProject.language,
        }),
      );
    });

    it('should commit setCurrentProject on success', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();

      await wrapper.vm.handleSave();

      expect(mutations.setCurrentProject).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Updated Project',
          description: 'Updated description',
          timezone: 'America/New_York',
          language: 'pt-br',
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
        label: 'Português Brasileiro',
      });
    });

    it('should correctly select current language', () => {
      expect(wrapper.vm.selectedLanguage).toBeDefined();
      expect(wrapper.vm.selectedLanguage?.value).toBe('en-us');
    });
  });

  describe('watch currentProject', () => {
    it('should reinitialize form when currentProject changes', async () => {
      const newProject = {
        ...mockProject,
        name: 'Different Project',
        language: 'es',
      };

      const newGetters = {
        currentProject: () => newProject,
        currentOrg: () => ({ uuid: 'org-123' }),
      };

      const newStore = createStore({
        actions,
        mutations,
        getters: newGetters,
      });

      const newWrapper = shallowMount(ProjectPreferences, {
        global: {
          plugins: [newStore],
          stubs: {
            UnnnicInput: true,
            UnnnicFormElement: true,
            UnnnicSelectSmart: true,
            UnnnicButton: true,
            ProjectDescriptionTextarea: true,
          },
        },
      });

      expect(newWrapper.vm.name).toBe('Different Project');
      expect(newWrapper.vm.language).toBe('es');
    });
  });
});

