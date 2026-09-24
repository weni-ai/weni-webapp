import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import orgsApi from '@/api/orgs';
import projects from '@/api/projects';
import router from '@/router';
import { useProjectStore } from '@/store/project';

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function fetchFlowOrganization(projectUuid) {
  const { data: project } = await projects.getProject({ uuid: projectUuid });

  if (project.flow_organization) {
    return project.flow_organization;
  } else {
    await sleep(3);

    return await fetchFlowOrganization(projectUuid);
  }
}

export const useOrgStore = defineStore('Org', () => {
  const projectStore = useProjectStore();

  const orgs = reactive({
    ordering: 'alphabetical',
    status: null,
    data: [],
    page: 1,
    limit: 20,
    next: null,
  });

  const currentOrgId = ref(null);
  const currentOrg = ref(null);
  const loadingCreateOrg = ref(false);
  const errorCreateOrg = ref(false);

  const org = computed(() => {
    let orgUuid;

    if (router.currentRoute.value.params.projectUuid) {
      orgUuid = projectStore.currentProject.organization;
    } else {
      orgUuid = router.currentRoute.value.params.orgUuid;
    }

    return orgs.data.find(({ uuid }) => uuid === orgUuid);
  });

  function setCurrentOrgState(organization) {
    currentOrg.value = organization;
  }

  function ORG_CREATE_REQUEST() {
    loadingCreateOrg.value = true;
  }

  function ORG_CREATE_SUCCESS(createdOrg) {
    currentOrg.value = createdOrg;
    loadingCreateOrg.value = false;
  }

  function ORG_CREATE_ERROR(createOrgError) {
    errorCreateOrg.value = createOrgError;
    loadingCreateOrg.value = false;
  }

  function updateOrgsList(updatedOrgs) {
    orgs.data = updatedOrgs;
  }

  function updateOrgAuthorizations({ orgUuid, authorizations }) {
    const orgIndex = orgs.data.findIndex(
      (organization) => organization.uuid === orgUuid,
    );

    if (orgIndex !== -1) {
      const updatedOrg = {
        ...orgs.data[orgIndex],
        authorizations,
      };

      orgs.data = [
        ...orgs.data.slice(0, orgIndex),
        updatedOrg,
        ...orgs.data.slice(orgIndex + 1),
      ];
    }
  }

  function getOrgs({ page = 1, limit = 20 }) {
    const offset = limit * (page - 1);
    return orgsApi.list(offset, limit);
  }

  async function getNextOrgs() {
    orgs.status = 'loading';

    const ordering = {
      alphabetical: 'name',
      newer: '-created_at',
      older: 'created_at',
    }[orgs.ordering];

    const {
      data: { results, next },
    } = await orgsApi.list({
      next: orgs.next,
      ordering,
    });

    orgs.next = next;

    orgs.status = null;

    orgs.data = [
      ...orgs.data,
      ...results.filter(({ uuid: organizationUuid }) => {
        return !orgs.data.some(({ uuid }) => organizationUuid === uuid);
      }),
    ];

    orgs.status = next == null ? 'complete' : null;
  }

  function getOrg({ uuid }) {
    return orgsApi.getOrg({ uuid });
  }

  function editOrg({ uuid, name, description }) {
    return orgsApi.editOrg(uuid, name, description);
  }

  function deleteOrg({ uuid }) {
    return orgsApi.deleteOrg(uuid);
  }

  function getMembers({ uuid, page = 1, limit = 20, search }) {
    const offset = limit * (page - 1);
    return orgsApi.getMembers(uuid, offset, limit, search);
  }

  function createRequestPermission(data) {
    return orgsApi.createRequestPermission(data);
  }

  function addAuthorization({ orgId, username, role }) {
    return orgsApi.addAuthorization(orgId, username, role);
  }

  function removeAuthorization({ orgId, username }) {
    return orgsApi.removeAuthorization(orgId, username);
  }

  function changeAuthorization({ orgId, username, role }) {
    return orgsApi.changeAuthorization(orgId, username, role);
  }

  function leaveOrg({ orgId, id }) {
    return orgsApi.leaveOrg(orgId, id);
  }

  function setCurrentOrg({
    name,
    uuid,
    inteligence_organization,
    authorization,
    organization_billing,
    extra_integration,
    enforce_2fa,
    is_suspended,
    show_chat_help,
    access_status,
    access_disabled_reason,
  } = {}) {
    setCurrentOrgState({
      name,
      uuid,
      inteligence_organization,
      authorization,
      organization_billing,
      extra_integration,
      enforce_2fa,
      is_suspended,
      show_chat_help,
      access_status,
      access_disabled_reason,
    });
  }

  function clearCurrentOrg() {
    setCurrentOrgState(null);
  }

  function removeOrgFromList(orgUuid) {
    const updatedOrgs = orgs.data.filter(
      (organization) => organization.uuid !== orgUuid,
    );
    updateOrgsList(updatedOrgs);
  }

  function addUserToOrgAuthorizations({ orgUuid, userData }) {
    const organization = orgs.data.find(({ uuid }) => uuid === orgUuid);

    if (organization && organization.authorizations) {
      const updatedAuthorizations = {
        ...organization.authorizations,
        users: [...organization.authorizations.users, userData],
      };

      updateOrgAuthorizations({
        orgUuid,
        authorizations: updatedAuthorizations,
      });
    }
  }

  return {
    orgs,
    currentOrgId,
    currentOrg,
    loadingCreateOrg,
    errorCreateOrg,
    org,
    setCurrentOrg,
    ORG_CREATE_REQUEST,
    ORG_CREATE_SUCCESS,
    ORG_CREATE_ERROR,
    updateOrgsList,
    updateOrgAuthorizations,
    getOrgs,
    getNextOrgs,
    getOrg,
    editOrg,
    deleteOrg,
    getMembers,
    createRequestPermission,
    addAuthorization,
    removeAuthorization,
    changeAuthorization,
    leaveOrg,
    clearCurrentOrg,
    removeOrgFromList,
    addUserToOrgAuthorizations,
  };
});
