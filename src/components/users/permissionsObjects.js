import i18n from '../../utils/plugins/i18n';

export const PROJECT_ROLE_VIEWER = 1;
export const PROJECT_ROLE_CONTRIBUTOR = 2;
export const PROJECT_ROLE_MODERATOR = 3;

export function createProjectGeneralRolesObject(chats = false) {
  return {
    id: 'general',
    title: i18n.t('roles.project.general.title'),
    selected: 0,
    items: [
      {
        value: PROJECT_ROLE_MODERATOR,
        title: i18n.t('roles.project.general.moderator.title'),
        description: i18n
          .t('roles.project.general.moderator.description')
          .replace(
            'rocket',
            chats
              ? { 'pt-br': 'projeto', en: 'project', es: 'proyecto' }[
                  i18n.locale
                ]
              : 'rocket',
          ),
      },
      {
        value: PROJECT_ROLE_CONTRIBUTOR,
        title: i18n.t('roles.project.general.contributor.title'),
        description: i18n.t('roles.project.general.contributor.description'),
      },
      {
        value: PROJECT_ROLE_VIEWER,
        title: i18n.t('roles.project.general.viewer.title'),
        description: i18n.t('roles.project.general.viewer.description'),
      },
    ],
  };
}

export const CHAT_ROLE_AGENT = 3;
export const CHAT_ROLE_SERVICE_MANAGER = 4;

export function createProjectChatRolesObject() {
  return {
    id: 'chat',
    title: i18n.t('roles.project.chat.title'),
    selected: 0,
    items: [
      {
        value: CHAT_ROLE_SERVICE_MANAGER,
        title: i18n.t('roles.project.chat.service_manager.title'),
        description: i18n.t('roles.project.chat.service_manager.description'),
      },
      {
        value: CHAT_ROLE_AGENT,
        title: i18n.t('roles.project.chat.agent.title'),
        description: i18n.t('roles.project.chat.agent.description'),
      },
    ],
  };
}

export function createAttendantRoleObject() {
  return {
    value: 'attendant',
    title: i18n.t('roles.project.chat.attendant.title'),
    description: i18n.t('roles.project.chat.attendant.description'),
  };
}
