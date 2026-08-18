import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSharedStore } from '@/store/Shared';
import mutations from '@/store/project/mutations';

vi.mock('@/store', () => ({
  default: {
    state: {
      Project: {
        projects: [{ orgUuid: 'an-org-uuid', data: [] }],
      },
    },
  },
}));

const project = {
  uuid: 'a-project-uuid',
  project_type: 'commerce',
  organization: 'an-org-uuid',
};

describe('project mutations', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('setCurrentProject', () => {
    it('should store the project and mirror it into the shared store', () => {
      const state = { currentProject: null };

      mutations.setCurrentProject(state, project);

      expect(state.currentProject).toBe(project);
      expect(useSharedStore().current.project.uuid).toBe('a-project-uuid');
      expect(useSharedStore().current.project.type).toBe('commerce');
    });

    it('should clear the shared store when the project is unset', () => {
      const state = { currentProject: project };

      mutations.setCurrentProject(state, null);

      expect(state.currentProject).toBeNull();
      expect(useSharedStore().current.project.uuid).toBeUndefined();
    });
  });

  describe('PROJECT_CREATE_SUCCESS', () => {
    it('should mirror the newly created project into the shared store', () => {
      const state = { currentProject: null, loadingCreateProject: true };

      mutations.PROJECT_CREATE_SUCCESS(state, project);

      expect(state.currentProject).toBe(project);
      expect(state.loadingCreateProject).toBe(false);
      expect(useSharedStore().current.project.uuid).toBe('a-project-uuid');
    });
  });
});
