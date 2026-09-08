import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import ProjectDescriptionChanges from '@/utils/ProjectDescriptionChanges';
import { useProjectStore } from '@/store/project';

vi.mock('@/api/projects', () => ({
  default: {
    getProject: vi.fn(),
    list: vi.fn(),
    v2List: vi.fn(),
    changeReadyMadeProjectProperties: vi.fn(),
    editProject: vi.fn(),
    deleteProject: vi.fn(),
    listChannels: vi.fn(),
    createProjectAuthorization: vi.fn(),
    deleteProjectAuthorization: vi.fn(),
    apiFlowsGetSuccessOrg: vi.fn(),
    latestActivities: vi.fn(),
  },
}));

const currentProject = {
  uuid: 'current-uuid',
  name: 'Current',
  description: 'current description',
};

const listedProject = {
  uuid: 'listed-uuid',
  name: 'Listed',
  description: 'listed description',
};

describe('ProjectDescriptionChanges', () => {
  let projectStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    projectStore = useProjectStore();
    window.localStorage.removeItem('project-descriptions');
  });

  describe('project', () => {
    it('returns currentProject when uuids match', () => {
      projectStore.currentProject = currentProject;

      expect(
        ProjectDescriptionChanges.project({ projectUuid: 'current-uuid' }),
      ).toEqual(currentProject);
    });

    it('finds the project in the org-grouped projects list', () => {
      projectStore.currentProject = currentProject;
      projectStore.projects = [{ orgUuid: 'org-1', data: [listedProject] }];

      expect(
        ProjectDescriptionChanges.project({ projectUuid: 'listed-uuid' }),
      ).toEqual(listedProject);
    });

    it('returns undefined when projects is missing instead of throwing', () => {
      projectStore.currentProject = currentProject;
      projectStore.projects = undefined;

      expect(
        ProjectDescriptionChanges.project({ projectUuid: 'listed-uuid' }),
      ).toBeUndefined();
    });
  });

  describe('isChanged', () => {
    it('does not throw when projects is undefined', () => {
      projectStore.currentProject = currentProject;
      projectStore.projects = undefined;

      expect(() =>
        ProjectDescriptionChanges.isChanged({ projectUuid: 'listed-uuid' }),
      ).not.toThrow();
    });

    it('returns true and applies the stored description when it differs', () => {
      projectStore.currentProject = {
        ...currentProject,
        description: 'old description',
      };
      ProjectDescriptionChanges.register({
        projectUuid: 'current-uuid',
        description: 'new description',
      });

      expect(
        ProjectDescriptionChanges.isChanged({ projectUuid: 'current-uuid' }),
      ).toBe(true);
      expect(projectStore.currentProject.description).toBe('new description');
    });
  });
});
