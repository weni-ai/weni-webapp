import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useDashboardStore } from '@/store/dashboard';
import dashboardApi from '@/api/dashboard';

vi.mock('@/api/dashboard', () => ({
  default: {
    status: vi.fn(),
    newsletterList: vi.fn(),
    newsletter: vi.fn(),
  },
}));

describe('useDashboardStore', () => {
  let dashboardStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    dashboardStore = useDashboardStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('exposes the default state', () => {
      expect(dashboardStore.currentLanguage).toBe('en');
    });
  });

  describe('getStatus', () => {
    it('forwards orgId and projectUuid to the dashboard API', async () => {
      const response = { data: { results: [] } };
      dashboardApi.status.mockResolvedValue(response);

      const result = await dashboardStore.getStatus({
        orgId: 'org-1',
        projectUuid: 'project-1',
      });

      expect(dashboardApi.status).toHaveBeenCalledWith('org-1', 'project-1');
      expect(result).toBe(response);
    });
  });

  describe('getNewsletterList', () => {
    it('computes offset from page and limit and forwards arguments to the API', async () => {
      const response = { data: { results: [], next: null } };
      dashboardApi.newsletterList.mockResolvedValue(response);

      const result = await dashboardStore.getNewsletterList({
        orgId: 'org-1',
        projectUuid: 'project-1',
        page: 3,
        limit: 10,
      });

      expect(dashboardApi.newsletterList).toHaveBeenCalledWith('org-1', 20, 10);
      expect(result).toBe(response);
    });

    it('defaults page to 1 and limit to 10', async () => {
      dashboardApi.newsletterList.mockResolvedValue({ data: {} });

      await dashboardStore.getNewsletterList({
        orgId: 'org-1',
        projectUuid: 'project-1',
      });

      expect(dashboardApi.newsletterList).toHaveBeenCalledWith('org-1', 0, 10);
    });
  });

  describe('newsletter', () => {
    it('forwards orgId and id to the dashboard API', async () => {
      const response = { data: { id: 7 } };
      dashboardApi.newsletter.mockResolvedValue(response);

      const result = await dashboardStore.newsletter({
        orgId: 'org-1',
        id: 7,
      });

      expect(dashboardApi.newsletter).toHaveBeenCalledWith('org-1', 7);
      expect(result).toBe(response);
    });
  });
});
