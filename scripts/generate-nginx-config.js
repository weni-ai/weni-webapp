/* eslint-disable no-console */
/**
 * Generates the SPA `location` blocks in `nginx.conf` based on the routes
 * defined in `src/router.js`. Keeps the explicit allowlist so that real,
 * existing routes return HTTP 200 (instead of falling through to the SPA
 * fallback that responds with status 404).
 *
 * Usage:
 *   node scripts/generate-nginx-config.js          # rewrites nginx.conf
 *   node scripts/generate-nginx-config.js --check  # exits 1 if out of sync
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverseModule = require('@babel/traverse');

const traverse = traverseModule.default || traverseModule;

const ROOT = path.resolve(__dirname, '..');
const ROUTER_PATH = path.join(ROOT, 'src', 'router.js');
const NGINX_PATH = path.join(ROOT, 'nginx.conf');

const START_MARK = '# AUTO-GENERATED ROUTES START';
const END_MARK = '# AUTO-GENERATED ROUTES END';
const INDENT = '    ';

const UUID_PARAMS = new Set(['projectUuid', 'orgUuid', 'uuid']);

function joinPath(parent, child) {
  if (child === '' || child == null) return parent;
  if (child.startsWith('/')) return child;
  const base = parent.replace(/\/$/, '');
  return `${base}/${child}`;
}

function readStringLiteral(node) {
  if (!node) return null;
  if (node.type === 'StringLiteral') return node.value;
  return null;
}

function readRouteProperties(objExpr) {
  const out = { path: null, hasPathProp: false, children: null, aliases: [] };
  for (const prop of objExpr.properties) {
    if (prop.type !== 'ObjectProperty' || !prop.key) continue;
    const key = prop.key.name || prop.key.value;

    if (key === 'path') {
      out.hasPathProp = true;
      out.path = readStringLiteral(prop.value);
    } else if (key === 'children' && prop.value.type === 'ArrayExpression') {
      out.children = prop.value;
    } else if (key === 'alias') {
      if (prop.value.type === 'StringLiteral') {
        out.aliases.push(prop.value.value);
      } else if (prop.value.type === 'ArrayExpression') {
        for (const el of prop.value.elements) {
          const v = readStringLiteral(el);
          if (v) out.aliases.push(v);
        }
      }
    }
  }
  return out;
}

function walkRoutes(arrayNode, parentPath = '') {
  const collected = [];
  for (const el of arrayNode.elements) {
    if (!el || el.type !== 'ObjectExpression') continue;
    const { path: routePath, hasPathProp, children, aliases } =
      readRouteProperties(el);

    if (!hasPathProp) continue;

    const fullPath = joinPath(parentPath, routePath ?? '');
    collected.push(fullPath);
    for (const alias of aliases) {
      collected.push(joinPath(parentPath, alias));
    }

    if (children) {
      collected.push(...walkRoutes(children, fullPath));
    }
  }
  return collected;
}

function extractRoutes() {
  const code = fs.readFileSync(ROUTER_PATH, 'utf-8');
  const ast = parser.parse(code, { sourceType: 'module' });

  let routesArray = null;
  traverse(ast, {
    VariableDeclarator(p) {
      const id = p.node.id;
      const init = p.node.init;
      if (
        id?.type === 'Identifier' &&
        id.name === 'routes' &&
        init?.type === 'ArrayExpression'
      ) {
        routesArray = init;
      }
    },
  });

  if (!routesArray) {
    throw new Error(
      `Could not locate \`const routes = [...]\` in ${ROUTER_PATH}`,
    );
  }

  return walkRoutes(routesArray);
}

function shouldSkip(routerPath) {
  if (!routerPath) return true;
  if (routerPath.includes(':pathMatch')) return true;
  if (routerPath === '/' || routerPath === '') return true;
  return false;
}

function convertPath(routerPath) {
  let nginxPath = routerPath;
  let isRegex = false;
  let uuidIndex = 0;

  nginxPath = nginxPath.replace(
    /:([a-zA-Z][a-zA-Z0-9_]*)\s*[+*]/g,
    () => {
      isRegex = true;
      return '(.*)';
    },
  );

  nginxPath = nginxPath.replace(/:([a-zA-Z][a-zA-Z0-9_]*)/g, (_, name) => {
    isRegex = true;
    if (UUID_PARAMS.has(name)) {
      const captureName = uuidIndex === 0 ? 'uuid' : `uuid${uuidIndex + 1}`;
      uuidIndex += 1;
      return `(?<${captureName}>[a-f0-9-]+)`;
    }
    return '\\w+';
  });

  return { nginxPath, isRegex };
}

function buildBlock(routerPath) {
  const { nginxPath, isRegex } = convertPath(routerPath);
  const directive = isRegex ? `~ ^${nginxPath}$` : `= ${nginxPath}`;
  return [
    `${INDENT}location ${directive} {`,
    `${INDENT}  limit_except GET {`,
    `${INDENT}    deny  all;`,
    `${INDENT}  }`,
    `${INDENT}  try_files /index.html =404;`,
    `${INDENT}}`,
  ].join('\n');
}

function sortPaths(paths) {
  return [...paths].sort((a, b) => {
    const aExact = !a.includes(':') && !a.includes('+') && !a.includes('*');
    const bExact = !b.includes(':') && !b.includes('+') && !b.includes('*');
    if (aExact !== bExact) return aExact ? -1 : 1;

    const aSegments = a.split('/').length;
    const bSegments = b.split('/').length;
    if (aSegments !== bSegments) return bSegments - aSegments;

    if (a.length !== b.length) return b.length - a.length;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function generateGeneratedSection() {
  const all = extractRoutes();
  const filtered = all.filter((p) => !shouldSkip(p));
  const unique = [...new Set(filtered)];
  const sorted = sortPaths(unique);
  return sorted.map(buildBlock).join('\n\n');
}

function buildNewConf() {
  const conf = fs.readFileSync(NGINX_PATH, 'utf-8');
  const startRegex = new RegExp(`(^[ \\t]*${START_MARK}[^\\n]*\\n)`, 'm');
  const endRegex = new RegExp(`(^[ \\t]*${END_MARK}[^\\n]*$)`, 'm');

  const startMatch = conf.match(startRegex);
  const endMatch = conf.match(endRegex);
  if (!startMatch || !endMatch) {
    throw new Error(
      `${NGINX_PATH} is missing the markers "${START_MARK}" and "${END_MARK}".`,
    );
  }

  const startIdx = startMatch.index + startMatch[0].length;
  const endIdx = endMatch.index;
  if (endIdx <= startIdx) {
    throw new Error('END marker appears before START marker in nginx.conf.');
  }

  const generated = generateGeneratedSection();
  return (
    conf.slice(0, startIdx) +
    '\n' +
    generated +
    '\n\n' +
    INDENT +
    conf.slice(endIdx).replace(/^\s*/, '')
  );
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const oldContent = fs.readFileSync(NGINX_PATH, 'utf-8');
  const newContent = buildNewConf();

  if (checkOnly) {
    if (oldContent !== newContent) {
      console.error(
        'nginx.conf is out of sync with src/router.js.\n' +
          'Run `npm run nginx:generate` locally and commit the result.',
      );
      process.exit(1);
    }
    console.log('nginx.conf is in sync with src/router.js.');
    return;
  }

  fs.writeFileSync(NGINX_PATH, newContent);
  console.log('nginx.conf regenerated from src/router.js.');
}

main();
