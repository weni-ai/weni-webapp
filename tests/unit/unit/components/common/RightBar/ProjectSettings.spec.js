import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import ProjectSettings from '@/components/common/RightBar/ProjectSettings.vue';
import { project, org } from '../../../../__mocks__';

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('@/store/featureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: {
      newConnectPlataform: false,
    },
  }),
}));

vi.mock('@/api/projects', () => ({
  default: {
    updateModeProject: vi.fn(),
  },
}));

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

describe('ProjectSettings.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;

  const defaultProps = {
    projectUuid: project.uuid,
    projectName: project.name,
    projectDescription: project.description || 'Test description',
    projectTimezone: project.timezone,
    projectLanguage: project.language || 'en',
    authorizations: [],
    pendingAuthorizations: [],
    hasChat: false,
  };

  beforeEach(() => {
    actions = {
      editProject: vi.fn().mockResolvedValue({
        data: {
          name: 'Updated Project',
          description: 'Updated description',
          timezone: 'America/Sao_Paulo',
          language: 'pt-br',
        },
      }),
    };

    getters = {
      currentOrg: () => ({
        ...org,
        uuid: org.uuid,
        authorization: { role: 3 },
      }),
    };

    store = createStore({
      actions,
      getters,
      state: {
        Project: {
          projects: [],
        },
      },
    });

    wrapper = shallowMount(ProjectSettings, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicInput: true,
          UnnnicFormElement: true,
          UnnnicSelectSmart: true,
          UnnnicButton: true,
          UnnnicIcon: true,
          UnnnicModalDialog: true,
          ProjectDescriptionTextarea: true,
        },
      },
      props: defaultProps,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize form values from props', () => {
      expect(wrapper.vm.name).toBe(defaultProps.projectName);
      expect(wrapper.vm.description).toBe(defaultProps.projectDescription);
      expect(wrapper.vm.timezone).toBe(defaultProps.projectTimezone);
      expect(wrapper.vm.language).toBe(defaultProps.projectLanguage);
    });

    it('should render the component', () => {
      expect(wrapper.find('.weni-update-project-container').exists()).toBe(
        true,
      );
    });
  });

  describe('isSaveButtonDisabled', () => {
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
  });

  describe('handleSave', () => {
    it('should call saveProject with correct parameters', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();

      await wrapper.vm.handleSave();

      expect(actions.editProject).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          projectUuid: defaultProps.projectUuid,
          name: 'New Project Name',
          description: defaultProps.projectDescription,
          timezone: defaultProps.projectTimezone,
          language: defaultProps.projectLanguage,
        }),
      );
    });

    it('should emit updated-project event on success', async () => {
      wrapper.vm.name = 'New Project Name';
      await wrapper.vm.$nextTick();

      await wrapper.vm.handleSave();

      expect(wrapper.emitted('updated-project')).toBeTruthy();
      expect(wrapper.emitted('updated-project')[0][0]).toEqual({
        name: 'Updated Project',
        description: 'Updated description',
        timezone: 'America/Sao_Paulo',
        language: 'pt-br',
      });
    });
  });

  describe('prop changes', () => {
    it('should reinitialize form when projectFromProps changes', async () => {
      const newProps = {
        ...defaultProps,
        projectName: 'Different Project',
        projectLanguage: 'es',
      };

      await wrapper.setProps(newProps);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.name).toBe('Different Project');
      expect(wrapper.vm.language).toBe('es');
    });
  });

  describe('language field', () => {
    it('should include language in form data', () => {
      expect(wrapper.vm.language).toBeDefined();
      expect(wrapper.vm.languageOptions).toBeDefined();
      expect(wrapper.vm.selectedLanguage).toBeDefined();
    });

    it('should have correct language options', () => {
      const options = wrapper.vm.languageOptions;
      expect(options).toContainEqual({ value: 'en', label: 'English' });
      expect(options).toContainEqual({ value: 'es', label: 'Español' });
      expect(options).toContainEqual({
        value: 'pt-br',
        label: 'Português Brasileiro',
      });
    });
  });
});
