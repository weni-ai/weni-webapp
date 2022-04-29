import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import i18n from '@/utils/plugins/i18n';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

jest.mock('@/api/request.js', () => {});

describe('orgList.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;

  beforeEach(() => {
    actions = {
      getOrgs: jest.fn(),
      deleteOrg: jest.fn(),
      setCurrentOrg: jest.fn(),
      clearCurrentOrg: jest.fn(),
      clearCurrentProject: jest.fn(),
      openModal: jest.fn(),
    };

    getters = {
      currentOrg() {
        return org;
      },
    };

    store = new Vuex.Store({
      actions,
      getters,
    });

    wrapper = shallowMount(OrgList, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        OrgListItem: true,
        NewInfiniteLoading: true,
        UnnnicSkeletonLoading: true,
        RightSideBar: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('onNavigateToBilling', () => {
    const spySelectOrg = jest.spyOn(wrapper.vm, 'selectOrg');
    const spyRouter = jest.spyOn(wrapper.vm.$router, 'push');

    wrapper.vm.onNavigateToBilling({ uuid: 12 });

    expect(spySelectOrg).toHaveBeenCalledTimes(1);
    expect(spyRouter).toHaveBeenCalledTimes(1);
  });

  it('show open member view when user opens it', () => {
    expect(wrapper.vm.isMemberViewerBarOpen).toBeFalsy();
    wrapper.vm.onViewPermissions();
    expect(wrapper.vm.isMemberViewerBarOpen).toBeTruthy();
  });

  it('show open member management when user opens it', () => {
    expect(wrapper.vm.isMemberManagementBarOpen).toBeFalsy();
    wrapper.vm.onEditPermissions();
    expect(wrapper.vm.isMemberManagementBarOpen).toBeTruthy();
  });

  it('show open change org title when user opens it', () => {
    expect(wrapper.vm.isChangeNameBarOpen).toBeFalsy();
    wrapper.vm.onEdit();
    expect(wrapper.vm.isChangeNameBarOpen).toBeTruthy();
  });

  it('should open alert modal when org is deleted', () => {
    const spyOpenModal = jest.spyOn(wrapper.vm, 'openModal');
    wrapper.vm.showDeleteConfirmation();
    expect(spyOpenModal).toHaveBeenCalled();
  });

  it('should call selectOrg action and change route when user select org', () => {
    const spySelectOrg = jest.spyOn(wrapper.vm, 'selectOrg');
    const spyRouterPush = jest.spyOn(wrapper.vm.$router, 'push');

    const orgMock = {
      uuid: '1234',
    };

    wrapper.vm.onSelectOrg(orgMock);

    expect(spySelectOrg).toHaveBeenCalledTimes(1);
    expect(spyRouterPush).toHaveBeenCalledWith({
      name: 'projects',
      params: {
        orgUuid: orgMock.uuid,
      },
    });
  });

  describe('onDelete', () => {
    it('Got an error in deleteOrg Action', () => {
      const spyOpenServerErrorAlertModal = jest.spyOn(
        wrapper.vm,
        'openServerErrorAlertModal',
      );

      actions.deleteOrg.mockImplementation(() => {
        throw new Error('fetch error');
      });

      wrapper.vm.onDelete('uuid', 'name');

      expect(spyOpenServerErrorAlertModal).toHaveBeenCalled();
    });

    it('Delete org and clear current org vuex', async () => {
      const spyShowDeleteConfirmation = jest.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );
      const spyReloadOrganizations = jest.spyOn(
        wrapper.vm,
        'reloadOrganizations',
      );

      const spyClearCurrentOrg = jest.spyOn(wrapper.vm, 'clearCurrentOrg');

      actions.deleteOrg.mockImplementation(() => {
        return true;
      });

      await wrapper.vm.onDelete(org.uuid, 'name');

      expect(spyClearCurrentOrg).toHaveBeenCalled();

      expect(spyShowDeleteConfirmation).toHaveBeenCalled();
      expect(spyReloadOrganizations).toHaveBeenCalled();
    });
  });

  it('Should reload organizations', async () => {
    await wrapper.vm.reloadOrganizations();

    expect(wrapper.vm.page).toEqual(1);
    expect(wrapper.vm.complete).toBeFalsy();
    expect(wrapper.vm.orgs).toEqual([]);
  });

  it('Should return if user can edit or not', async () => {
    const isAdmin = await wrapper.vm.canEdit({
      authorization: { is_admin: true },
    });

    expect(isAdmin).toBeTruthy();

    const isnotAdmin = await wrapper.vm.canEdit({
      authorization: { is_admin: false },
    });

    expect(isnotAdmin).toBeFalsy();
  });
});
