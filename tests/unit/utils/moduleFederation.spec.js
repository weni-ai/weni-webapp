import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/browser';
import { safeAsyncComponent, safeImport } from '@/utils/moduleFederation';

vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

describe('moduleFederation.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeAsyncComponent', () => {
    it('should return a Vue async component definition', () => {
      const mockComponent = {};
      const mockImportFn = vi.fn().mockResolvedValue(mockComponent);

      const result = safeAsyncComponent(mockImportFn);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.name).toBe('AsyncComponentWrapper');

      expect(mockImportFn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should successfully load component when import succeeds', async () => {
      const mockComponent = {
        name: 'TestComponent',
        template: '<div>Test</div>',
      };
      const mockImportFn = vi.fn().mockResolvedValue(mockComponent);

      const asyncComponent = safeAsyncComponent(mockImportFn);

      const result = await asyncComponent.__asyncLoader();

      expect(mockImportFn).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockComponent);
      expect(console.error).not.toHaveBeenCalled();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should handle import failure and log errors', async () => {
      const mockError = new Error('Module not found');
      const mockImportFn = vi.fn().mockRejectedValue(mockError);

      const asyncComponent = safeAsyncComponent(mockImportFn);

      let result;
      try {
        result = await asyncComponent.__asyncLoader();
      } catch (error) {
        result = undefined;
      }

      expect(mockImportFn).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        '[Module Federation] Failed to load remote component:',
        'Module not found',
      );
    });

    it('should handle errors without error message', async () => {
      const mockError = new Error();
      const mockImportFn = vi.fn().mockRejectedValue(mockError);

      const asyncComponent = safeAsyncComponent(mockImportFn);

      let result;
      try {
        result = await asyncComponent.__asyncLoader();
      } catch (error) {
        result = undefined;
      }

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        '[Module Federation] Failed to load remote component:',
        '',
      );
    });
  });

  describe('safeImport', () => {
    describe('successful import', () => {
      it('should return the module when import succeeds', async () => {
        const mockModule = { someFunction: vi.fn() };
        const mockImportFn = vi.fn().mockResolvedValue(mockModule);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(mockImportFn).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockModule);
        expect(console.error).not.toHaveBeenCalled();
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it('should return module.default when available', async () => {
        const defaultExport = { someFunction: vi.fn() };
        const mockModule = { default: defaultExport, otherExport: 'other' };
        const mockImportFn = vi.fn().mockResolvedValue(mockModule);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(result).toBe(defaultExport);
      });

      it('should return the whole module when no default export', async () => {
        const mockModule = { namedExport: vi.fn(), anotherExport: 'value' };
        const mockImportFn = vi.fn().mockResolvedValue(mockModule);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(result).toBe(mockModule);
      });

      it('should handle module with falsy default export', async () => {
        const mockModule = { default: null, namedExport: 'value' };
        const mockImportFn = vi.fn().mockResolvedValue(mockModule);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(result).toBe(mockModule);
      });
    });

    describe('failed import', () => {
      it('should handle import failure and return empty object', async () => {
        const mockError = new Error('Module not found');
        const mockImportFn = vi.fn().mockRejectedValue(mockError);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalledWith(
          '[Module Federation] test/module unavailable:',
          'Module not found',
        );
      });

      it('should handle errors without error message', async () => {
        const mockError = new Error();
        const mockImportFn = vi.fn().mockRejectedValue(mockError);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalledWith(
          '[Module Federation] test/module unavailable:',
          '',
        );
      });
    });

    describe('edge cases', () => {
      it('should handle undefined import function', async () => {
        const result = await safeImport(undefined, 'test/module');

        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalled();
      });

      it('should handle null import function', async () => {
        const result = await safeImport(null, 'test/module');

        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalled();
      });

      it('should handle undefined import path', async () => {
        const mockError = new Error('Test error');
        const mockImportFn = vi.fn().mockRejectedValue(mockError);

        const result = await safeImport(mockImportFn, undefined);

        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalledWith(
          '[Module Federation] undefined unavailable:',
          'Test error',
        );
      });

      it('should handle import function that returns null', async () => {
        const mockImportFn = vi.fn().mockResolvedValue(null);

        const result = await safeImport(mockImportFn, 'test/module');

        expect(result).toEqual(null);
      });

      it('should handle network timeout errors', async () => {
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'TimeoutError';
        const mockImportFn = vi.fn().mockRejectedValue(timeoutError);

        const result = await safeImport(mockImportFn, 'remote/component');

        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalledWith(
          '[Module Federation] remote/component unavailable:',
          'Request timeout',
        );
      });
    });
  });
});
