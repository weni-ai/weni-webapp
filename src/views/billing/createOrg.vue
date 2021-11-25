<template>
  <div class="create-org">
    <billing-modal
      :title="$t(title)"
      :subtitle="$t(subtitle, { plan: currentOrg.billing.plan })"
      v-show="current === 0 || current === 'plans'"
    >
      <slot slot="content">
        <billing-card
          class="unnnic-grid-span-4"
          type="free"
          :flow="flow"
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

    <BillingAddCreditCard
      :flow="flow"
      v-show="current === 1 || current === 'credit-card'"
    />

    <BillingFormAddress
      :flow="flow"
      v-show="current === 2"
      @confirm-card-setup="confirmCardSetup"
    />

    <ChoosedPlan
      v-if="current === 3 || current === 'success'"
      :flow="flow"
      :type="typePlan"
      @success="$emit('close')"
    />
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
  props: {
    flow: {
      type: String,
      default: 'create-org',
      validator: (value) =>
        [
          'create-org',
          'change-plan',
          'add-credit-card',
          'change-credit-card',
        ].includes(value),
    },
  },

  data() {
    return {
      typePlan: 'enterprise',
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

    title() {
      if (this.flow === 'change-plan') {
        return 'billing.change_plan.plans.title';
      }

      return 'billing.pre_org_create_title';
    },

    subtitle() {
      if (this.flow === 'change-plan') {
        return 'billing.change_plan.plans.subtitle';
      }

      return 'billing.pre_org_create_subtitle';
    },
  },

  watch: {
    'currentOrg.uuid': {
      immediate: true,
      handler(organizationUuid) {
        if (organizationUuid) {
          this.setupIntent({ organizationUuid }).then((response) => {
            this.clientSecret = response?.data?.client_secret;
          });
        }
      },
    },
  },

  mounted() {
    // this.nextBillingStep();
    // this.setBillingStep('success');

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

    this.cardNumber = this.stripeElements.create('cardNumber', {
      style,
      showIcon: true,
    });
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
      'setupIntent',
      'openModal',
    ]),

    async onChoosePlan(type) {
      if (!this.currentOrg?.uuid) {
        this.creatingPlan = type;

        await this.createOrg('free');
        await this.createProject();

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
      const stripeConfirmSetupButton = document.querySelector(
        '#stripe-confirm-setup-button',
      );

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

        if (['create-org', 'change-plan'].includes(this.flow)) {
          if (this.flow === 'create-org') {
            // change org to enterprise
          } else if (this.flow === 'change-plan') {
            // change org to the new plan

            this.$emit('plan-changed');
          }

          this.setBillingStep('success');
        } else if (
          ['add-credit-card', 'change-credit-card'].includes(this.flow)
        ) {
          let title = '';
          let description = '';

          if (this.flow === 'add-credit-card') {
            title = this.$t('billing.add_credit_card.success_modal.title');
            description = this.$t(
              'billing.add_credit_card.success_modal.description',
            );
          } else if (this.flow === 'change-credit-card') {
            title = this.$t('billing.change_credit_card.success_modal.title');
            description = this.$t(
              'billing.change_credit_card.success_modal.description',
            );
          }

          this.openModal({
            type: 'alert',
            data: {
              icon: 'check-circle-1-1',
              scheme: 'feedback-green',
              title,
              description,
            },
          });

          setTimeout(() => {
            this.$emit('close');
            this.$emit('credit-card-changed');
          });
        }
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.create-org ::v-deep {
  .StripeElement {
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-neutral-snow;
    padding: $unnnic-squish-xs;
    cursor: text;

    & label {
      margin-top: 0;
    }

    &.StripeElement--focus {
      border-color: $unnnic-color-neutral-cleanest;
    }

    &.StripeElement--invalid {
      border-color: $unnnic-color-feedback-red;
    }
  }
}
</style>
