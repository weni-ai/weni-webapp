import {
  createProjectGeneralRolesObject,
  createProjectChatRolesObject,
  createAttendantRoleObject,
  PROJECT_ROLE_VIEWER,
  PROJECT_ROLE_CONTRIBUTOR,
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_CHATUSER,
  PROJECT_ROLE_MARKETING,
} from '@/components/users/permissionsObjects';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: { t: vi.fn((definition) => definition) },
  },
}));

describe('permissionsObjects.js', () => {
  describe('role constants', () => {
    it('should export correct role values', () => {
      expect(PROJECT_ROLE_VIEWER).toBe(1);
      expect(PROJECT_ROLE_CONTRIBUTOR).toBe(2);
      expect(PROJECT_ROLE_MODERATOR).toBe(3);
      expect(PROJECT_ROLE_CHATUSER).toBe(5);
      expect(PROJECT_ROLE_MARKETING).toBe(6);
    });
  });

  describe('createProjectGeneralRolesObject', () => {
    it('should return correct general roles object including marketing role', () => {
      expect(createProjectGeneralRolesObject()).toStrictEqual({
        id: 'general',
        title: 'roles.project.general.title',
        selected: 0,
        items: [
          {
            value: 3,
            title: 'roles.project.general.moderator.title',
            description: 'roles.project.general.moderator.description',
          },
          {
            value: 2,
            title: 'roles.project.general.contributor.title',
            description: 'roles.project.general.contributor.description',
          },
          {
            value: 1,
            title: 'roles.project.general.viewer.title',
            description: 'roles.project.general.viewer.description',
          },
          {
            value: 6,
            title: 'roles.project.general.marketing.title',
            description: 'roles.project.general.marketing.description',
          },
        ],
      });
    });
  });

  describe('createProjectChatRolesObject', () => {
    it('should return correct chat roles object', () => {
      expect(createProjectChatRolesObject()).toStrictEqual({
        id: 'chat',
        title: 'roles.project.chat.title',
        selected: 0,
        items: [
          {
            value: 4,
            title: 'roles.project.chat.service_manager.title',
            description: 'roles.project.chat.service_manager.description',
          },
          {
            value: 3,
            title: 'roles.project.chat.agent.title',
            description: 'roles.project.chat.agent.description',
          },
        ],
      });
    });
  });

  describe('createAttendantRoleObject', () => {
    it('should return correct attendant role object', () => {
      expect(createAttendantRoleObject()).toStrictEqual({
        value: 'attendant',
        title: 'roles.project.chat.attendant.title',
        description: 'roles.project.chat.attendant.description',
      });
    });
  });
});
