import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createStore } from 'vuex';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';

vi.mock('@/api/request.js', () => {});

describe('orgList.vue', () => {
  let wrapper;
  let state;
  let store;
  let actions;
  let getters;

  beforeEach(() => {
    state = {
      Org: {
        orgs: { data: [org] },
      },
    };
    actions = {
      getOrgs: vi.fn(),
      deleteOrg: vi.fn(),
      setCurrentOrg: vi.fn(),
      clearCurrentOrg: vi.fn(),
      clearCurrentProject: vi.fn(),
      openModal: vi.fn(),
      openRightBar: vi.fn(),
    };

    getters = {
      currentOrg() {
        return org;
      },
    };

    store = createStore({
      state,
      actions,
      getters,
    });

    wrapper = shallowMount(OrgList, {
      global: {
        plugins: [store],
        stubs: {
          RouterLink: RouterLinkStub,
          OrgListItem: true,
          NewInfiniteLoading: true,
          UnnnicSkeletonLoading: true,
          RightSideBar: true,
        },
      },
      props: {
        filterName: '',
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  // TODO: Adjust onNavigateToBilling to run this test
  // it('onNavigateToBilling', () => {
  //   const spySelectOrg = vi.spyOn(wrapper.vm, 'selectOrg');
  //   const spyRouter = vi.spyOn(wrapper.vm.$router, 'push');

  //   wrapper.vm.onNavigateToBilling({ uuid: 12 });

  //   expect(spySelectOrg).toHaveBeenCalledTimes(1);
  //   expect(spyRouter).toHaveBeenCalledTimes(1);
  // });

  it('should open alert modal when org is deleted', () => {
    const spyOpenModal = vi.spyOn(wrapper.vm, 'openModal');
    wrapper.vm.showDeleteConfirmation();
    expect(spyOpenModal).toHaveBeenCalled();
  });

  // TODO: Adjust onSelectOrg to run this test
  // it('should call selectOrg action and change route when user select org', () => {
  //   const spySelectOrg = vi.spyOn(wrapper.vm, 'selectOrg');
  //   const spyRouterPush = vi.spyOn(wrapper.vm.$router, 'push');

  //   wrapper.vm.onSelectOrg(org);

  //   expect(spySelectOrg).toHaveBeenCalledTimes(1);
  //   expect(spyRouterPush).toHaveBeenCalledWith({
  //     name: 'projects',
  //     params: {
  //       orgUuid: org.uuid,
  //     },
  //   });
  // });

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
