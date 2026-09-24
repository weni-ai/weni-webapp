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

/** Host module routes use `:internal+`, so query-only redirects still need a segment. */
const DEFAULT_INTERNAL_SEGMENTS = ['init'];

/**
 * Builds a Connect host location from a federated `redirect` path.
 * Query-only paths such as `chats-settings:?tab=desk_copilot` land on the
 * mapped route with `internal: ['init']` so `:internal+` still matches and
 * the query reaches the remote via `getInitialModuleRoute`.
 *
 * @param {string} path
 * @param {object} [options]
 * @param {string} [options.projectUuid]
 * @param {Record<string, string>} [options.extraQuery]
 * @param {Record<string, string>} [options.moduleToRouteName]
 * @returns {{ name: string, params: { projectUuid?: string, internal: string[] }, query: Record<string, string> }}
 */
export function buildChatsHostRedirectRoute(
  path = '',
  { projectUuid, extraQuery = {}, moduleToRouteName = {} } = {},
) {
  const { module, internal, query } = parseModuleRedirectPath(path);
  const routeName = moduleToRouteName[module] || module;

  return {
    name: routeName,
    params: {
      ...(projectUuid ? { projectUuid } : {}),
      internal: internal.length ? internal : DEFAULT_INTERNAL_SEGMENTS,
    },
    query: { ...query, ...extraQuery },
  };
}

const VIEW_MODE_PATH_PATTERN =
  /^dashboard\/view-mode\/([^/]+)(?:\/([^/]+))?$/u;

/**
 * Maps the host `internal` path segments to a chats child-router location.
 * Uses named routes for paths where a string path is ambiguous (e.g. emails
 * with `@` in view-mode agent identifiers).
 *
 * @param {string|string[]|undefined} internal
 * @param {Record<string, string>} [query]
 * @returns {{ name?: string, path?: string, params?: Record<string, string>, query: Record<string, string> }|null}
 */
export function buildChildRouteFromHostInternal(internal, query = {}) {
  const pathPart = normalizeInternalPath(internal);

  if (!pathPart || pathPart === 'init') {
    return null;
  }

  const viewModeMatch = pathPart.match(VIEW_MODE_PATH_PATTERN);

  if (viewModeMatch) {
    const [, viewedAgent, oldModule] = viewModeMatch;

    return {
      name: 'dashboard.view-mode',
      params: {
        viewedAgent,
        ...(oldModule ? { oldModule } : {}),
      },
      query,
    };
  }

  if (pathPart === 'dashboard/manager') {
    return {
      name: 'dashboard.manager',
      query,
    };
  }

  return {
    path: pathPart,
    query,
  };
}
