<template>
  <div :class="['create-org', `flow-${flow}`]">
    <modal
      type="billing"
      :show-close="showClose"
      v-show="current === 0 || current === 'plans'"
      :title="$t(title)"
      :subtitle="$t(subtitle, { plan })"
      @close="$emit('close')"
    >
      <slot slot="content">
        <div class="plans-container">
          <billing-card
            type="free"
            :flow="flow"
            :buttonAction="() => onChoosePlan('free')"
            :buttonLoading="creatingPlan === 'free'"
            :buttonDisabled="creatingPlan === 'enterprise'"
          />
          <billing-card
            type="paid"
            hasIntegration
            @togglePriceModal="togglePriceModal"
            :buttonAction="() => onChoosePlan('enterprise')"
            :buttonLoading="creatingPlan === 'enterprise'"
            :buttonDisabled="creatingPlan === 'free'"
          />
          <billing-card type="custom" @top="onNextStep" />
        </div>
      </slot>
    </modal>

    <BillingModalPrice
      :isOpenModal="isOpenModalPrice"
      @togglePriceModal="togglePriceModal"
    />

    <BillingAddCreditCard
      :flow="flow"
      :show-close="showClose"
      v-show="current === 1 || current === 'credit-card'"
      @close="$emit('close')"
    />

    <BillingFormAddress
      :flow="flow"
      :show-close="showClose"
      v-show="current === 2"
      @close="$emit('close')"
      @confirm-card-setup="confirmCardSetup"
    />

    <ChoosedPlan
      v-if="current === 3 || current === 'success'"
      :flow="flow"
      :show-close="showClose"
      :type="typePlan"
      @close="$emit('close')"
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
import Modal from '@/components/external/Modal.vue';
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

    showClose: Boolean,
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
      users: (state) => state.BillingSteps.users,
      billing_details: (state) => state.BillingSteps.billing_details,
      profile: (state) => state.Account.profile,
    }),

    plan() {
      return this.currentOrg?.organization_billing?.plan;
    },

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
      'changeOrganizationPlan',
      'saveOrganizationAdditionalInformation',
      'createRequestPermission',
    ]),

    addMember({ email, role }) {
      return this.createRequestPermission({
        organizationUuid: this.currentOrg.uuid,
        email,
        role,
      });
    },

    async onChoosePlan(type) {
      if (!this.currentOrg?.uuid) {
        this.creatingPlan = type;

        await this.createOrg('free');
        await this.createProject();

        await Promise.all(
          this.users
            .filter(({ email }) => email !== this.profile.email)
            .map(this.addMember),
        );

        // if (!this.organizationCreationError) await this.createProject();
        // if (!this.projectCreationError) this.finishBillingSteps();

        this.creatingPlan = null;
      }

      if (type === 'enterprise') {
        if (this.currentOrg?.organization_billing?.card_brand) {
          await this.changePlanToEnterprise();
        } else {
          this.setBillingStep('credit-card');
        }
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

    async changePlanToEnterprise() {
      try {
        await this.changeOrganizationPlan({
          organizationUuid: this.currentOrg.uuid,
          plan: 'enterprise',
        });

        this.$emit('organization-changed');

        this.setBillingStep('success');
      } catch (error) {
        console.log(error);

        this.openModal({
          type: 'alert',
          data: {
            icon: 'alert-circle-1',
            scheme: 'feedback-yellow',
            title: this.$t('alerts.server_problem.title'),
            description: this.$t('alerts.server_problem.description'),
          },
        });

        setTimeout(() => {
          this.$emit('close');
        });
      }
    },

    async confirmCardSetup() {
      const stripeConfirmSetupButton = document.querySelector(
        '#stripe-confirm-setup-button',
      );

      stripeConfirmSetupButton.setAttribute('disabled', true);

      try {
        const idValue = this.billing_details.cpfOrCnpj.replace(/[^\d]/g, '');
        const idAttribute = idValue.length === 11 ? 'CPF' : 'CNPJ';

        if (![11, 14].includes(idValue.length)) {
          throw {
            type: 'cpf_or_cnpj_invalid',
          };
        }

        await this.saveOrganizationAdditionalInformation({
          organizationUuid: this.currentOrg.uuid,
          [idAttribute]: idValue,
          additionalInformation: this.billing_details.additionalInformation,
        });

        const response = await this.$stripe.confirmCardSetup(
          this.clientSecret,
          {
            payment_method: {
              card: this.cardNumber,
              billing_details: {
                name: this.billing_details.name,
                address: {
                  country: this.billing_details.address.country || 'BR',
                  state: this.billing_details.address.state || 'just for test',
                  city: this.billing_details.address.city || 'just for test',
                  line1: this.billing_details.address.line1,
                  postal_code: this.billing_details.address.postal_code,
                },
              },
            },
          },
        );

        if (response.error) {
          throw response.error;
        } else {
          this.$emit('credit-card-changed');

          if (['create-org', 'change-plan'].includes(this.flow)) {
            await this.changePlanToEnterprise();
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
            });
          }
        }
      } catch (error) {
        console.log('error', error);

        if (error?.type === 'validation_error') {
          this.setBillingStep('credit-card');
        } else if (error?.type === 'cpf_or_cnpj_invalid') {
          this.setBillingStep('credit-card');
        } else {
          this.openModal({
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-yellow',
              title: this.$t('alerts.server_problem.title'),
              description: this.$t('alerts.server_problem.description'),
            },
          });
        }
      } finally {
        stripeConfirmSetupButton.removeAttribute('disabled');
      }
    },
  },
  components: {
    BillingCard,
    BillingModal,
    ChoosedPlan,
    BillingModalPrice,
    BillingAddCreditCard,
    BillingFormAddress,
    Modal,
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

.plans-container {
  display: flex;
  gap: $unnnic-spacing-inline-sm;
}

.create-org ::v-deep {
  .modal.billing .container {
    .credit-card-container,
    .address-container {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: $unnnic-spacing-inline-sm;

      .billing-card-container {
        grid-column: 2 / span 4;
      }

      .card-form {
        grid-column: 6 / span 6;
      }
    }
  }
}

.create-org.flow-change-credit-card,
.create-org.flow-add-credit-card {
  ::v-deep {
    .modal.billing .container {
      width: 46rem;
      min-width: 46rem;

      .header .subtitle {
        grid-column: 1 / span 12;
      }

      .credit-card-container,
      .address-container {
        .card-form {
          grid-column: 2 / span 10;
        }
      }
    }
  }
}
</style>
