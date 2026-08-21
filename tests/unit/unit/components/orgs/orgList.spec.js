import { vi } from 'vitest';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import OrgList from '@/components/orgs/orgList.vue';
import { org } from '../../../__mocks__';
import profile from '../../../__mocks__/profile';
import { useModalStore } from '@/store/modal';
import { useOrgStore } from '@/store/org';
import { useProjectStore } from '@/store/project';

vi.mock('@/api/request.js', () => ({}));

describe('orgList.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(OrgList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              account: {
                profile,
              },
              Org: {
                orgs: { data: [org] },
                currentOrg: org,
              },
            },
          }),
        ],
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

  it('should open confirm modal when leave org is requested', () => {
    wrapper.vm.openLeaveConfirmation(org);
    const modalStore = useModalStore();
    expect(modalStore.openModal).toHaveBeenCalledTimes(1);
    const modalPayload = modalStore.openModal.mock.calls[0][0];
    expect(modalPayload).toMatchObject({
      type: 'confirm',
      data: {
        persistent: true,
        scheme: 'feedback-red',
      },
    });
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

  it('should not select disabled organization', () => {
    const disabledOrg = {
      ...org,
      access_status: 'disabled',
      access_disabled_reason: 'sso_session_required',
    };

    wrapper.vm.onSelectOrg(disabledOrg);

    expect(useOrgStore().setCurrentOrg).not.toHaveBeenCalled();
    expect(useProjectStore().clearCurrentProject).not.toHaveBeenCalled();
  });

  it('should not set current org when access is disabled', () => {
    const disabledOrg = {
      ...org,
      access_status: 'disabled',
      access_disabled_reason: 'sso_session_required',
    };

    wrapper.vm.onNavigateToBilling(disabledOrg);

    expect(useOrgStore().setCurrentOrg).not.toHaveBeenCalled();
  });
});
