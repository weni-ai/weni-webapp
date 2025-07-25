import { vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import UpdateOrg from '@/components/common/RightBar/updateOrg.vue';
import { openAlertModal } from '@/utils/openServerErrorAlertModal';
import { org } from '../../../../__mocks__';

vi.mock('@/utils/openServerErrorAlertModal', () => ({
  openAlertModal: vi.fn(),
}));

vi.mock('lodash', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('UpdateOrg.vue - onDelete method', () => {
  let wrapper;
  let store;
  let actions;
  let state;

  beforeEach(() => {
    actions = {
      deleteOrg: vi.fn(),
      clearCurrentOrg: vi.fn(),
      clearCurrentProject: vi.fn(),
      editOrg: vi.fn(),
      getOrgs: vi.fn(),
      setCurrentOrg: vi.fn(),
      openModal: vi.fn(),
    };

    state = {
      Org: {
        orgs: {
          data: [org],
        },
      },
    };

    store = createStore({
      state,
      actions,
    });

    wrapper = shallowMount(UpdateOrg, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicTab: true,
          UnnnicInput: true,
          UnnnicButton: true,
          UnnnicTag: true,
          UnnnicSwitch: true,
        },
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
      actions.deleteOrg.mockResolvedValue();

      // Mock lodash get to return different org (not current org)
      const _ = await import('lodash');
      _.default.get.mockReturnValue('different-uuid');

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(actions.deleteOrg).toHaveBeenCalledWith(expect.anything(), {
        uuid,
      });
      expect(actions.clearCurrentOrg).not.toHaveBeenCalled(); // Different org
      expect(spyShowDeleteConfirmation).toHaveBeenCalledWith(name);
      expect(wrapper.emitted('remove-org')).toBeTruthy();
      expect(wrapper.emitted('remove-org')[0]).toEqual([uuid]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should clear current org when deleting the current organization', async () => {
      const uuid = 'current-org-uuid';
      const name = 'Current Organization';

      // Mock successful deleteOrg action
      actions.deleteOrg.mockResolvedValue();

      // Mock lodash get to return the same uuid (current org)
      const _ = await import('lodash');
      _.default.get.mockReturnValue(uuid);

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(actions.deleteOrg).toHaveBeenCalledWith(expect.anything(), {
        uuid,
      });
      expect(actions.clearCurrentOrg).toHaveBeenCalled();
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
      actions.deleteOrg.mockRejectedValue(errorResponse);

      const spyShowDeleteConfirmation = vi.spyOn(
        wrapper.vm,
        'showDeleteConfirmation',
      );

      await wrapper.vm.onDelete(uuid, name);

      expect(actions.deleteOrg).toHaveBeenCalledWith(expect.anything(), {
        uuid,
      });
      expect(actions.clearCurrentOrg).not.toHaveBeenCalled();
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
      actions.deleteOrg.mockRejectedValue(errorResponse);

      await wrapper.vm.onDelete(uuid, name);

      expect(actions.deleteOrg).toHaveBeenCalledWith(expect.anything(), {
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
      actions.deleteOrg.mockRejectedValue(errorResponse);

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

      expect(actions.openModal).toHaveBeenCalledWith(expect.anything(), {
        type: 'alert',
        data: {
          icon: 'check_circle',
          scheme: 'feedback-green',
          title: 'Organization successfully deleted',
          description:
            'The organization Test Organization was deleted, an e-mail will be sent to the members. <emoji name="Winking Face" />',
        },
      });
    });
  });
});
