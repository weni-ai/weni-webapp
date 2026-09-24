import { describe, it, expect } from 'vitest';
import {
  parseModuleRedirectPath,
  buildChatsHostRedirectRoute,
} from '@/utils/normalizeInternalPath';

const CHATS_MODULE_TO_ROUTE_NAME = {
  'chats-settings': 'settingsChats',
  intelligences: 'bothub',
};

describe('parseModuleRedirectPath', () => {
  it('splits module, internal path and query', () => {
    expect(
      parseModuleRedirectPath(
        'chats:dashboard/view-mode/agent@weni.ai/insights?uuid_room=abc',
      ),
    ).toEqual({
      module: 'chats',
      internal: ['dashboard', 'view-mode', 'agent@weni.ai', 'insights'],
      query: { uuid_room: 'abc' },
    });
  });

  it('parses query-only chats settings redirects', () => {
    expect(parseModuleRedirectPath('chats-settings:?tab=desk_copilot')).toEqual({
      module: 'chats-settings',
      internal: [],
      query: { tab: 'desk_copilot' },
    });
  });
});

describe('buildChatsHostRedirectRoute', () => {
  it('maps chats-settings query-only redirects onto settingsChats with init', () => {
    expect(
      buildChatsHostRedirectRoute('chats-settings:?tab=desk_copilot', {
        projectUuid: 'project-uuid',
        moduleToRouteName: CHATS_MODULE_TO_ROUTE_NAME,
      }),
    ).toEqual({
      name: 'settingsChats',
      params: {
        projectUuid: 'project-uuid',
        internal: ['init'],
      },
      query: { tab: 'desk_copilot' },
    });
  });

  it('keeps an explicit internal path and merges extra query', () => {
    expect(
      buildChatsHostRedirectRoute('chats:chats/room-uuid-123', {
        projectUuid: 'project-uuid',
        extraQuery: { uuid_room: 'room-uuid-123' },
        moduleToRouteName: CHATS_MODULE_TO_ROUTE_NAME,
      }),
    ).toEqual({
      name: 'chats',
      params: {
        projectUuid: 'project-uuid',
        internal: ['chats', 'room-uuid-123'],
      },
      query: { uuid_room: 'room-uuid-123' },
    });
  });
});
