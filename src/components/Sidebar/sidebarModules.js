import i18n from '@/utils/plugins/i18n.js';

import gifStudio from '@/assets/tutorial/sidebar-studio.gif';
import gifIntelligences from '@/assets/tutorial/sidebar-intelligences.gif';
import gifChats from '@/assets/tutorial/sidebar-chats.gif';
import gifIntegrations from '@/assets/tutorial/sidebar-integrations.gif';

const t = (key) => i18n.global.t(key);

/**
 * Creates a basic sidebar module configuration
 */
const createModule = ({
  labelKey,
  icon,
  path,
  projectUrl,
  disabledModal = null,
  tag = null,
  hasNotification = false,
  children = null,
}) => ({
  label: t(labelKey),
  icon,
  viewUrl: projectUrl(path),
  type: 'isActive',
  ...(disabledModal && { disabledModal }),
  ...(tag && { tag }),
  ...(hasNotification && { hasNotification }),
  ...(children && { children }),
});

/**
 * Creates all sidebar module configurations
 */
export const createSidebarModules = ({
  projectUrl,
  brainOn,
  unreadMessages,
  isAgentBuilder2,
  isProjectAllowedToUseBothub,
  canAccessAutomations,
  hasBulkSendPermission,
}) => {
  const activeTag = brainOn ? t('SIDEBAR.ACTIVE') : null;

  const insights = createModule({
    labelKey: 'SIDEBAR.INSIGHTS',
    icon: 'monitoring',
    path: 'insights',
    projectUrl,
  });

  const settings = createModule({
    labelKey: 'SIDEBAR.CONFIG',
    icon: 'settings',
    path: 'settings',
    projectUrl,
  });

  const chats = createModule({
    labelKey: 'SIDEBAR.chats',
    icon: 'headphones',
    path: 'chats',
    projectUrl,
    hasNotification: !!unreadMessages,
    disabledModal: {
      title: t('SIDEBAR.modules.chats.title'),
      description: t('SIDEBAR.modules.chats.description'),
      image: gifChats,
    },
  });

  const studio = createModule({
    labelKey: 'SIDEBAR.STUDIO',
    icon: 'article_person',
    path: 'studio',
    projectUrl,
    disabledModal: {
      title: t('SIDEBAR.modules.studio.title'),
      description: t('SIDEBAR.modules.studio.description'),
      image: gifStudio,
    },
  });

  const push = createModule({
    labelKey: 'SIDEBAR.PUSH',
    icon: 'account_tree',
    path: 'push',
    projectUrl,
  });

  const integrations = createModule({
    labelKey: 'SIDEBAR.INTEGRATIONS',
    icon: 'stacks',
    path: 'integrations',
    projectUrl,
    disabledModal: {
      title: t('SIDEBAR.modules.integrations.title'),
      description: t('SIDEBAR.modules.integrations.description'),
      image: gifIntegrations,
    },
  });

  const automations = canAccessAutomations
    ? createModule({
        labelKey: 'SIDEBAR.AUTOMATIONS',
        icon: 'bolt',
        path: 'automations',
        projectUrl,
      })
    : null;

  const bulkSend = hasBulkSendPermission
    ? createModule({
        labelKey: 'SIDEBAR.BULK_SEND',
        icon: 'campaign',
        path: 'bulkSend',
        projectUrl,
      })
    : null;

  // AI-related modules
  const aiConversations = isAgentBuilder2
    ? createModule({
        labelKey: 'SIDEBAR.AI_CONVERSATIONS',
        icon: 'chat_bubble',
        path: 'ai-conversations',
        projectUrl,
      })
    : null;

  const aiAgents = createModule({
    labelKey: 'SIDEBAR.AI_AGENTS',
    icon: 'neurology',
    path: 'ai-agents',
    projectUrl,
    tag: !isAgentBuilder2 && brainOn ? t('SIDEBAR.ACTIVE') : null,
  });

  const aiBuild = createModule({
    labelKey: 'SIDEBAR.AI_BUILD',
    icon: 'build',
    path: 'ai-build',
    projectUrl,
  });

  const ai = getAiModule({
    projectUrl,
    isAgentBuilder2,
    isProjectAllowedToUseBothub,
    activeTag,
  });

  const agentBuilderGroup = isAgentBuilder2 ? [aiAgents, aiBuild] : false;

  return {
    insights,
    settings,
    chats,
    studio,
    push,
    integrations,
    automations,
    bulkSend,
    aiConversations,
    aiAgents,
    aiBuild,
    ai,
    agentBuilderGroup,
  };
};

/**
 * Determines the correct AI module based on feature flags and permissions
 */
const getAiModule = ({
  projectUrl,
  isAgentBuilder2,
  isProjectAllowedToUseBothub,
  activeTag,
}) => {
  if (isAgentBuilder2) {
    return null;
  }

  if (isProjectAllowedToUseBothub) {
    return createOldAiModule({ projectUrl, activeTag });
  }

  return createModule({
    labelKey: 'SIDEBAR.AGENT_BUILDER',
    icon: 'neurology',
    path: 'agent-builder',
    projectUrl,
    tag: activeTag,
  });
};

/**
 * Creates the legacy AI module with children (for older projects)
 */
const createOldAiModule = ({ projectUrl, activeTag }) => {
  const children = [
    {
      label: t('SIDEBAR.AGENT_BUILDER'),
      viewUrl: projectUrl('agent-builder'),
      tag: activeTag,
      type: 'isActive',
    },
    {
      label: t('SIDEBAR.CLASSIFICATION_AND_CONTENT'),
      viewUrl: projectUrl('bothub'),
      type: 'isActive',
      disabledModal: {
        title: t('SIDEBAR.modules.intelligences.title'),
        description: t('SIDEBAR.modules.intelligences.description'),
        image: gifIntelligences,
      },
    },
  ];

  return {
    label: t('SIDEBAR.BH'),
    icon: 'neurology',
    type: 'isActive',
    children,
  };
};
