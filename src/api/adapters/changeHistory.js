const TYPE_TO_API_ENTITY = {
  MY_AGENTS: 'AGENT',
  KNOWLEDGE_BASE: 'CONTENT_BASE_FILE',
  INSTRUCTIONS: 'CONTENT_BASE_INSTRUCTION',
};

export function toApiFilters({ search, area, type } = {}) {
  const objectName = search?.trim();

  return {
    object_name: objectName || undefined,
    module: area || undefined,
    entity: type ? (TYPE_TO_API_ENTITY[type] ?? type) : undefined,
  };
}
