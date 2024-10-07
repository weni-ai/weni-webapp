import {
  createProjectGeneralRolesObject,
  createProjectChatRolesObject,
  createAttendantRoleObject,
} from '@/components/users/permissionsObjects';
import { vi } from 'vitest';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: { t: vi.fn((definition) => definition) },
  },
}));

describe('permissionsObjects.js', () => {
  it('it should return correspondent object depending on role type', () => {
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
      ],
    });

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

    expect(createAttendantRoleObject()).toStrictEqual({
      value: 'attendant',
      title: 'roles.project.chat.attendant.title',
      description: 'roles.project.chat.attendant.description',
    });
  });
});
