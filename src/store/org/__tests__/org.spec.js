import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { fetchFlowOrganization, useOrgStore } from '@/store/org';
import { useProjectStore } from '@/store/project';
import orgsApi from '@/api/orgs';
import projectsApi from '@/api/projects';
import router from '@/router';

vi.mock('@/api/orgs', () => ({
  default: {
    list: vi.fn(),
    getOrg: vi.fn(),
    editOrg: vi.fn(),
    deleteOrg: vi.fn(),
    getMembers: vi.fn(),
    createRequestPermission: vi.fn(),
    addAuthorization: vi.fn(),
    removeAuthorization: vi.fn(),
    changeAuthorization: vi.fn(),
    leaveOrg: vi.fn(),
  },
}));

vi.mock('@/api/projects', () => ({
  default: {
    getProject: vi.fn(),
  },
}));

vi.mock('@/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: {},
      },
    },
  },
}));

const sampleOrg = {
  uuid: 'org-1',
  name: 'Acme',
  inteligence_organization: 12,
  authorization: { role: 3, is_admin: true },
  organization_billing: { plan: 'trial' },
  extra_integration: 0,
  enforce_2fa: false,
  is_suspended: false,
  show_chat_help: true,
  access_status: 'active',
  access_disabled_reason: null,
  description: 'should not be copied by setCurrentOrg',
};

