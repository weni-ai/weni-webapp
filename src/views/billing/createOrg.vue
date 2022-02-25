<template>
  <container type="full" :class="['create-org', `flow-${flow}`]">
    <billing-container
      v-show="page === 'plans'"
      :title="$t(title)"
      :subtitle="$t(subtitle, { plan })"
    >
      <slot slot="content">
        <div class="plans-container">
          <billing-card
            type="free"
            :flow="flow"
            :buttonAction="() => onChoosePlan('free')"
            :buttonLoading="creatingPlan === 'free'"
            :buttonDisabled="creatingPlan === 'enterprise'"
            :active-contacts-limit="activeContactsLimit.free"
          />
          <billing-card
            type="paid"
            hasIntegration
            @togglePriceModal="togglePriceModal"
            :buttonAction="() => onChoosePlan('enterprise')"
            :buttonLoading="creatingPlan === 'enterprise'"
            :buttonDisabled="creatingPlan === 'free'"
            :pricing-ranges="activeContactsPricingRanges"
            :extra-whatsapp-price="extraWhatsappPrice"
            :active-contacts-limit="activeContactsLimit.paid"
          />
          <billing-card type="custom" @top="onNextStep" />
        </div>
      </slot>
    </billing-container>

    <BillingModalPrice
      v-if="isOpenModalPrice"
      @togglePriceModal="togglePriceModal"
      :ranges="activeContactsPricingRanges"
    />

    <BillingAddCreditCard
      :flow="flow"
      v-show="page === 'card'"
      :errors.sync="errors"
      :pricing-ranges="activeContactsPricingRanges"
      :extra-whatsapp-price="extraWhatsappPrice"
      :active-contacts-limit="activeContactsLimit.paid"
      @close="$emit('close')"
      @toggle-price-modal="togglePriceModal"
    />

    <BillingFormAddress
      :flow="flow"
      :show-close="showClose"
      v-show="page === 'address'"
      :pricing-ranges="activeContactsPricingRanges"
      :extra-whatsapp-price="extraWhatsappPrice"
      :active-contacts-limit="activeContactsLimit.paid"
      @close="$emit('close')"
      @confirm-card-setup="confirmCardSetup"
      @toggle-price-modal="togglePriceModal"
    />

    <billing-container v-show="page === 'success'">
      <slot slot="content">
        <div class="billing-choosed-plan">
          <img
            class="billing-choosed-plan__image"
            src="../../assets/choosedPlan.svg"
            alt="Plano escolhido"
          />

          <h1 class="billing-choosed-plan__title">
            {{ $t(`billing.success.flows.${flow}.title`) }}
          </h1>
          <p class="billing-choosed-plan__subtitle">
            {{ $t(`billing.success.flows.${flow}.description`) }}
            <emoji name="Smiling Face with Smiling Eyes" />
          </p>

          <unnnic-button
            @click="
              flow === 'create-org'
                ? $router.push({
                    name: 'projects',
                    params: { orgUuid: currentOrg.uuid },
                  })
                : $router.push({
                    name: 'billing',
                    params: { orgUuid: currentOrg.uuid },
                  })
            "
          >
            {{ $t('billing.success.action') }}

            <unnnic-icon-svg
              icon="keyboard-arrow-right-1"
              size="md"
              scheme="neutral-snow"
            />
          </unnnic-button>
        </div>
      </slot>
    </billing-container>
  </container>
</template>

<script>
import Container from '@/views/projects/container.vue';
import BillingContainer from '@/views/billing/billingContainer.vue';
import BillingCard from '@/components/billing/Card.vue';
import BillingModalPrice from '@/components/billing/ModalPrice.vue';
import BillingAddCreditCard from '@/views/billing/addCreditCard.vue';
import BillingFormAddress from '@/views/billing/formAddress.vue';
import Emoji from '@/components/Emoji.vue';
import { mapActions, mapState, mapGetters } from 'vuex';

const stripeGroupsErrors = {
  unknown: [
    'fraudulent',
    'stolen_card',
    'generic_decline',
    'do_not_try_again',
    'do_not_honor',
    'call_issuer',
    'no_action_taken',
    'merchant_blacklist',
    'lost_card',
    'service_not_allowed',
    'security_violation',
    'revocation_of_authorization',
    'revocation_of_all_authorizations',
    'restricted_card',
    'reenter_transaction',
    'try_again_later',
    'transaction_not_allowed',
    'stop_payment_order',
  ],

  lack_of_pin: ['online_or_offline_pin_required', 'offline_pin_required'],

  invalid_account: ['new_account_information_available', 'invalid_account'],
};

