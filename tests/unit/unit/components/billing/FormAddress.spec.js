import { shallowMount } from '@vue/test-utils';
import FormAddress from '@/views/billing/plans/FormAddress.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useBillingStepsStore } from '@/store/billingSteps';
import statesAndCitiesOfBrazil from '@/assets/states-and-cities-of-brazil';

describe('FormAddress.vue', () => {
  let wrapper;
  let billingStepsStore;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    billingStepsStore = useBillingStepsStore();
    billingStepsStore.billing_details.address.country = 'BR';
    billingStepsStore.billing_details.address.state = 'AL';
    billingStepsStore.billing_details.address.city = 'MCZ';

    wrapper = shallowMount(FormAddress, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicToolTip: true,
          UnnnicButton: true,
          UnnnicSelect: true,
          UnnnicInput: true,
          UnnnicFormElement: true,
        },
      },
      props: {
        flow: 'test',
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('Computed isBrazilian', () => {
    it('should be truth', () => {
      wrapper.vm.BillingStepsStore.billing_details.address.country = 'BR';
      expect(wrapper.vm.isBrazilian).toBeTruthy();
    });
    it('should be falsy', () => {
      wrapper.vm.BillingStepsStore.billing_details.address.country = 'EUA';
      expect(wrapper.vm.isBrazilian).toBeFalsy();
    });
  });
  describe('Computed statesOptions', () => {
    it('should be null', () => {
      wrapper.vm.BillingStepsStore.billing_details.address.country = 'EUA';
      expect(wrapper.vm.statesOptions).toBeFalsy();
    });
    it('should be an array of states', () => {
      const states = statesAndCitiesOfBrazil.estados.map(({ nome }) => nome);
      wrapper.vm.BillingStepsStore.billing_details.address.country = 'BR';
      expect(wrapper.vm.statesOptions).toEqual(states);
    });
  });
  describe('Computed citiesOptions', () => {
    it('should be null', () => {
      expect(wrapper.vm.citiesOptions).toBeFalsy();
    });
  });
});
