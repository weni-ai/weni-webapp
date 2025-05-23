import { defineAsyncComponent } from 'vue';
import * as Sentry from '@sentry/browser';

/**
 * Simple safe import utility for module federation
 * Use with defineAsyncComponent for Vue components
 */

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

    return {};
  }
}
