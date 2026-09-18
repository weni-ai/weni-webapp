import { describe, expect, it } from 'vitest';

import { toApiFilters } from '@/api/adapters/changeHistory.js';

describe('toApiFilters', () => {
  it('maps search, area and type to object_name, module and entity', () => {
    expect(
      toApiFilters({
        search: 'agent name',
        area: 'NEXUS',
        type: 'MY_AGENTS',
      }),
    ).toEqual({
      object_name: 'agent name',
      module: 'NEXUS',
      entity: 'AGENT',
    });
  });

  it.each([
    ['MY_AGENTS', 'AGENT'],
    ['KNOWLEDGE_BASE', 'CONTENT_BASE_FILE'],
    ['INSTRUCTIONS', 'CONTENT_BASE_INSTRUCTION'],
    ['QUEUE', 'QUEUE'],
    ['SECTOR', 'SECTOR'],
  ])('maps UI type %s to API entity %s', (type, entity) => {
    expect(toApiFilters({ type })).toEqual({
      object_name: undefined,
      module: undefined,
      entity,
    });
  });

  it('omits empty search and unset exact filters', () => {
    expect(toApiFilters({ search: '', area: null, type: null })).toEqual({
      object_name: undefined,
      module: undefined,
      entity: undefined,
    });
  });

  it('trims search and omits whitespace-only values', () => {
    expect(toApiFilters({ search: '   ' })).toEqual({
      object_name: undefined,
      module: undefined,
      entity: undefined,
    });
  });
});
