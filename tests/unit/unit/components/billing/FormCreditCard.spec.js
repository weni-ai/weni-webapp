import { shallowMount } from '@vue/test-utils';
import FormCreditCard from '@/views/billing/plans/FormCreditCard.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useBillingStepsStore } from '@/store/billingSteps';

describe('FormCreditCard.vue', () => {
  let wrapper;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const billingStepsStore = useBillingStepsStore();
    billingStepsStore.billing_details.address.country = 'BR';
    billingStepsStore.billing_details.address.state = 'AL';

    wrapper = shallowMount(FormCreditCard, {
      props: {
        flow: 'test',
      },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicToolTip: true,
          UnnnicButton: true,
          UnnnicSelect: true,
          UnnnicInput: true,
        },
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
