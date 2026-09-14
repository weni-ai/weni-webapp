export function toApiFilters({ search, area, type } = {}) {
  const objectName = search?.trim();

  return {
    object_name: objectName || undefined,
    module: area || undefined,
    entity: type || undefined,
  };
}
