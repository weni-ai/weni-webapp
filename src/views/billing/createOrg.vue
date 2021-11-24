<template>
  <div class="create-org">
    <billing-modal
      :title="$t('billing.pre_org_create_title')"
      :subtitle="$t('billing.pre_org_create_subtitle')"
      v-show="current === 0 || current === 'plans'"
    >
      <slot slot="content">
        <billing-card
          class="unnnic-grid-span-4"
          type="free"
          :buttonAction="() => onChoosePlan('free')"
          :buttonLoading="creatingPlan === 'free'"
          :buttonDisabled="creatingPlan === 'enterprise'"
        />
        <billing-card
          class="unnnic-grid-span-4"
          type="paid"
          hasIntegration
          @togglePriceModal="togglePriceModal"
          :buttonAction="() => onChoosePlan('enterprise')"
          :buttonLoading="creatingPlan === 'enterprise'"
          :buttonDisabled="creatingPlan === 'free'"
        />
        <billing-card
          class="unnnic-grid-span-4"
          type="custom"
          @top="onNextStep"
        />
      </slot>
    </billing-modal>

    <BillingModalPrice
      :isOpenModal="isOpenModalPrice"
      @togglePriceModal="togglePriceModal"
    />

    <BillingAddCreditCard v-show="current === 1 || current === 'credit-card'" />

    <BillingFormAddress v-show="current === 2"
      @confirm-card-setup="confirmCardSetup"
    />
    <pre style="position: absolute; z-index: 999999;">{{ billing_details }}currentOrg.uuid:{{ currentOrg }}</pre>

    <ChoosedPlan v-if="current === 3 || current === 'success'" :type="typePlan" />
  </div>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
import BillingCard from '@/components/billing/Card.vue';
import BillingModalPrice from '@/components/billing/ModalPrice.vue';
import BillingAddCreditCard from '@/views/billing/addCreditCard.vue';
import BillingFormAddress from '@/views/billing/formAddress.vue';
import ChoosedPlan from '@/views/billing/choosedPlan.vue';
import { mapActions, mapState, mapGetters } from 'vuex';

export default {
  data() {
    return {
      typePlan: '',
      isOpenModalPrice: false,
      paidButton: false,

      creatingPlan: null,

      clientSecret: null,
      token: null,
      cardNumber: null,
      cardExpiry: null,
      cardCvc: null,
    };
  },

  computed: {
    ...mapState({
      current: (state) => state.BillingSteps.currentModal,
      creationFreeLoading: (state) =>
        state.Org.loadingCreateOrg || state.Project.loadingCreateProject,
      organizationCreationError: (state) => state.Org.currentOrg.errorCreateOrg,
      projectCreationError: (state) => state.Org.currentOrg.errorCreateProject,
      billing_details: (state) => state.BillingSteps.billing_details,
    }),

    ...mapGetters(['currentOrg']),

    stripeElements() {
      return this.$stripe.elements();
    },
  },

  watch: {
    'currentOrg.uuid'(organizationUuid) {
      console.log('created uuid');
      if (organizationUuid) {
        this.setupIntent({ organizationUuid }).then(
          (response) => {
            this.clientSecret = response?.data?.client_secret;
          },
        );
      }
    },
  },

  mounted() {
    // this.nextBillingStep();

    const style = {
      base: {
        color: '#4e5666',
        fontFamily: 'Lato, "Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '14px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      spacingUnit: '6px',
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };

    this.cardNumber = this.stripeElements.create('cardNumber', { style });
    this.cardNumber.mount('#card-number');
    this.cardExpiry = this.stripeElements.create('cardExpiry', { style });
    this.cardExpiry.mount('#card-expiry');
    this.cardCvc = this.stripeElements.create('cardCvc', { style });
    this.cardCvc.mount('#card-cvc');
  },

  beforeDestroy() {
    this.cardNumber.destroy();
    this.cardExpiry.destroy();
    this.cardCvc.destroy();
  },

  methods: {
    ...mapActions([
      'createOrg',
      'createProject',
      'nextBillingStep',
      'setBillingStep',
      'finishBillingSteps',
      'setBillingOrgStep',
      'setupIntent',
    ]),

    async onChoosePlan(type) {
      if (!this.currentOrg?.uuid) {
        this.creatingPlan = type;

        this.setBillingOrgStep({
          name: 'name of the new org',
          description: 'description of the new org',
        });

        await this.createOrg('free');
        // if (!this.organizationCreationError) await this.createProject();
        // if (!this.projectCreationError) this.finishBillingSteps();

        this.creatingPlan = null;
      }

      if (type === 'enterprise') {
        this.setBillingStep('credit-card');
      } else {
        this.setBillingStep('success');
      }
    },

    onNextStep(teste) {
      this.typePlan = teste;
      this.current++;
    },

    togglePriceModal() {
      this.isOpenModalPrice = !this.isOpenModalPrice;
    },

    async confirmCardSetup() {
      // this.nextBillingStep();

      const stripeConfirmSetupButton = document.querySelector('#stripe-confirm-setup-button');

      console.log('el', stripeConfirmSetupButton);

      stripeConfirmSetupButton.setAttribute('disabled', true);

      const response = await this.$stripe.confirmCardSetup(this.clientSecret, {
        payment_method: {
          card: this.cardNumber,
          billing_details: {
            address: {
              country: this.billing_details.address.country || 'BR',
              state: this.billing_details.address.state || 'just for test',
              city: this.billing_details.address.city || 'just for test',
              line1: this.billing_details.address.line1,
              postal_code: this.billing_details.address.postal_code,
            },
          },
        },
      });

      if (response.error) {
        console.log('error', response.error);

        if (response.error.type === 'validation_error') {
          this.setBillingStep('credit-card');
        }
      } else {
        console.log('response', response);
      }

      stripeConfirmSetupButton.removeAttribute('disabled');
    },
  },
  components: {
    BillingCard,
    BillingModal,
    ChoosedPlan,
    BillingModalPrice,
    BillingAddCreditCard,
    BillingFormAddress,
  },
};
</script>

<style lang="scss" scoped>
.create-org ::v-deep {
  .StripeElement {
    border: .0625rem solid #e2e6ed;
    border-radius: 0.25rem;
    background-color: white;
    padding: 12px 16px;
    cursor: text;

    &.StripeElement--focus {
      border-color: #9caccc;
    }

    &.StripeElement--invalid {
      border-color: #ff4545;
    }
  }
}
</style>
