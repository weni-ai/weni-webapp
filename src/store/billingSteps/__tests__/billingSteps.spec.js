import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useBillingStepsStore } from '@/store/billingSteps';

const validOrg = { name: 'Acme', description: 'Support org' };

const validProject = {
  name: 'Support',
  description: 'Help desk',
  dateFormat: 'D',
  timeZone: 'America/Sao_Paulo',
  format: 'blank',
  globals: { key: 'value' },
};

describe('useBillingStepsStore', () => {
  let billingStepsStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    billingStepsStore = useBillingStepsStore();
  });

  describe('initial state', () => {
    it('exposes the default state', () => {
      expect(billingStepsStore.current).toBe(0);
      expect(billingStepsStore.currentModal).toBe(0);
      expect(billingStepsStore.loading).toBe(false);
      expect(billingStepsStore.isActiveNewWhatsappIntegrations).toBe(false);
      expect(billingStepsStore.integrations).toBe('1');
      expect(billingStepsStore.flow).toBe('');
      expect(billingStepsStore.org).toEqual({ name: '', description: '' });
      expect(billingStepsStore.orgError).toBeNull();
      expect(billingStepsStore.project).toEqual({
        name: null,
        dateFormat: 'D',
        timeZone: 'America/Argentina/Buenos_Aires',
        format: null,
        globals: {},
      });
      expect(billingStepsStore.projectError).toBeNull();
      expect(billingStepsStore.users).toEqual([]);
      expect(billingStepsStore.billing_details).toEqual({
        customer: '',
        address: {
          city: '',
          country: '',
          line1: '',
          line2: null,
          postal_code: '',
          state: '',
        },
        email: null,
        name: '',
        phone: null,
        cpfOrCnpj: '',
        additionalInformation: '',
      });
      expect(billingStepsStore.pricing).toEqual({
        status: null,
        plans: {},
      });
    });
  });

  describe('setBillingOrgStep', () => {
    it('stores the org and advances current when on step 0 with name and description', () => {
      billingStepsStore.setBillingOrgStep(validOrg);

      expect(billingStepsStore.org).toEqual(validOrg);
      expect(billingStepsStore.current).toBe(1);
    });

    it('does not advance when name or description is missing', () => {
      billingStepsStore.setBillingOrgStep({ name: 'Acme' });
      billingStepsStore.setBillingOrgStep({ description: 'Support org' });

      expect(billingStepsStore.org).toEqual({ name: '', description: '' });
      expect(billingStepsStore.current).toBe(0);
    });

    it('does not advance when current is not 0', () => {
      billingStepsStore.current = 1;
      billingStepsStore.setBillingOrgStep(validOrg);

      expect(billingStepsStore.org).toEqual({ name: '', description: '' });
      expect(billingStepsStore.current).toBe(1);
    });
  });

  describe('setBillingMembersStep', () => {
    it('always stores users and advances current only when on step 1', () => {
      const members = [{ email: 'jane@example.com' }];

      billingStepsStore.setBillingMembersStep({ users: members });

      expect(billingStepsStore.users).toEqual(members);
      expect(billingStepsStore.current).toBe(0);

      billingStepsStore.current = 1;
      billingStepsStore.setBillingMembersStep({ users: members });

      expect(billingStepsStore.current).toBe(2);
    });
  });

  describe('setBillingProjectStep', () => {
    it('stores the project when on step 2 with required fields', () => {
      billingStepsStore.current = 2;
      billingStepsStore.setBillingProjectStep(validProject);

      expect(billingStepsStore.project).toEqual(validProject);
    });

    it('does not store the project when current is not 2', () => {
      billingStepsStore.setBillingProjectStep(validProject);

      expect(billingStepsStore.project.name).toBeNull();
    });

    it('does not store the project when required fields are missing', () => {
      billingStepsStore.current = 2;
      billingStepsStore.setBillingProjectStep({ name: 'Support' });

      expect(billingStepsStore.project.name).toBeNull();
    });
  });

  describe('backBilling', () => {
    it('decrements current unless it is already 0', () => {
      billingStepsStore.backBilling();
      expect(billingStepsStore.current).toBe(0);

      billingStepsStore.current = 2;
      billingStepsStore.backBilling();
      expect(billingStepsStore.current).toBe(1);
    });
  });

  describe('modal step actions', () => {
    it('finishBillingSteps sets currentModal to success', () => {
      billingStepsStore.finishBillingSteps();
      expect(billingStepsStore.currentModal).toBe('success');
    });

    it('resetBillingSteps resets current and currentModal', () => {
      billingStepsStore.current = 3;
      billingStepsStore.currentModal = 'card';

      billingStepsStore.resetBillingSteps();

      expect(billingStepsStore.current).toBe(0);
      expect(billingStepsStore.currentModal).toBe('plans');
    });

    it('setBillingStep sets currentModal', () => {
      billingStepsStore.setBillingStep('address');
      expect(billingStepsStore.currentModal).toBe('address');
    });

    it('nextBillingStep increments currentModal', () => {
      billingStepsStore.nextBillingStep();
      expect(billingStepsStore.currentModal).toBe(1);
    });
  });

  describe('integrations', () => {
    it('addIntegration increments the count as a string between 1 and 9', () => {
      billingStepsStore.addIntegration();
      expect(billingStepsStore.integrations).toBe('2');

      billingStepsStore.integrations = '9';
      billingStepsStore.addIntegration();
      expect(billingStepsStore.integrations).toBe('10');

      billingStepsStore.addIntegration();
      expect(billingStepsStore.integrations).toBe('10');
    });

    it('removeIntegration decrements the count as a string between 2 and 10', () => {
      billingStepsStore.removeIntegration();
      expect(billingStepsStore.integrations).toBe('1');

      billingStepsStore.integrations = '2';
      billingStepsStore.removeIntegration();
      expect(billingStepsStore.integrations).toBe('1');
    });

    it('updateIntegration replaces the count', () => {
      billingStepsStore.updateIntegration('7');
      expect(billingStepsStore.integrations).toBe('7');
    });

    it('ignores unknown integration update types', () => {
      billingStepsStore.BILLING_UPDATE_INTEGRATION({ type: 'noop' });
      expect(billingStepsStore.integrations).toBe('1');
    });

    it('setIntegrationsCount stores the count as a string', () => {
      billingStepsStore.setIntegrationsCount(4);
      expect(billingStepsStore.integrations).toBe('4');
    });

    it('setWhatsappIntegrationsActive toggles the flag', () => {
      billingStepsStore.setWhatsappIntegrationsActive(true);
      expect(billingStepsStore.isActiveNewWhatsappIntegrations).toBe(true);
    });
  });

  describe('pricing', () => {
    it('setPricingStatus and setPricingPlans update pricing', () => {
      const plans = { trial: { price: 0 } };

      billingStepsStore.setPricingStatus('loaded');
      billingStepsStore.setPricingPlans(plans);

      expect(billingStepsStore.pricing.status).toBe('loaded');
      expect(billingStepsStore.pricing.plans).toEqual(plans);
    });

    it('fetchPricingPlans loads plans from the injected API', async () => {
      const plans = { enterprise: { price: 10 } };
      const orgApi = {
        plansPricing: vi.fn().mockResolvedValue({ data: { plans } }),
      };

      await billingStepsStore.fetchPricingPlans(orgApi);

      expect(orgApi.plansPricing).toHaveBeenCalledWith();
      expect(billingStepsStore.pricing.status).toBe('loaded');
      expect(billingStepsStore.pricing.plans).toEqual(plans);
    });

    it('sets status to error when fetchPricingPlans rejects', async () => {
      const error = new Error('pricing failed');
      const orgApi = {
        plansPricing: vi.fn().mockRejectedValue(error),
      };

      await expect(billingStepsStore.fetchPricingPlans(orgApi)).rejects.toThrow(
        error,
      );

      expect(billingStepsStore.pricing.status).toBe('error');
      expect(billingStepsStore.pricing.plans).toEqual({});
    });
  });

  describe('billing details', () => {
    it('setters update the corresponding fields', () => {
      billingStepsStore.setBillingCpfCnpj('123');
      billingStepsStore.setBillingName('Jane Doe');
      billingStepsStore.setBillingAdditionalInfo('notes');
      billingStepsStore.setBillingCustomer('cus_1');
      billingStepsStore.setBillingAddress({ field: 'city', value: 'Recife' });

      expect(billingStepsStore.billing_details.cpfOrCnpj).toBe('123');
      expect(billingStepsStore.billing_details.name).toBe('Jane Doe');
      expect(billingStepsStore.billing_details.additionalInformation).toBe(
        'notes',
      );
      expect(billingStepsStore.billing_details.customer).toBe('cus_1');
      expect(billingStepsStore.billing_details.address.city).toBe('Recife');
    });

    it('resetBillingDetails clears form fields but keeps customer', () => {
      billingStepsStore.billing_details.customer = 'cus_1';
      billingStepsStore.billing_details.cpfOrCnpj = '123';
      billingStepsStore.billing_details.name = 'Jane Doe';
      billingStepsStore.billing_details.additionalInformation = 'notes';
      billingStepsStore.billing_details.address.city = 'Recife';
      billingStepsStore.billing_details.address.country = 'BR';
      billingStepsStore.billing_details.address.state = 'PE';
      billingStepsStore.billing_details.address.line1 = 'Street';
      billingStepsStore.billing_details.address.postal_code = '50000';

      billingStepsStore.resetBillingDetails();

      expect(billingStepsStore.billing_details.customer).toBe('cus_1');
      expect(billingStepsStore.billing_details.cpfOrCnpj).toBe('');
      expect(billingStepsStore.billing_details.name).toBe('');
      expect(billingStepsStore.billing_details.additionalInformation).toBe('');
      expect(billingStepsStore.billing_details.address).toEqual({
        city: '',
        country: '',
        line1: '',
        line2: null,
        postal_code: '',
        state: '',
      });
    });

    it('setupIntentWithOrg stores the customer and returns the client secret', async () => {
      const orgApi = {
        setupIntentWithOrg: vi.fn().mockResolvedValue({
          data: { customer: 'cus_1', client_secret: 'secret' },
        }),
      };

      const clientSecret = await billingStepsStore.setupIntentWithOrg({
        orgApi,
        orgUuid: 'org-1',
      });

      expect(orgApi.setupIntentWithOrg).toHaveBeenCalledWith({
        organizationUuid: 'org-1',
      });
      expect(billingStepsStore.billing_details.customer).toBe('cus_1');
      expect(clientSecret).toBe('secret');
    });
  });
});
