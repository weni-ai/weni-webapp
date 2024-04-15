import { shallowMount, createLocalVue } from '@vue/test-utils';
import Router from 'vue-router';
import FormAddress from '@/views/billing/plans/FormAddress.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';
import { org } from '../../../__mocks__';
import statesAndCitiesOfBrazil from '@/assets/states-and-cities-of-brazil';
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

describe('FormAddress.vue', () => {
  let wrapper;

  let actions;
  let store;
  let getters;
  let state;

  beforeEach(() => {
    actions = {};
    state = {
      BillingSteps: {
        billing_details: {
          address: {
            country: 'BR',
            state: 'AL',
            city: 'MCZ',
          },
        },
      },
    };
    getters = {
      currentOrg() {
        return org;
      },
    };
    store = new Vuex.Store({
      actions,
      getters,
      state,
    });
    wrapper = shallowMount(FormAddress, {
      localVue,
      i18n,
      router,
      propsData: {
        flow: 'test',
      },
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        unnnicToolTip: true,
        unnnicButton: true,
        unnnicSelect: true,
        unnnicInput: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should redirect to org billing card', async () => {
    const spyRouter = jest.spyOn(wrapper.vm.$router, 'push');

    await wrapper.vm.back();

    expect(spyRouter).toHaveBeenCalledTimes(1);
  });

  // it('verify watch billing details address state', async () => {
  //   wrapper.vm.$store.state.BillingSteps.billing_details.address.country = 'BR';
  //   wrapper.vm.$store.state.BillingSteps.billing_details.address.state = 'test';

  //   expect(
  //     wrapper.vm.$store.state.BillingSteps.billing_details.address.city,
  //   ).toEqual('');
  // });

  describe('Computed isBrazilian', () => {
    it('should be truth', () => {
      wrapper.vm.$store.state.BillingSteps.billing_details.address.country =
        'BR';
      expect(wrapper.vm.isBrazilian).toBeTruthy();
    });
    it('should be falsy', () => {
      wrapper.vm.$store.state.BillingSteps.billing_details.address.country =
        'EUA';
      expect(wrapper.vm.isBrazilian).toBeFalsy();
    });
  });
  describe('Computed statesOptions', () => {
    it('should be null', () => {
      wrapper.vm.$store.state.BillingSteps.billing_details.address.country =
        'EUA';
      expect(wrapper.vm.statesOptions).toBeFalsy();
    });
    it('should be an array of states', () => {
      const states = statesAndCitiesOfBrazil.estados.map(({ nome }) => nome);
      wrapper.vm.$store.state.BillingSteps.billing_details.address.country =
        'BR';
      expect(wrapper.vm.statesOptions).toEqual(states);
    });
  });
  describe('Computed citiesOptions', () => {
    it('should be null', () => {
      expect(wrapper.vm.citiesOptions).toBeFalsy();
    });
  });
});
