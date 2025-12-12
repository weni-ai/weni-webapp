import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSidebarModules } from '@/components/Sidebar/sidebarModules.js';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: { t: vi.fn((key) => key) },
  },
}));

vi.mock('@/assets/tutorial/sidebar-studio.gif', () => ({
  default: 'sidebar-studio.gif',
}));

vi.mock('@/assets/tutorial/sidebar-intelligences.gif', () => ({
  default: 'sidebar-intelligences.gif',
}));

vi.mock('@/assets/tutorial/sidebar-chats.gif', () => ({
  default: 'sidebar-chats.gif',
}));

vi.mock('@/assets/tutorial/sidebar-integrations.gif', () => ({
  default: 'sidebar-integrations.gif',
}));

describe('sidebarModules.js', () => {
  const mockProjectUrl = (path) => `/projects/test-uuid/${path}`;

  describe('createSidebarModules', () => {
    describe('basic module creation', () => {
      it('should create all basic modules', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.insights).toBeDefined();
        expect(modules.settings).toBeDefined();
        expect(modules.chats).toBeDefined();
        expect(modules.studio).toBeDefined();
        expect(modules.push).toBeDefined();
        expect(modules.integrations).toBeDefined();
      });

      it('should create modules with correct viewUrl structure', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.insights.viewUrl).toBe('/projects/test-uuid/insights');
        expect(modules.settings.viewUrl).toBe('/projects/test-uuid/settings');
        expect(modules.chats.viewUrl).toBe('/projects/test-uuid/chats');
        expect(modules.studio.viewUrl).toBe('/projects/test-uuid/studio');
        expect(modules.push.viewUrl).toBe('/projects/test-uuid/push');
        expect(modules.integrations.viewUrl).toBe(
          '/projects/test-uuid/integrations',
        );
      });

      it('should set isActive type for all modules', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.insights.type).toBe('isActive');
        expect(modules.settings.type).toBe('isActive');
        expect(modules.chats.type).toBe('isActive');
        expect(modules.studio.type).toBe('isActive');
      });
    });

    describe('conditional modules', () => {
      it('should return null for automations when canAccessAutomations is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.automations).toBeNull();
      });

      it('should return automations module when canAccessAutomations is true', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: true,
          hasBulkSendPermission: false,
        });

        expect(modules.automations).toBeDefined();
        expect(modules.automations.viewUrl).toBe(
          '/projects/test-uuid/automations',
        );
      });

      it('should return null for bulkSend when hasBulkSendPermission is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.bulkSend).toBeNull();
      });

      it('should return bulkSend module when hasBulkSendPermission is true', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: true,
        });

        expect(modules.bulkSend).toBeDefined();
        expect(modules.bulkSend.viewUrl).toBe('/projects/test-uuid/bulkSend');
      });
    });

    describe('AI modules with isAgentBuilder2 enabled', () => {
      it('should return aiConversations module when isAgentBuilder2 is true', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: true,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.aiConversations).toBeDefined();
        expect(modules.aiConversations.viewUrl).toBe(
          '/projects/test-uuid/ai-conversations',
        );
      });

      it('should return agentBuilderGroup as array when isAgentBuilder2 is true', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: true,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(Array.isArray(modules.agentBuilderGroup)).toBe(true);
        expect(modules.agentBuilderGroup.length).toBe(2);
        expect(modules.agentBuilderGroup[0]).toBe(modules.aiAgents);
        expect(modules.agentBuilderGroup[1]).toBe(modules.aiBuild);
      });

      it('should return null for ai module when isAgentBuilder2 is true', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: true,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.ai).toBeNull();
      });
    });

    describe('AI modules with isAgentBuilder2 disabled', () => {
      it('should return null for aiConversations when isAgentBuilder2 is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.aiConversations).toBeNull();
      });

      it('should return false for agentBuilderGroup when isAgentBuilder2 is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.agentBuilderGroup).toBe(false);
      });

      it('should return simple ai module when isProjectAllowedToUseBothub is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.ai).toBeDefined();
        expect(modules.ai.viewUrl).toBe('/projects/test-uuid/agent-builder');
        expect(modules.ai.children).toBeUndefined();
      });

      it('should return old ai module with children when isProjectAllowedToUseBothub is true', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: true,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.ai).toBeDefined();
        expect(modules.ai.children).toBeDefined();
        expect(modules.ai.children.length).toBe(2);
      });
    });

    describe('notification and tags', () => {
      it('should set hasNotification on chats when unreadMessages is truthy', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 5,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.chats.hasNotification).toBe(true);
      });

      it('should not set hasNotification on chats when unreadMessages is 0', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        // When hasNotification is falsy, the property is not added to the object
        expect(modules.chats.hasNotification).toBeFalsy();
      });

      it('should set active tag on ai module when brainOn is true and isAgentBuilder2 is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: true,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.ai.tag).toBe('SIDEBAR.ACTIVE');
      });

      it('should not set active tag on ai module when brainOn is false', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        // When tag is null, the property is not added to the object (spread operator)
        expect(modules.ai.tag).toBeFalsy();
      });
    });

    describe('disabled modals', () => {
      it('should include disabledModal for chats module', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.chats.disabledModal).toBeDefined();
        expect(modules.chats.disabledModal.title).toBe(
          'SIDEBAR.modules.chats.title',
        );
        expect(modules.chats.disabledModal.description).toBe(
          'SIDEBAR.modules.chats.description',
        );
      });

      it('should include disabledModal for studio module', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.studio.disabledModal).toBeDefined();
        expect(modules.studio.disabledModal.title).toBe(
          'SIDEBAR.modules.studio.title',
        );
      });

      it('should include disabledModal for integrations module', () => {
        const modules = createSidebarModules({
          projectUrl: mockProjectUrl,
          brainOn: false,
          unreadMessages: 0,
          isAgentBuilder2: false,
          isProjectAllowedToUseBothub: false,
          canAccessAutomations: false,
          hasBulkSendPermission: false,
        });

        expect(modules.integrations.disabledModal).toBeDefined();
        expect(modules.integrations.disabledModal.title).toBe(
          'SIDEBAR.modules.integrations.title',
        );
      });
    });
  });
});

