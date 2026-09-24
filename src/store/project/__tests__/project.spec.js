import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useProjectStore } from '@/store/project';
import { useSharedStore } from '@/store/Shared';
import projectsApi from '@/api/projects';

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

const sampleProject = {
  uuid: 'a-project-uuid',
  name: 'Acme',
  project_type: 'commerce',
  organization: 'an-org-uuid',
  first_access: true,
  has_wpp_channel: true,
};

describe('useProjectStore', () => {
  let projectStore;
  let sharedStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    projectStore = useProjectStore();
    sharedStore = useSharedStore();
    vi.clearAllMocks();
    window.localStorage.removeItem('project');
  });

  describe('initial state', () => {
    it('exposes the default state', () => {
      expect(projectStore.currentProject).toBeNull();
      expect(projectStore.loadingCreateProject).toBe(false);
      expect(projectStore.errorCreateProject).toBeNull();
      expect(projectStore.templates).toEqual({ status: null, data: [] });
      expect(projectStore.championChatbots).toEqual({});
      expect(projectStore.projects).toEqual([]);
      expect(projectStore.recentActivities).toEqual({});
    });
  });

  describe('setCurrentProjectState', () => {
    it('stores the project and mirrors it into the shared store', () => {
      projectStore.setCurrentProjectState(sampleProject);

      expect(projectStore.currentProject).toEqual(sampleProject);
      expect(sharedStore.current.project.uuid).toBe('a-project-uuid');
      expect(sharedStore.current.project.type).toBe('commerce');
    });

    it('clears the shared store when the project is unset', () => {
      projectStore.setCurrentProjectState(sampleProject);
      projectStore.setCurrentProjectState(null);

      expect(projectStore.currentProject).toBeNull();
      expect(sharedStore.current.project.uuid).toBeUndefined();
    });
  });

  describe('PROJECT_CREATE_*', () => {
    it('PROJECT_CREATE_REQUEST sets loadingCreateProject', () => {
      projectStore.PROJECT_CREATE_REQUEST();
      expect(projectStore.loadingCreateProject).toBe(true);
    });

    it('PROJECT_CREATE_SUCCESS stores the project, appends it to the org list, and mirrors shared', () => {
      projectStore.projects = [{ orgUuid: 'an-org-uuid', data: [] }];
      projectStore.loadingCreateProject = true;

      projectStore.PROJECT_CREATE_SUCCESS(sampleProject);

      expect(projectStore.currentProject).toEqual(sampleProject);
      expect(projectStore.loadingCreateProject).toBe(false);
      expect(projectStore.projects[0].data).toEqual([sampleProject]);
      expect(sharedStore.current.project.uuid).toBe('a-project-uuid');
    });

    it('PROJECT_CREATE_SUCCESS does not append when the org list is missing', () => {
      projectStore.PROJECT_CREATE_SUCCESS(sampleProject);

      expect(projectStore.projects).toEqual([]);
      expect(projectStore.currentProject).toEqual(sampleProject);
    });

    it('PROJECT_CREATE_ERROR stores the error and clears loading', () => {
      projectStore.loadingCreateProject = true;
      projectStore.PROJECT_CREATE_ERROR('failed');

      expect(projectStore.errorCreateProject).toBe('failed');
      expect(projectStore.loadingCreateProject).toBe(false);
    });
  });

  describe('setChampionChatbot and setRecentActivities', () => {
    it('setChampionChatbot stores the chatbot by flowUuid', () => {
      projectStore.setChampionChatbot({ flowUuid: 'flow-1', has_ia: true });

      expect(projectStore.championChatbots['flow-1']).toEqual({
        flowUuid: 'flow-1',
        has_ia: true,
      });
    });

    it('setRecentActivities replaces the recent activities map', () => {
      const next = { 'project-1': { status: 'complete', data: [] } };
      projectStore.setRecentActivities(next);
      expect(projectStore.recentActivities).toEqual(next);
    });
  });

  describe('getCurrentProject', () => {
    it('returns null when localStorage has no project', () => {
      expect(projectStore.getCurrentProject()).toBeNull();
    });

    it('parses the project stored in localStorage', () => {
      window.localStorage.setItem('project', JSON.stringify(sampleProject));
      expect(projectStore.getCurrentProject()).toEqual(sampleProject);
    });
  });

  describe('API wrappers', () => {
    it('getProject, getProjects, editProject, and deleteProject forward to the API', () => {
      projectStore.getProject({ uuid: 'p-1' });
      projectStore.getProjects({
        orgId: 'org-1',
        page: 2,
        limit: 10,
        ordering: 'name',
      });
      projectStore.editProject({
        name: 'N',
        organization: 'org-1',
        projectUuid: 'p-1',
        timezone: 'UTC',
        description: 'D',
        language: 'en-us',
        currency: 'USD',
      });
      projectStore.deleteProject({ uuid: 'p-1' });

      expect(projectsApi.getProject).toHaveBeenCalledWith({ uuid: 'p-1' });
      expect(projectsApi.list).toHaveBeenCalledWith('org-1', 10, 10, 'name');
      expect(projectsApi.editProject).toHaveBeenCalledWith({
        name: 'N',
        organization: 'org-1',
        projectUuid: 'p-1',
        timezone: 'UTC',
        description: 'D',
        language: 'en-us',
        currency: 'USD',
      });
      expect(projectsApi.deleteProject).toHaveBeenCalledWith('p-1');
    });

    it('getProjects defaults page to 1 and limit to 20', () => {
      projectStore.getProjects({ orgId: 'org-1' });
      expect(projectsApi.list).toHaveBeenCalledWith('org-1', 0, 20, undefined);
    });

    it('createOrUpdateProjectAuthorization and removeProjectAuthorization forward to the API', async () => {
      await projectStore.createOrUpdateProjectAuthorization({
        email: 'a@b.com',
        projectUuid: 'p-1',
        role: 3,
        chatRole: 1,
        hasChat: true,
      });
      await projectStore.removeProjectAuthorization({
        email: 'a@b.com',
        projectUuid: 'p-1',
      });

      expect(projectsApi.createProjectAuthorization).toHaveBeenCalledWith({
        email: 'a@b.com',
        projectUuid: 'p-1',
        role: 3,
        chatRole: 1,
        hasChat: true,
      });
      expect(projectsApi.deleteProjectAuthorization).toHaveBeenCalledWith({
        email: 'a@b.com',
        projectUuid: 'p-1',
      });
    });
  });

  describe('loadProjects', () => {
    it('creates an org bucket, loads the first page, and marks complete when next is null', async () => {
      projectsApi.v2List.mockResolvedValue({
        data: {
          next: null,
          results: [{ uuid: 'p-1', name: 'One' }],
        },
      });

      const data = await projectStore.loadProjects({
        orgUuid: 'org-1',
        ordering: 'name',
      });

      expect(projectsApi.v2List).toHaveBeenCalledWith({
        params: {
          organization: 'org-1',
          offset: 0,
          limit: 12,
          ordering: 'name',
        },
      });
      expect(data.results).toHaveLength(1);
      expect(projectStore.projects[0]).toEqual({
        orgUuid: 'org-1',
        status: 'complete',
        next: null,
        data: [{ uuid: 'p-1', name: 'One' }],
      });
    });

    it('skips fetching when the org bucket is already loading or complete', async () => {
      projectStore.projects = [
        { orgUuid: 'org-1', status: 'complete', next: null, data: [] },
      ];

      await projectStore.loadProjects({ orgUuid: 'org-1' });

      expect(projectsApi.v2List).not.toHaveBeenCalled();
    });

    it('uses the next URL search params on subsequent pages', async () => {
      projectStore.projects = [
        {
          orgUuid: 'org-1',
          status: null,
          next: 'https://api.example/projects/?organization=org-1&offset=12&limit=12',
          data: [{ uuid: 'p-1' }],
        },
      ];
      projectsApi.v2List.mockResolvedValue({
        data: {
          next: 'https://api.example/projects/?offset=24',
          results: [{ uuid: 'p-2' }],
        },
      });

      await projectStore.loadProjects({ orgUuid: 'org-1' });

      expect(projectsApi.v2List).toHaveBeenCalledWith({
        params: {
          organization: 'org-1',
          offset: '12',
          limit: '12',
        },
      });
      expect(projectStore.projects[0].status).toBeNull();
      expect(projectStore.projects[0].data).toEqual([
        { uuid: 'p-1' },
        { uuid: 'p-2' },
      ]);
    });
  });

  describe('setCurrentProject action', () => {
    it('merges the provided fields onto the current project and forces redirect_url', () => {
      projectStore.currentProject = { uuid: 'old', extra: 'kept' };

      projectStore.setCurrentProject({
        uuid: 'a-project-uuid',
        name: 'Acme',
        first_access: false,
      });

      expect(projectStore.currentProject.uuid).toBe('a-project-uuid');
      expect(projectStore.currentProject.name).toBe('Acme');
      expect(projectStore.currentProject.extra).toBe('kept');
      expect(projectStore.currentProject.redirect_url).toBe('');
      expect(sharedStore.current.project.uuid).toBe('a-project-uuid');
    });
  });

  describe('changeReadyMadeProjectProperties', () => {
    it('updates first_access from the API response', async () => {
      projectStore.currentProject = { ...sampleProject };
      projectsApi.changeReadyMadeProjectProperties.mockResolvedValue({
        data: { first_access: false },
      });

      await projectStore.changeReadyMadeProjectProperties({
        projectUuid: 'a-project-uuid',
        first_access: false,
      });

      expect(projectStore.currentProject.first_access).toBe(false);
    });
  });

  describe('updateProjectHasWppChannel', () => {
    it('sets has_wpp_channel from active WAC channels', async () => {
      projectStore.currentProject = { ...sampleProject, has_wpp_channel: false };
      projectsApi.listChannels.mockResolvedValue({
        data: {
          channels: [{ is_active: false }, { is_active: true }],
        },
      });

      await projectStore.updateProjectHasWppChannel({
        projectUuid: 'a-project-uuid',
      });

      expect(projectStore.currentProject.has_wpp_channel).toBe(true);
    });

    it('sets has_wpp_channel to false when the request fails', async () => {
      projectStore.currentProject = { ...sampleProject };
      projectsApi.listChannels.mockRejectedValue(new Error('network'));

      await projectStore.updateProjectHasWppChannel({
        projectUuid: 'a-project-uuid',
      });

      expect(projectStore.currentProject.has_wpp_channel).toBe(false);
    });
  });

  describe('clearCurrentProject', () => {
    it('clears the current project and the shared store', () => {
      projectStore.setCurrentProjectState(sampleProject);
      projectStore.clearCurrentProject();

      expect(projectStore.currentProject).toBeNull();
      expect(sharedStore.current.project.uuid).toBeUndefined();
    });
  });

  describe('getSuccessOrgStatusByFlowUuid', () => {
    it('fetches and caches the champion chatbot', async () => {
      projectsApi.apiFlowsGetSuccessOrg.mockResolvedValue({
        has_ia: true,
        has_flows: true,
        has_channel: false,
        has_msg: false,
        has_channel_production: false,
      });

      const result = await projectStore.getSuccessOrgStatusByFlowUuid({
        flowUuid: 'flow-1',
      });

      expect(projectsApi.apiFlowsGetSuccessOrg).toHaveBeenCalledWith({
        flowUuid: 'flow-1',
      });
      expect(result.has_ia).toBe(true);
      expect(projectStore.championChatbots['flow-1'].has_flows).toBe(true);
    });

    it('returns the cache unless force is set', async () => {
      projectStore.championChatbots = { 'flow-1': { flowUuid: 'flow-1' } };

      const result = await projectStore.getSuccessOrgStatusByFlowUuid({
        flowUuid: 'flow-1',
      });

      expect(projectsApi.apiFlowsGetSuccessOrg).not.toHaveBeenCalled();
      expect(result).toEqual({ flowUuid: 'flow-1' });
    });

    it('stores an error flag and rethrows when the request fails', async () => {
      projectsApi.apiFlowsGetSuccessOrg.mockRejectedValue(new Error('boom'));

      await expect(
        projectStore.getSuccessOrgStatusByFlowUuid({ flowUuid: 'flow-1' }),
      ).rejects.toThrow('boom');

      expect(projectStore.championChatbots['flow-1']).toEqual({
        flowUuid: 'flow-1',
        error: true,
      });
    });
  });

  describe('getRecentActivities', () => {
    it('loads, dedupes, and marks complete when next is null', async () => {
      projectsApi.latestActivities.mockResolvedValue({
        data: {
          next: null,
          results: [
            { user: 'Ada', created_at: '2024-01-01', action: 'created-ai' },
            { user: 'Ada', created_at: '2024-01-01', action: 'created-ai' },
          ],
        },
      });

      await projectStore.getRecentActivities('p-1');

      expect(projectsApi.latestActivities).toHaveBeenCalledWith({
        projectUuid: 'p-1',
        limit: 20,
        next: null,
      });
      expect(projectStore.recentActivities['p-1'].status).toBe('complete');
      expect(projectStore.recentActivities['p-1'].data).toHaveLength(1);
    });

    it('skips fetching when already loading or complete', async () => {
      projectStore.recentActivities = {
        'p-1': { status: 'complete', next: null, data: [] },
      };

      await projectStore.getRecentActivities('p-1');

      expect(projectsApi.latestActivities).not.toHaveBeenCalled();
    });

    it('stores error status when the request fails', async () => {
      projectsApi.latestActivities.mockRejectedValue(new Error('boom'));

      await projectStore.getRecentActivities('p-1');

      expect(projectStore.recentActivities['p-1'].status).toBe('error');
    });
  });
});
