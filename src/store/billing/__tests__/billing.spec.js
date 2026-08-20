import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useBillingStore } from '@/store/billing';
import orgsApi from '@/api/orgs';

vi.mock('@/api/orgs', () => ({
  default: {
    getOrgInvoices: vi.fn(),
    getActiveContacts: vi.fn(),
    setupIntent: vi.fn(),
    removeCreditCard: vi.fn(),
    closeOrgPlan: vi.fn(),
    reactiveOrgPlan: vi.fn(),
    saveOrganizationAdditionalInformation: vi.fn(),
    billingPricing: vi.fn(),
    activeContactsLimitForFree: vi.fn(),
    organizationUniqueInvoice: vi.fn(),
    getContactActiveDetailed: vi.fn(),
  },
}));

describe('useBillingStore', () => {
  let billingStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    billingStore = useBillingStore();
    vi.clearAllMocks();
  });

  describe('getOrgInvoices', () => {
    it('forwards the payload to the API and returns the response', async () => {
      const response = { data: { results: [] } };
      orgsApi.getOrgInvoices.mockResolvedValue(response);

      const payload = {
        organizationUuid: 'org-1',
        ordering: '-due_date',
        search: 'acme',
        start_due_date: '2024-01-01',
        end_due_date: '2024-01-31',
        payment_status: 'paid',
        offset: 20,
        limit: 10,
      };

      const result = await billingStore.getOrgInvoices(payload);

      expect(orgsApi.getOrgInvoices).toHaveBeenCalledWith(payload);
      expect(result).toBe(response);
    });

    it('defaults offset to 0 and limit to 20', async () => {
      orgsApi.getOrgInvoices.mockResolvedValue({ data: {} });

      await billingStore.getOrgInvoices({ organizationUuid: 'org-1' });

      expect(orgsApi.getOrgInvoices).toHaveBeenCalledWith({
        organizationUuid: 'org-1',
        ordering: undefined,
        search: undefined,
        start_due_date: undefined,
        end_due_date: undefined,
        payment_status: undefined,
        offset: 0,
        limit: 20,
      });
    });

    it('propagates API errors', async () => {
      const error = new Error('invoices failed');
      orgsApi.getOrgInvoices.mockRejectedValue(error);

      await expect(
        billingStore.getOrgInvoices({ organizationUuid: 'org-1' }),
      ).rejects.toThrow(error);
    });
  });

  describe('getActiveContacts', () => {
    it('forwards the payload to the API and returns the response', async () => {
      const response = { data: { projects: [] } };
      orgsApi.getActiveContacts.mockResolvedValue(response);

      const payload = {
        organizationUuid: 'org-1',
        after: '2024-01-01',
        before: '2024-01-31',
      };

      const result = await billingStore.getActiveContacts(payload);

      expect(orgsApi.getActiveContacts).toHaveBeenCalledWith(payload);
      expect(result).toBe(response);
    });

    it('propagates API errors', async () => {
      const error = new Error('active contacts failed');
      orgsApi.getActiveContacts.mockRejectedValue(error);

      await expect(
        billingStore.getActiveContacts({ organizationUuid: 'org-1' }),
      ).rejects.toThrow(error);
    });
  });

  describe('setupIntent', () => {
    it('forwards the organization uuid to the API and returns the response', async () => {
      const response = { data: { client_secret: 'secret' } };
      orgsApi.setupIntent.mockResolvedValue(response);

      const result = await billingStore.setupIntent({
        organizationUuid: 'org-1',
      });

      expect(orgsApi.setupIntent).toHaveBeenCalledWith({
        organizationUuid: 'org-1',
      });
      expect(result).toBe(response);
    });
  });

  describe('removeCreditCard', () => {
    it('forwards the organization uuid to the API and returns the response', async () => {
      const response = { data: {} };
      orgsApi.removeCreditCard.mockResolvedValue(response);

      const result = await billingStore.removeCreditCard({
        organizationUuid: 'org-1',
      });

      expect(orgsApi.removeCreditCard).toHaveBeenCalledWith({
        organizationUuid: 'org-1',
      });
      expect(result).toBe(response);
    });
  });

  describe('closeOrganizationPlan', () => {
    it('calls closeOrgPlan with the organization uuid and returns the response', async () => {
      const response = { data: {} };
      orgsApi.closeOrgPlan.mockResolvedValue(response);

      const result = await billingStore.closeOrganizationPlan({
        organizationUuid: 'org-1',
      });

      expect(orgsApi.closeOrgPlan).toHaveBeenCalledWith({
        organizationUuid: 'org-1',
      });
      expect(result).toBe(response);
    });
  });

  describe('reactiveOrganizationPlan', () => {
    it('calls reactiveOrgPlan with the organization uuid and returns the response', async () => {
      const response = { data: {} };
      orgsApi.reactiveOrgPlan.mockResolvedValue(response);

      const result = await billingStore.reactiveOrganizationPlan({
        organizationUuid: 'org-1',
      });

      expect(orgsApi.reactiveOrgPlan).toHaveBeenCalledWith({
        organizationUuid: 'org-1',
      });
      expect(result).toBe(response);
    });
  });

  describe('saveOrganizationAdditionalInformation', () => {
    it('forwards the payload to the API and returns the response', async () => {
      const response = { data: {} };
      orgsApi.saveOrganizationAdditionalInformation.mockResolvedValue(response);

      const payload = {
        organizationUuid: 'org-1',
        personal_identification_number: '123',
        extra_integration: 2,
        additional_billing_info: 'notes',
      };

      const result =
        await billingStore.saveOrganizationAdditionalInformation(payload);

      expect(
        orgsApi.saveOrganizationAdditionalInformation,
      ).toHaveBeenCalledWith(payload);
      expect(result).toBe(response);
    });
  });

  describe('billingPricing', () => {
    it('calls the API and returns the response', async () => {
      const response = { data: { price: 1 } };
      orgsApi.billingPricing.mockResolvedValue(response);

      const result = await billingStore.billingPricing();

      expect(orgsApi.billingPricing).toHaveBeenCalledWith();
      expect(result).toBe(response);
    });
  });

  describe('activeContactsLimitForFree', () => {
    it('calls the API and returns the response', async () => {
      const response = { data: { limit: 200 } };
      orgsApi.activeContactsLimitForFree.mockResolvedValue(response);

      const result = await billingStore.activeContactsLimitForFree();

      expect(orgsApi.activeContactsLimitForFree).toHaveBeenCalledWith();
      expect(result).toBe(response);
    });
  });

  describe('organizationUniqueInvoice', () => {
    it('forwards the payload to the API and returns the response', async () => {
      const response = { data: { invoice: {} } };
      orgsApi.organizationUniqueInvoice.mockResolvedValue(response);

      const payload = {
        organizationUuid: 'org-1',
        randomId: 'inv-1',
        after: '2024-01-01',
        before: '2024-01-31',
      };

      const result = await billingStore.organizationUniqueInvoice(payload);

      expect(orgsApi.organizationUniqueInvoice).toHaveBeenCalledWith(payload);
      expect(result).toBe(response);
    });
  });

  describe('getContactActiveDetailed', () => {
    it('forwards the payload to the API and returns the response', async () => {
      const response = { data: { projects: {} } };
      orgsApi.getContactActiveDetailed.mockResolvedValue(response);

      const payload = {
        projectUUID: 'proj-1',
        after: '2024-01-01',
        before: '2024-01-31',
      };

      const result = await billingStore.getContactActiveDetailed(payload);

      expect(orgsApi.getContactActiveDetailed).toHaveBeenCalledWith(payload);
      expect(result).toBe(response);
    });
  });
});