describe('useOrgStore', () => {
  let orgStore;
  let projectStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    orgStore = useOrgStore();
    projectStore = useProjectStore();
    vi.clearAllMocks();
    router.currentRoute.value.params = {};
    projectStore.currentProject = {
      organization: 'org-from-project',
    };
  });

  describe('initial state', () => {
    it('exposes the default state', () => {
      expect(orgStore.orgs).toEqual({
        ordering: 'alphabetical',
        status: null,
        data: [],
        page: 1,
        limit: 20,
        next: null,
      });
      expect(orgStore.currentOrgId).toBeNull();
      expect(orgStore.currentOrg).toBeNull();
      expect(orgStore.loadingCreateOrg).toBe(false);
      expect(orgStore.errorCreateOrg).toBe(false);
    });
  });

  describe('org getter', () => {
    it('finds the org by route orgUuid when there is no projectUuid', () => {
      orgStore.orgs.data = [sampleOrg];
      router.currentRoute.value.params = { orgUuid: 'org-1' };

      expect(orgStore.org).toEqual(sampleOrg);
    });

    it('finds the org from the current project organization when projectUuid is present', () => {
      orgStore.orgs.data = [{ uuid: 'org-from-project', name: 'From project' }];
      router.currentRoute.value.params = { projectUuid: 'project-1' };

      expect(orgStore.org).toEqual({
        uuid: 'org-from-project',
        name: 'From project',
      });
    });
  });

  describe('mutations', () => {
    it('ORG_CREATE_REQUEST sets loadingCreateOrg', () => {
      orgStore.ORG_CREATE_REQUEST();
      expect(orgStore.loadingCreateOrg).toBe(true);
    });

    it('ORG_CREATE_SUCCESS stores the full org and clears loading', () => {
      orgStore.loadingCreateOrg = true;
      orgStore.ORG_CREATE_SUCCESS(sampleOrg);

      expect(orgStore.currentOrg).toEqual(sampleOrg);
      expect(orgStore.loadingCreateOrg).toBe(false);
    });

    it('ORG_CREATE_ERROR stores the error and clears loading', () => {
      orgStore.loadingCreateOrg = true;
      orgStore.ORG_CREATE_ERROR('failed');

      expect(orgStore.errorCreateOrg).toBe('failed');
      expect(orgStore.loadingCreateOrg).toBe(false);
    });

    it('updateOrgsList replaces the orgs data array', () => {
      orgStore.updateOrgsList([sampleOrg]);
      expect(orgStore.orgs.data).toEqual([sampleOrg]);
    });

    it('updateOrgAuthorizations updates matching org authorizations', () => {
      orgStore.orgs.data = [
        { uuid: 'org-1', authorizations: { users: [] } },
        { uuid: 'org-2', authorizations: { users: [] } },
      ];

      orgStore.updateOrgAuthorizations({
        orgUuid: 'org-1',
        authorizations: { users: [{ username: 'ada' }] },
      });

      expect(orgStore.orgs.data[0].authorizations).toEqual({
        users: [{ username: 'ada' }],
      });
      expect(orgStore.orgs.data[1].authorizations).toEqual({ users: [] });
    });

    it('updateOrgAuthorizations is a no-op when the org is missing', () => {
      orgStore.orgs.data = [sampleOrg];

      orgStore.updateOrgAuthorizations({
        orgUuid: 'missing',
        authorizations: { users: [] },
      });

      expect(orgStore.orgs.data).toEqual([sampleOrg]);
    });
  });

  describe('setCurrentOrg and clearCurrentOrg', () => {
    it('keeps only the fields selected by the Vuex action', () => {
      orgStore.setCurrentOrg(sampleOrg);

      expect(orgStore.currentOrg).toEqual({
        name: 'Acme',
        uuid: 'org-1',
        inteligence_organization: 12,
        authorization: { role: 3, is_admin: true },
        organization_billing: { plan: 'trial' },
        extra_integration: 0,
        enforce_2fa: false,
        is_suspended: false,
        show_chat_help: true,
        access_status: 'active',
        access_disabled_reason: null,
      });
      expect(orgStore.currentOrg.description).toBeUndefined();
    });

    it('defaults missing payload to an object of undefined fields', () => {
      orgStore.setCurrentOrg();

      expect(orgStore.currentOrg).toEqual({
        name: undefined,
        uuid: undefined,
        inteligence_organization: undefined,
        authorization: undefined,
        organization_billing: undefined,
        extra_integration: undefined,
        enforce_2fa: undefined,
        is_suspended: undefined,
        show_chat_help: undefined,
        access_status: undefined,
        access_disabled_reason: undefined,
      });
    });

    it('clearCurrentOrg sets currentOrg to null', () => {
      orgStore.setCurrentOrg(sampleOrg);
      orgStore.clearCurrentOrg();

      expect(orgStore.currentOrg).toBeNull();
    });
  });

  describe('API actions', () => {
    it('getOrgs forwards offset and limit to orgs.list', () => {
      orgsApi.list.mockResolvedValue({ data: {} });

      orgStore.getOrgs({ page: 2, limit: 10 });

      expect(orgsApi.list).toHaveBeenCalledWith(10, 10);
    });

    it('getOrgs defaults page to 1 and limit to 20', () => {
      orgsApi.list.mockResolvedValue({ data: {} });

      orgStore.getOrgs({});

      expect(orgsApi.list).toHaveBeenCalledWith(0, 20);
    });

    it('getOrg, editOrg, deleteOrg, and leaveOrg forward to the API', () => {
      orgStore.getOrg({ uuid: 'org-1' });
      orgStore.editOrg({ uuid: 'org-1', name: 'N', description: 'D' });
      orgStore.deleteOrg({ uuid: 'org-1' });
      orgStore.leaveOrg({ orgId: 'org-1', id: 9 });

      expect(orgsApi.getOrg).toHaveBeenCalledWith({ uuid: 'org-1' });
      expect(orgsApi.editOrg).toHaveBeenCalledWith('org-1', 'N', 'D');
      expect(orgsApi.deleteOrg).toHaveBeenCalledWith('org-1');
      expect(orgsApi.leaveOrg).toHaveBeenCalledWith('org-1', 9);
    });

    it('getMembers computes the offset from page and limit', () => {
      orgStore.getMembers({
        uuid: 'org-1',
        page: 3,
        limit: 5,
        search: 'ada',
      });

      expect(orgsApi.getMembers).toHaveBeenCalledWith('org-1', 10, 5, 'ada');
    });

    it('authorization helpers forward to the API', () => {
      orgStore.createRequestPermission({ email: 'a@b.com' });
      orgStore.addAuthorization({
        orgId: 'org-1',
        username: 'ada',
        role: 3,
      });
      orgStore.removeAuthorization({ orgId: 'org-1', username: 'ada' });
      orgStore.changeAuthorization({
        orgId: 'org-1',
        username: 'ada',
        role: 2,
      });

      expect(orgsApi.createRequestPermission).toHaveBeenCalledWith({
        email: 'a@b.com',
      });
      expect(orgsApi.addAuthorization).toHaveBeenCalledWith('org-1', 'ada', 3);
      expect(orgsApi.removeAuthorization).toHaveBeenCalledWith('org-1', 'ada');
      expect(orgsApi.changeAuthorization).toHaveBeenCalledWith(
        'org-1',
        'ada',
        2,
      );
    });
  });

  describe('getNextOrgs', () => {
    it('appends unique results, stores next, and leaves status null while there is a next page', async () => {
      orgStore.orgs.data = [{ uuid: 'org-1' }];
      orgStore.orgs.ordering = 'newer';
      orgsApi.list.mockResolvedValue({
        data: {
          results: [{ uuid: 'org-1' }, { uuid: 'org-2' }],
          next: 'https://api.example/next',
        },
      });

      await orgStore.getNextOrgs();

      expect(orgsApi.list).toHaveBeenCalledWith({
        next: null,
        ordering: '-created_at',
      });
      expect(orgStore.orgs.next).toBe('https://api.example/next');
      expect(orgStore.orgs.data).toEqual([{ uuid: 'org-1' }, { uuid: 'org-2' }]);
      expect(orgStore.orgs.status).toBeNull();
    });

    it('marks status complete when next is null', async () => {
      orgsApi.list.mockResolvedValue({
        data: { results: [{ uuid: 'org-1' }], next: null },
      });

      await orgStore.getNextOrgs();

      expect(orgStore.orgs.status).toBe('complete');
    });

    it('maps older ordering to created_at', async () => {
      orgStore.orgs.ordering = 'older';
      orgsApi.list.mockResolvedValue({
        data: { results: [], next: null },
      });

      await orgStore.getNextOrgs();

      expect(orgsApi.list).toHaveBeenCalledWith({
        next: null,
        ordering: 'created_at',
      });
    });
  });

  describe('list helpers', () => {
    it('removeOrgFromList drops the org from orgs.data', () => {
      orgStore.orgs.data = [sampleOrg, { uuid: 'org-2' }];
      orgStore.removeOrgFromList('org-1');

      expect(orgStore.orgs.data).toEqual([{ uuid: 'org-2' }]);
    });

    it('addUserToOrgAuthorizations appends the user when authorizations exist', () => {
      orgStore.orgs.data = [
        { uuid: 'org-1', authorizations: { count: 1, users: [{ id: 1 }] } },
      ];

      orgStore.addUserToOrgAuthorizations({
        orgUuid: 'org-1',
        userData: { id: 2 },
      });

      expect(orgStore.orgs.data[0].authorizations).toEqual({
        count: 1,
        users: [{ id: 1 }, { id: 2 }],
      });
    });

    it('addUserToOrgAuthorizations is a no-op without authorizations', () => {
      orgStore.orgs.data = [{ uuid: 'org-1' }];

      orgStore.addUserToOrgAuthorizations({
        orgUuid: 'org-1',
        userData: { id: 2 },
      });

      expect(orgStore.orgs.data[0].authorizations).toBeUndefined();
    });
  });
});

describe('fetchFlowOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns flow_organization when the project already has it', async () => {
    projectsApi.getProject.mockResolvedValue({
      data: { flow_organization: 'flow-1' },
    });

    await expect(fetchFlowOrganization('project-1')).resolves.toBe('flow-1');
    expect(projectsApi.getProject).toHaveBeenCalledTimes(1);
  });

  it('retries after 3 seconds until flow_organization is present', async () => {
    projectsApi.getProject
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { flow_organization: 'flow-2' } });

    const pending = fetchFlowOrganization('project-1');
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(3000);

    await expect(pending).resolves.toBe('flow-2');
    expect(projectsApi.getProject).toHaveBeenCalledTimes(2);
  });
});
