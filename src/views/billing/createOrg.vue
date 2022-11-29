<template>
  <container type="full" :class="['create-org', `flow-${flow}`]">
    <div v-if="loadingPricing && page === 'plans'" class="loading-plans">
      <div class="header">
        <unnnic-skeleton-loading height="5.5rem" width="65%" />
      </div>

      <div class="plans-container">
        <unnnic-skeleton-loading v-for="i in 3" :key="i" height="31.25rem" />
      </div>
    </div>

    <billing-container
      v-show="page === 'plans' && !loadingPricing"
      :title="$t(title)"
      :subtitle="$t(subtitle, { plan })"
    >
      <slot slot="content">
        <div
          :style="{
            display: 'grid',
            alignItems: 'center',
            columnGap: '24px',
            gridTemplateColumns: '[left] 40px [content] 1fr [right] 40px',
          }"
        >
          <unnnic-icon
            v-if="!isCardTrialVisible"
            @click.native="goToCard('trial')"
            size="xl"
            icon="arrow-left-1-1"
            scheme="neutral-darkest"
            clickable
          />

          <div
            :style="{
              overflowX: 'hidden',
              display: 'grid',
              columnGap: '16px',
              scrollSnapType: 'x mandatory',
              gridTemplateColumns: 'repeat(5, calc((100% - 16px) / 2))',
              gridTemplateColumns: 'repeat(5, calc((100% - 32px) / 3))',
              gridColumn: 'content',
              scrollBehavior: 'smooth',
            }"
          >
            <billing-card
              :style="{ scrollSnapAlign: 'start' }"
              v-for="type in plans"
              :type="type"
              :key="type"
              @select="onChoosePlan(type)"
              :recommended="
                canChoose.includes('start')
                  ? type === 'start'
                  : type === canChoose[0]
              "
              :ref="`card-${type}`"
              :button-disabled="isSettingUpIntent"
              :flow="flow"
              :disabled="!canChoose.includes(type)"
              :expanded.sync="expanded"
            />
          </div>

          <unnnic-icon
            v-if="!isCardEnterpriseVisible"
            @click.native="goToCard('enterprise')"
            size="xl"
            icon="arrow-right-1-1"
            scheme="neutral-darkest"
            clickable
          />
        </div>
      </slot>
    </billing-container>

    <BillingModalPrice
      v-if="isOpenModalPrice"
      @togglePriceModal="togglePriceModal"
      :ranges="activeContactsPricingRanges"
    />

    <billing-add-credit-card
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
                ? afterCreateOrg()
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
import orgs from '../../api/orgs';

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
    'account_country_invalid_address',
    'account_error_country_change_requires_additional_steps',
    'account_invalid',
    'account_number_invalid',
    'acss_debit_session_incomplete',
    'alipay_upgrade_required',
    'amount_too_large',
    'amount_too_small',
    'api_key_expired',
    'balance_insufficient',
    'bank_account_declined',
    'bank_account_exists',
    'bank_account_unusable',
    'bank_account_unverified',
    'bank_account_verification_failed',
    'billing_invalid_mandate',
    'bitcoin_upgrade_required',
    'card_decline_rate_limit_exceeded',
    'cardholder_phone_number_required',
    'charge_already_captured',
    'charge_already_refunded',
    'charge_disputed',
    'charge_exceeds_source_limit',
    'charge_expired_for_capture',
    'charge_invalid_parameter',
    'clearing_code_unsupported',
    'country_code_invalid',
    'country_unsupported',
    'coupon_expired',
    'customer_max_payment_methods',
    'customer_max_subscriptions',
    'debit_not_authorized',
    'email_invalid',
    'idempotency_key_in_use',
    'incorrect_address',
    'instant_payouts_limit_exceeded',
    'instant_payouts_unsupported',
    'intent_invalid_state',
    'intent_verification_method_missing',
    'invalid_card_type',
    'invalid_characters',
    'invalid_charge_amount',
    'invalid_expiry_month',
    'invalid_source_usage',
    'invoice_no_customer_line_items',
    'invoice_no_payment_method_types',
    'invoice_no_subscription_line_items',
    'invoice_not_editable',
    'invoice_on_behalf_of_not_editable',
    'invoice_payment_intent_requires_action',
    'invoice_upcoming_none',
    'livemode_mismatch',
    'lock_timeout',
    'missing',
    'no_account',
    'not_allowed_on_standard_account',
    'out_of_inventory',
    'parameter_invalid_empty',
    'parameter_invalid_integer',
    'parameter_invalid_string_blank',
    'parameter_invalid_string_empty',
    'parameter_missing',
    'parameter_unknown',
    'parameters_exclusive',
    'payment_intent_action_required',
    'payment_intent_authentication_failure',
    'payment_intent_incompatible_payment_method',
    'payment_intent_invalid_parameter',
    'payment_intent_konbini_rejected_confirmation_number',
    'payment_intent_mandate_invalid',
    'payment_intent_payment_attempt_expired',
    'payment_intent_payment_attempt_failed',
    'payment_intent_unexpected_state',
    'payment_method_bank_account_already_verified',
    'payment_method_bank_account_blocked',
    'payment_method_billing_details_address_missing',
    'payment_method_currency_mismatch',
    'payment_method_invalid_parameter',
    'payment_method_invalid_parameter_testmode',
    'payment_method_microdeposit_failed',
    'payment_method_microdeposit_verification_amounts_invalid',
    'payment_method_microdeposit_verification_amounts_mismatch',
    'payment_method_microdeposit_verification_attempts_exceeded',
    'payment_method_microdeposit_verification_descriptor_code_mismatch',
    'payment_method_microdeposit_verification_timeout',
    'payment_method_provider_decline',
    'payment_method_provider_timeout',
    'payment_method_unactivated',
    'payment_method_unexpected_state',
    'payment_method_unsupported_type',
    'payouts_not_allowed',
    'platform_account_required',
    'platform_api_key_expired',
    'postal_code_invalid',
    'product_inactive',
    'rate_limit',
    'refer_to_customer',
    'refund_disputed_payment',
    'resource_already_exists',
    'resource_missing',
    'return_intent_already_processed',
    'routing_number_invalid',
    'secret_key_required',
    'sepa_unsupported_account',
    'setup_attempt_failed',
    'setup_intent_authentication_failure',
    'setup_intent_invalid_parameter',
    'setup_intent_setup_attempt_expired',
    'setup_intent_unexpected_state',
    'shipping_calculation_failed',
    'sku_inactive',
    'state_unsupported',
    'tax_id_invalid',
    'taxes_calculation_failed',
    'terminal_location_country_unsupported',
    'testmode_charges_only',
    'tls_version_unsupported',
    'token_already_used',
    'token_in_use',
    'transfers_not_allowed',
    'url_invalid',
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
      loadingPricing: false,

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

      isCardTrialVisible: false,
      isCardEnterpriseVisible: false,

      isSettingUpIntent: false,

      organizationPlan: null,

      expanded: false,
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

    plans() {
      if (this.flow === 'create-org') {
        return ['trial', 'start', 'enterprise'];
      }

      return ['trial', 'start', 'scale', 'advanced', 'enterprise'];
    },

    canChoose() {
      const allPlans = ['trial', 'start', 'scale', 'advanced', 'enterprise'];

      if (this.flow === 'change-plan') {
        return allPlans.slice(
          allPlans.indexOf(this.currentOrg?.organization_billing?.plan) + 1,
        );
      }

      return allPlans;
    },

    flow() {
      /*
        [
          'create-org',
          'change-plan',
          'add-credit-card',
          'change-credit-card',
        ]
      */

      if (this.$route.params.orgUuid === 'create') {
        return 'create-org';
      }

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

    ...mapGetters(['currentOrg', 'currentProject']),

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

  created() {
    if (!this.flow) {
      this.$router.push({
        name: 'billing',
      });
    }
  },

  async mounted() {
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

    this.registerView('trial', 'isCardTrialVisible');
    this.registerView('enterprise', 'isCardEnterpriseVisible');

    if (['add-credit-card', 'change-credit-card'].includes(this.flow)) {
      await this.createSetupIntentForAAlreadyCreatedOrg();
    }
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
      'nextBillingStep',
      'setBillingStep',
      'finishBillingSteps',
      'openModal',
      'closeModal',
      'saveOrganizationAdditionalInformation',
      'activeContactsLimitForFree',
    ]),

    async changeOrganizationPlan(plan) {
      await orgs.changeOrganizationPlan({
        organizationUuid: this.currentOrg.uuid,
        plan,
      });
    },

    registerView(plan, variable) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        let isIntersecting = false;

        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
        });

        this.$set(this, variable, isIntersecting);
      });

      this.intersectionObserver.observe(this.$refs[`card-${plan}`][0].$el);
    },

    goToCard(plan) {
      this.$refs[`card-${plan}`][0].$el.scrollIntoViewIfNeeded();
    },

    organizationChanged() {
      this.reloadCurrentOrg();
    },

    afterCreateOrg() {
      if (
        this.currentProject.project_type === 'template' &&
        this.currentProject.first_access
      ) {
        this.$router.push({
          name: 'push',
          params: {
            projectUuid: this.currentProject.uuid,
            internal: ['flow', 'editor', this.currentProject.flow_uuid],
          },
        });
      } else {
        this.$router.push({
          name: 'projects',
          params: { orgUuid: this.currentOrg.uuid },
        });
      }
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

    async onChoosePlan(type) {
      if (type === 'trial') {
        if (this.flow === 'change-plan') {
          this.isSettingUpIntent = true;

          await this.changeOrganizationPlan('trial');

          this.isSettingUpIntent = false;

          this.organizationChanged();

          this.$router.push({
            name: 'billing',
            params: {
              orgUuid: this.currentOrg.uuid,
            },
          });
        } else {
          this.$router.push({
            name: 'create_org',
            query: {
              plan: type,
            },
          });
        }

        return;
      }

      try {
        if (this.hasAlreadyCreditCard) {
          this.isSettingUpIntent = true;

          await this.changeOrganizationPlan(type);

          this.isSettingUpIntent = false;

          this.organizationChanged();

          this.$router.push({
            name: 'billing',
            params: {
              orgUuid: this.currentOrg.uuid,
            },
          });
          /* const changes = [];

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
          */
        } else if (this.flow === 'change-plan') {
          await this.createSetupIntentForAAlreadyCreatedOrg();

          this.$router.push(
            `/orgs/${this.currentOrg.uuid}/billing/card?plan=${type}`,
          );
        } else {
          await this.createSetupIntent();

          // this.setupIntent({ organizationUuid }).then((response) => {
          //   this.customer = response?.data?.customer;
          //   this.clientSecret = response?.data?.client_secret;
          // });
          this.$router.push(`/orgs/create/billing/card?plan=${type}`);
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

    async createSetupIntent() {
      this.isSettingUpIntent = true;
      const { data } = await orgs.setupIntent();

      this.$store.state.BillingSteps.billing_details.customer = data.customer;
      this.clientSecret = data.setup_intent.client_secret;
      this.isSettingUpIntent = false;
    },

    async createSetupIntentForAAlreadyCreatedOrg() {
      this.isSettingUpIntent = true;

      orgs
        .setupIntentWithOrg({ organizationUuid: this.$route.params.orgUuid })
        .then((response) => {
          this.$store.state.BillingSteps.billing_details.customer =
            response?.data?.customer;
          this.clientSecret = response?.data?.client_secret;
        })
        .finally(() => {
          this.isSettingUpIntent = false;
        });
    },

    onNextStep() {
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

      let modalVerificationCard = null;

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

        // await this.saveOrganizationAdditionalInformation({
        //   organizationUuid: this.currentOrg.uuid,
        //   personal_identification_number: idValue,
        //   additional_billing_info: this.billing_details.additionalInformation,
        //   extra_integration: this.extraIntegration,
        // });

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
          // this.creditCardChanged();

          modalVerificationCard = await this.openModal({
            type: 'alert',
            data: {
              persistent: true,
              icon: 'alert-circle-1',
              scheme: 'feedback-yellow',
              title: this.$t('billing.stripe.verification.title'),
              description: this.$t('billing.stripe.verification.description'),
            },
          });

          const { data: cardVerificaton } = await orgs.verifyCreditCard({
            customer: this.$store.state.BillingSteps.billing_details.customer,
          });

          if (
            cardVerificaton.cvc_check === 'pass' &&
            cardVerificaton.charge.response === true
          ) {
            this.closeModal(modalVerificationCard);
          } else {
            // show error modal
            this.closeModal(modalVerificationCard);
            this.openModal({
              type: 'alert',
              data: {
                icon: 'alert-circle-1',
                scheme: 'feedback-red',
                title: this.$t(`billing.stripe.errors.invalid_card.title`),
                description: this.$t(
                  `billing.stripe.errors.invalid_card.description`,
                ),
              },
            });
            return;
          }

          if (this.flow === 'create-org') {
            this.$router.push({
              name: 'create_org',
              query: {
                plan: this.$route.query.plan,
              },
            });
          } else if (['change-plan'].includes(this.flow)) {
            await orgs.changeOrganizationPlan({
              organizationUuid: this.currentOrg.uuid,
              plan: this.$route.query.plan,
            });

            this.organizationChanged();

            this.$router.push({
              name: 'billing',
              params: {
                orgUuid: this.currentOrg.uuid,
              },
            });
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

            this.$router.push({
              name: 'billing',
              params: {
                orgUuid: this.$route.params.orgUuid,
              },
            });

            this.organizationChanged();
          }
        }
      } catch (error) {
        console.log(error);
        if (modalVerificationCard) {
          this.closeModal(modalVerificationCard);
        }

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

          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
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

          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
        } else if (error?.type === 'validation_error') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
        } else if (error?.type === 'cpf_or_cnpj_required') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
          this.errors.cpfOrCnpj = 'required';
        } else if (error?.type === 'cpf_or_cnpj_invalid') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
          this.errors.cpfOrCnpj = 'cpf_or_cnpj_invalid';
        } else if (error?.type === 'name_required') {
          this.$router.push(
            `/orgs/${this.$route.params.orgUuid}/billing/card?plan=${this.$route.query.plan}`,
          );
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
  width: 100%;
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

.loading-plans {
  display: flex;
  flex-direction: column;
  max-width: 72rem;

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .plans-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20.75rem, 1fr));
    gap: 1rem;
  }
}
</style>