export default {
  props: {
    showClose: Boolean,
  },

  data() {
    return {
      isOpenModalPrice: false,
      paidButton: false,

      errors: {
        cpfOrCnpj: '',
        name: '',
      },

      creatingPlan: null,

      clientSecret: null,
      token: null,
      cardNumber: null,
      cardExpiry: null,
      cardCvc: null,

      activeContactsPricingRanges: [],
      extraWhatsappPrice: 0,
      activeContactsLimit: {
        free: 0,
        paid: 0,
      },
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
      extraWhatsappIntegrations: (state) => state.BillingSteps.integrations,
    }),

    flow() {
      /*
        [
          'create-org',
          'change-plan',
          'add-credit-card',
          'change-credit-card',
        ]
      */
      return this.$store.state.BillingSteps.flow;
    },

    page() {
      const pages = {
        plans: '/plans',
        card: '/card',
        address: '/address',
        success: '/success',
      };

      return Object.keys(pages).find((key) =>
        new RegExp(`${pages[key]}/?$`).test(this.$route.path),
      );
    },

    hasAlreadyCreditCard() {
      return this.currentOrg?.organization_billing?.card_brand;
    },

    extraIntegration() {
      return this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations
        ? Number(this.extraWhatsappIntegrations)
        : 0;
    },

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

  created() {
    if (!this.flow) {
      this.$router.push({
        name: 'billing',
      });
    }
  },

  mounted() {
    this.fetchBillingPricing();
    this.fetchActiveContactsLimitForFree();

    this.$store.state.BillingSteps.billing_details.cpfOrCnpj = '';
    this.$store.state.BillingSteps.billing_details.name = '';
    this.$store.state.BillingSteps.billing_details.additionalInformation = '';

    if (this.currentOrg?.extra_integration) {
      this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations = true;
      this.$store.state.BillingSteps.integrations = String(
        this.currentOrg.extra_integration,
      );
    } else {
      this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations = false;
      this.$store.state.BillingSteps.integrations = '1';
    }

    this.$store.state.BillingSteps.billing_details.address.city = '';
    this.$store.state.BillingSteps.billing_details.address.country = '';
    this.$store.state.BillingSteps.billing_details.address.state = '';
    this.$store.state.BillingSteps.billing_details.address.line1 = '';
    this.$store.state.BillingSteps.billing_details.address.postal_code = '';

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
      'getOrg',
      'setCurrentOrg',
      'createProject',
      'nextBillingStep',
      'setBillingStep',
      'finishBillingSteps',
      'setupIntent',
      'openModal',
      'changeOrganizationPlan',
      'saveOrganizationAdditionalInformation',
      'createRequestPermission',
      'billingPricing',
      'activeContactsLimitForFree',
    ]),

    organizationChanged() {
      this.reloadCurrentOrg();
    },

    creditCardChanged() {
      this.reloadCurrentOrg(3);
    },

    sleep(seconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1e3);
      });
    },

    async reloadCurrentOrg(secondsDelay = 0) {
      await this.sleep(secondsDelay);

      try {
        const { data: org } = await this.getOrg({
          uuid: this.$route.params.orgUuid,
        });

        this.setCurrentOrg(org);
      } catch (error) {
        console.log(error);
        this.$router.push({ name: 'orgs' });
      }
    },

    async fetchBillingPricing() {
      try {
        const {
          data: { range, extra_whatsapp_integration },
        } = await this.billingPricing();

        this.activeContactsPricingRanges = range;
        this.extraWhatsappPrice = extra_whatsapp_integration;

        this.activeContactsLimit.paid = this.activeContactsPricingRanges?.find(
          ({ from }) => from === 1,
        )?.to;
      } catch (error) {
        console.log('error', error);
      }
    },

    async fetchActiveContactsLimitForFree() {
      try {
        const {
          data: { active_contacts_limit },
        } = await this.activeContactsLimitForFree();

        this.activeContactsLimit.free = active_contacts_limit;
      } catch (error) {
        console.log('error', error);
      }
    },

    addMember({ email, role }) {
      return this.createRequestPermission({
        organizationUuid: this.currentOrg.uuid,
        email,
        role,
      });
    },

    async onChoosePlan(type) {
      try {
        if (!this.currentOrg?.uuid) {
          this.creatingPlan = type;

          await this.createOrg('free');
          await this.createProject();

          await Promise.all(
            this.users
              .filter(({ email }) => email !== this.profile.email)
              .map(this.addMember),
          );

          this.creatingPlan = null;
        }

        if (type === 'enterprise') {
          if (this.hasAlreadyCreditCard) {
            const changes = [];

            if (this.currentOrg.organization_billing.plan !== 'enterprise') {
              changes.push([this.changePlanToEnterprise]);
            }

            if (this.currentOrg.extra_integration !== this.extraIntegration) {
              changes.push([
                this.saveOrganizationAdditionalInformation,
                {
                  organizationUuid: this.currentOrg.uuid,
                  extra_integration: this.extraIntegration,
                },
              ]);
            }

            await Promise.all(changes.map(([func, ...args]) => func(...args)));

            if (changes.length) {
              this.organizationChanged();
            }

            this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/success`);
          } else {
            this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/card`);
          }
        } else {
          this.$router.push(`/orgs/${this.currentOrg.uuid}/billing/success`);
        }
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

    onNextStep() {
      this.current++;
    },

    togglePriceModal() {
      this.isOpenModalPrice = !this.isOpenModalPrice;
    },

    async changePlanToEnterprise() {
      await this.changeOrganizationPlan({
        organizationUuid: this.currentOrg.uuid,
        plan: 'enterprise',
      });
    },

    async confirmCardSetup() {
      const stripeConfirmSetupButton = document.querySelector(
        '#stripe-confirm-setup-button',
      );

      stripeConfirmSetupButton.setAttribute('disabled', true);

      try {
        const idValue = this.billing_details.cpfOrCnpj.replace(/[^\d]/g, '');

        if (!idValue) {
          throw {
            type: 'cpf_or_cnpj_required',
          };
        }

        if (!this.billing_details.name) {
          throw { type: 'name_required' };
        }

        await this.saveOrganizationAdditionalInformation({
          organizationUuid: this.currentOrg.uuid,
          personal_identification_number: idValue,
          additional_billing_info: this.billing_details.additionalInformation,
          extra_integration: this.extraIntegration,
        });

        const response = await this.$stripe.confirmCardSetup(
          this.clientSecret,
          {
            payment_method: {
              card: this.cardNumber,
              billing_details: {
                name: this.billing_details.name,
                address: {
                  country: this.billing_details.address.country,
                  state: this.billing_details.address.state,
                  city: this.billing_details.address.city,
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
          this.creditCardChanged();

          if (['create-org', 'change-plan'].includes(this.flow)) {
            await this.changePlanToEnterprise();
            this.organizationChanged();
            this.$router.push(
              `/orgs/${this.$route.params.orgUuid}/billing/success`,
            );
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

            this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing`);
          }
        }
      } catch (error) {
        const errorCode = error?.code;

        if (Object.values(stripeGroupsErrors).flat().includes(errorCode)) {
          const errorKey = Object.keys(stripeGroupsErrors).find((key) =>
            stripeGroupsErrors[key].includes(errorCode),
          );

          this.openModal({
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-red',
              title: this.$t(`billing.stripe.errors.groups.${errorKey}.title`),
              description: this.$t(
                `billing.stripe.errors.groups.${errorKey}.description`,
              ),
            },
          });

          this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/card`);
        } else if (
          Object.keys(
            require('../../locales/en').billing.stripe.errors,
          ).includes(errorCode)
        ) {
          this.openModal({
            type: 'alert',
            data: {
              icon: 'alert-circle-1',
              scheme: 'feedback-red',
              title: this.$t(`billing.stripe.errors.${errorCode}.title`),
              description: this.$t(
                `billing.stripe.errors.${errorCode}.description`,
              ),
            },
          });

          this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/card`);
        } else if (error?.type === 'validation_error') {
          this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/card`);
        } else if (error?.type === 'cpf_or_cnpj_required') {
          this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/card`);
          this.errors.cpfOrCnpj = 'required';
        } else if (error?.type === 'cpf_or_cnpj_invalid') {
          this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/card`);
          this.errors.cpfOrCnpj = 'cpf_or_cnpj_invalid';
        } else if (error?.type === 'name_required') {
          this.$router.push(`/orgs/${this.$route.params.orgUuid}/billing/card`);
          this.errors.name = 'required';
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
    Container,
    BillingContainer,
    BillingCard,
    BillingModalPrice,
    BillingAddCreditCard,
    BillingFormAddress,
    Emoji,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.create-org {
  background-color: $unnnic-color-background-sky;

  ::v-deep {
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
}

.plans-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20.75rem, 1fr));
  gap: $unnnic-spacing-inline-sm;
}

.create-org ::v-deep {
  .container {
    .credit-card-container,
    .address-container {
      display: flex;
      flex-wrap: wrap-reverse;
      gap: $unnnic-spacing-inline-sm;

      .billing-card-container {
        min-width: 20.75rem;
        flex: 4;
      }

      .card-form {
        min-width: 31.6875rem;
        flex: 6;
      }
    }
  }
}

.billing-choosed-plan {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 42.625rem;
  margin: 0 auto;

  &__title {
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-regular;
    color: $unnnic-color-neutral-darkest;
    margin-top: $unnnic-spacing-stack-lg;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  &__subtitle {
    color: $unnnic-color-neutral-cloudy;
    text-align: center;
    max-width: 682px;
    margin-bottom: $unnnic-spacing-stack-lg;
  }
}

.create-org ::v-deep .container .content {
  flex: initial;
  max-width: 72rem;
  margin: 0 auto;
  position: relative;

  .close {
    position: absolute;
    top: $unnnic-spacing-inset-lg;
    right: $unnnic-spacing-inset-lg;
  }
}

.create-org.flow-change-credit-card,
.create-org.flow-add-credit-card {
  ::v-deep {
    .container .content {
      max-width: 46rem;

      .header .subtitle {
        grid-column: 1 / span 12;
      }

      .credit-card-container,
      .address-container {
        display: grid;
        grid-template-columns: repeat(12, 1fr);

        .card-form {
          grid-column: 2 / span 10;
        }
      }
    }
  }
}
</style>
