import { defineAsyncComponent } from 'vue';
import * as Sentry from '@sentry/browser';

/**
 * Creates a safe async component with automatic defineAsyncComponent wrapper
 * @param {Function} importFn - The import function (e.g., () => import('remote/component'))
 * @param {any} fallback - Fallback component if import fails
 * @returns {Component} - Vue async component ready to use
 */
export function safeAsyncComponent(importFn) {
  return defineAsyncComponent(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error(
        '[Module Federation] Failed to load remote component:',
        error.message,
      );

      Sentry.captureException(error, {
        tags: {
          module_federation: true,
          error_type: 'component_load_failed',
        },
        extra: {
          errorMessage: error.message,
          stack: error.stack,
        },
      });
    }
  });
}

/**
 * Tries to import a module with retries
 * @param {Function} importer - The import function (e.g., () => import('remote/component'))
 * @param {string} path - The import path for logging purposes
 * @param {number} maxAttempts - The maximum number of attempts
 * @param {number} delay - The delay between attempts
 * @returns {Promise<Object>} - The imported object or null
 */
export async function tryImportWithRetries(
  importer,
  path,
  maxAttempts = 3,
  delay = 2000,
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const module = await safeImport(importer, path);
    if (module && JSON.stringify(module) !== '{}') return module;

    console.warn(`Import attempt ${attempt} failed for ${path}, retrying...`);

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      break;
    }
  }

  const errorMessage = `Failed to load ${path} after ${maxAttempts} attempts`;

  console.error(errorMessage);

  Sentry.captureException(new Error(errorMessage), {
    tags: { module_federation: true, import_path: path },
  });

  return null;
}

/**
 * Safe import for files
 * @param {Function} importFn - The import function (e.g., () => import('remote/locales/en'))
 * @param {string} importPath - The import path for logging purposes
 * @returns {Promise<Object>} - The imported object or empty object
 */
export async function safeImport(importFn, importPath) {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.error(
      `[Module Federation] ${importPath} unavailable:`,
      error.message,
    );

    Sentry.captureException(error, {
      tags: { module_federation: true, import_path: importPath },
    });

    return null;
  }
}
