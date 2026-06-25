/**
 * Strips the host-only `r/` remount prefix from internal path segments.
 * @param {string|string[]|undefined} internal
 * @returns {string}
 */
export function normalizeInternalPath(internal) {
  const pathPart = Array.isArray(internal)
    ? internal.join('/')
    : internal || '';

  if (pathPart.startsWith('r/')) {
    return pathPart.slice(2);
  }

  return pathPart;
}

/**
 * @param {string} eventPath
 * @param {string[]} prefixes
 * @returns {string[]}
 */
export function parseInternalFromEventPath(eventPath, prefixes) {
  if (!eventPath) {
    return [];
  }

  for (const prefix of prefixes) {
    if (eventPath === prefix) {
      return [];
    }

    if (eventPath.startsWith(`${prefix}/`)) {
      return eventPath.slice(prefix.length + 1).split('/').filter(Boolean);
    }
  }

  return [];
}

/**
 * Parses a cross-module redirect path emitted by federated remotes (e.g. insights)
 * into host router parts. Format: `{module}:{internal/path}?query=params`
 *
 * @example
 * parseModuleRedirectPath(
 *   'chats:dashboard/view-mode/agent@weni.ai/insights?uuid_room=abc',
 * )
 * // => {
 * //   module: 'chats',
 * //   internal: ['dashboard', 'view-mode', 'agent@weni.ai', 'insights'],
 * //   query: { uuid_room: 'abc' },
 * // }
 *
 * @param {string} path
 * @returns {{ module: string, internal: string[], query: Record<string, string> }}
 */
export function parseModuleRedirectPath(path = '') {
  if (!path) {
    return { module: '', internal: [], query: {} };
  }

  const colonIndex = path.indexOf(':');

  if (colonIndex === -1) {
    return { module: path, internal: [], query: {} };
  }

  const module = path.slice(0, colonIndex);
  const rawNext = path.slice(colonIndex + 1);
  const queryIndex = rawNext.indexOf('?');
  const pathPart = queryIndex === -1 ? rawNext : rawNext.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? '' : rawNext.slice(queryIndex + 1);
  const query = Object.fromEntries(new URLSearchParams(queryString));
  const internal = pathPart ? pathPart.split('/').filter(Boolean) : [];

  return { module, internal, query };
}
