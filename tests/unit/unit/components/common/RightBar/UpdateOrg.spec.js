import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import UpdateOrg from '@/components/common/RightBar/updateOrg.vue';
import { openAlertModal } from '@/utils/openServerErrorAlertModal';
import { org } from '../../../../__mocks__';
import { createTestingPinia } from '@pinia/testing';
import { useModalStore } from '@/store/modal';
import { useOrgStore } from '@/store/org';

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('lodash', () => ({
  default: {
    get: vi.fn(),
  },
  filter: vi.fn(),
}));

describe('UpdateOrg.vue - onDelete method', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(UpdateOrg, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              Org: {
                orgs: {
                  data: [org],
                },
              },
            },
          }),
        ],
        mocks: {
          $t: (key, params) => {
            if (params) {
              return `${key} ${JSON.stringify(params)}`;
            }
            return key;
          },
        },
      },
      props: {
        orgUuid: org.uuid,
        activeTab: 'first',
      },
    });

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('onDelete', () => {
    it('should successfully delete organization and emit events', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';

      // Mock successful deleteOrg action
      useOrgStore().deleteOrg.mockResolvedValue();

      // Mock lodash get to return different org (not current org)
      const _ = await import('lodash');
      _.default.get.mockReturnValue('different-uuid');

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(useOrgStore().clearCurrentOrg).not.toHaveBeenCalled(); // Different org
      expect(spyShowDeleteConfirmation).toHaveBeenCalledWith(name);
      expect(wrapper.emitted('remove-org')).toBeTruthy();
      expect(wrapper.emitted('remove-org')[0]).toEqual([uuid]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should clear current org when deleting the current organization', async () => {
      const uuid = 'current-org-uuid';
      const name = 'Current Organization';

      // Mock successful deleteOrg action
      useOrgStore().deleteOrg.mockResolvedValue();

      // Mock lodash get to return the same uuid (current org)
      const _ = await import('lodash');
      _.default.get.mockReturnValue(uuid);

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(useOrgStore().clearCurrentOrg).toHaveBeenCalled();
      expect(spyShowDeleteConfirmation).toHaveBeenCalledWith(name);
      expect(wrapper.emitted('remove-org')).toBeTruthy();
      expect(wrapper.emitted('remove-org')[0]).toEqual([uuid]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should handle delete error and show alert modal', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';
      const errorResponse = {
        response: {
          data: {
            detail: 'Failed to delete organization',
          },
        },
      };

      // Mock failed deleteOrg action
      useOrgStore().deleteOrg.mockRejectedValue(errorResponse);

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(useOrgStore().clearCurrentOrg).not.toHaveBeenCalled();
      expect(spyShowDeleteConfirmation).not.toHaveBeenCalled();
      expect(wrapper.emitted('remove-org')).toBeFalsy();
      expect(wrapper.emitted('close')).toBeFalsy();
      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: 'Failed to delete organization',
      });
    });

    it('should handle delete error without response detail', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';
      const errorResponse = new Error('Network error');

      // Mock failed deleteOrg action
      useOrgStore().deleteOrg.mockRejectedValue(errorResponse);

      await wrapper.vm.onDelete(uuid, name);

      expect(useOrgStore().deleteOrg).toHaveBeenCalledWith({
        uuid,
      });
      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: undefined,
      });
    });

    it('should handle delete error with nested response structure', async () => {
      const uuid = 'test-uuid';
      const name = 'Test Organization';
      const errorResponse = {
        response: {
          data: {
            detail: 'Organization has active projects',
          },
        },
      };

      // Mock failed deleteOrg action
      useOrgStore().deleteOrg.mockRejectedValue(errorResponse);

      await wrapper.vm.onDelete(uuid, name);

      expect(openAlertModal).toHaveBeenCalledWith({
        type: 'warn',
        description: 'Organization has active projects',
      });
    });
  });

  describe('showDeleteConfirmation', () => {
    it('should open success modal with organization name', () => {
      const orgName = 'Test Organization';

      wrapper.vm.showDeleteConfirmation(orgName);

      const modalStore = useModalStore();
      expect(modalStore.openModal).toHaveBeenCalledTimes(1);
      const modalPayload = modalStore.openModal.mock.calls[0][0];
      expect(modalPayload.type).toBe('alert');
      expect(modalPayload.data).toMatchObject({
        scheme: 'feedback-green',
      });
      expect(modalPayload.data.title).toBeTruthy();
      expect(modalPayload.data.description).toContain(orgName);
    });
  });
});
