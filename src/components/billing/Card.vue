<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :class="[
      'billing-card',
      `billing-card--${type}`,
      { 'billing-card--recommended': recommended, disabled },
    ]"
  >
    <div
      v-if="recommended"
      class="billing-card__chip"
    >
      {{ $t('billing.payment.plans.recommended') }}
    </div>

    <h1 class="billing-card__title">
      {{ title }}
    </h1>

    <div class="description">
      {{ description }}
    </div>

    <div
      class="pre-features"
      v-if="['advanced', 'enterprise'].includes(type) && showSameAsScaleText"
    >
      {{ $t('billing.payment.plans.features.scale_and') }}
    </div>

    <ul class="billing-list-beneficits">
      <li
        v-for="(option, index) in options"
        :key="index"
        class="billing-list-beneficits__item"
      >
        <UnnnicIconSvg
          icon="check-2"
          size="sm"
          :scheme="disabled ? 'neutral-cloudy' : 'auto'"
        />
        <span class="billing-list-beneficits__item__title">
          {{ option.title }}
        </span>
      </li>
    </ul>

    <div :class="['billing-price footer']">
      <template v-if="['trial', 'start', 'scale', 'advanced'].includes(type)">
        <div>
          <span class="billing-price__currency">R$&nbsp;</span>
          <span class="billing-price__price">
            {{ formatPrice(price) }}
          </span>
        </div>
      </template>

      <template v-else-if="['enterprise'].includes(type)">
        <div>
          <span class="billing-price__price">{{ $t('upon_request') }}</span>
        </div>
      </template>

      <p class="billing-price__info">
        {{ attendencesFrom ? $t('billing.from') : $t('billing.up_to') }}

        <span class="billing-price__info__hightlight">
          <UnnnicToolTip
            :text="$t('billing.attendences_info')"
            enabled
            side="bottom"
            maxWidth="280px"
          >
            {{ attendencesFrom || attendences }}

            <template v-if="type === 'trial'">
              {{ $t('billing.attendences_for_1_month') }}
            </template>

            <template v-else-if="type === 'enterprise'">
              {{ $t('billing.attendences') }}
            </template>

            <template v-else-if="type === 'advanced'">
              {{ $t('billing.invoices.active_contacts').toLowerCase() }}
              /{{ $t('month') }}
            </template>

            <template v-else>
              {{ $t('billing.attendences_by_month') }}
            </template>
          </UnnnicToolTip>
        </span>
      </p>
    </div>

    <div
      v-if="!hideSelect"
      class="billing-buttons"
    >
      <div class="buttons">
        <UnnnicButton
          v-if="type === 'enterprise'"
          @click.prevent="redirectWhatsapp"
          type="primary"
          class="select-plan-button"
        >
          {{ $t('billing.payment.contact_specialist') }}
        </UnnnicButton>

        <UnnnicButton
          v-else
          :loading="buttonLoading"
          :disabled="buttonDisabled || disabled || currentPlan"
          type="primary"
          class="select-plan-button"
          @click.prevent="isModalAddCreditCardOpen = true"
        >
          <template
            v-if="
              (flow === 'change-plan' && organizationPlan === type) ||
              currentPlan
            "
          >
            {{ $t('billing.current_plan') }}
          </template>

          <template v-else>
            {{
              $t(
                `billing.payment.plans.buttons.${
                  type === 'trial' ? 'free_to_play' : 'choose'
                }`,
              )
            }}
          </template>
        </UnnnicButton>
      </div>
    </div>

    <div
      v-if="
        ['trial', 'start', 'scale'].includes(type) ||
        (['advanced', 'enterprise'].includes(type) && !showSameAsScaleText)
      "
      @click="$emit('update:expanded', !expanded)"
      class="show-more"
    >
      <UnnnicIcon
        :icon="`arrow-button-${expanded ? 'up' : 'down'}-1`"
        scheme="neutral-dark"
        size="xs"
      />

      {{
        $t(`billing.payment.plans.features.view_${expanded ? 'less' : 'more'}`)
      }}
    </div>

    <ModalAddCreditCard
      v-if="isModalAddCreditCardOpen"
      @close="isModalAddCreditCardOpen = false"
      :scheme="scheme"
      :name="$t(`billing.payment.plans.${type}.title`)"
      :price="`R$ ${formatPrice(price)}`"
      @complete="onAddedCreditCard"
      @error="isModalAddCreditCardFailOpen = true"
    />

    <UnnnicModal
      v-if="isModalAddCreditCardSuccessOpen"
      @close="isModalAddCreditCardSuccessOpen = false"
      :text="$t('billing.verify_credit_card.verified.title')"
      modalIcon="check_circle"
      scheme="aux-green-500"
    >
      {{ $t('billing.verify_credit_card.verified.info') }}

      <br />

      <UnnnicButton
        class="button-modal-action"
        @click.prevent="onComplete"
      >
        {{ $t('buttons.next') }}
      </UnnnicButton>
    </UnnnicModal>

    <UnnnicModal
      v-if="isModalAddCreditCardFailOpen"
      @close="isModalAddCreditCardFailOpen = false"
      :text="$t('billing.verify_credit_card.fail.title')"
      modalIcon="alert-circle-1"
      scheme="aux-red-500"
    >
      {{ $t('billing.verify_credit_card.fail.info') }}

      <br />

      <UnnnicButton
        class="button-modal-action"
        @click.prevent="isModalAddCreditCardFailOpen = false"
      >
        {{ $t('buttons.back') }}
      </UnnnicButton>
    </UnnnicModal>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import orgs from '../../api/orgs';
import ModalAddCreditCard from './ModalAddCreditCard.vue';

export default {
  components: {
    ModalAddCreditCard,
  },

  props: {
    type: {
      type: String,
      validator: (val) =>
        ['trial', 'start', 'scale', 'advanced', 'enterprise'].includes(val),
    },

    flow: String,

    currentPlan: Boolean,

    buttonLoading: {
      type: Boolean,
      default: false,
    },

    buttonDisabled: Boolean,

    pricingRanges: {
      type: Array,
    },

    extraWhatsappPrice: {
      type: Number,
    },

    hideSelect: Boolean,

    recommended: Boolean,

    disabled: Boolean,

    expanded: Boolean,

    showSameAsScaleText: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters(['currentOrg']),
    ...mapState({
      integrationsAmount: (state) => state.BillingSteps.integrations,
    }),

    scheme() {
      return {
        trial: 'aux-blue-500',
        start: 'weni-600',
        scale: 'aux-orange-500',
        advanced: 'aux-purple-500',
        enterprise: 'aux-green-500',
      }[this.type];
    },

    plan() {
      const allPlans = this.$store.state.BillingSteps.pricing.plans;
      return allPlans[this.type];
    },

    price() {
      if (typeof this.plan?.price === 'number') {
        return this.plan.price * 100;
      }

      return 0;
    },

    attendencesFrom() {
      const allPlans = this.$store.state.BillingSteps.pricing.plans;

      if (this.plan?.limit === 'limitless') {
        const maxAttendences = Math.max(
          ...Object.keys(allPlans)
            .map((plan) => allPlans[plan].limit)
            .filter((value) => typeof value === 'number'),
        );

        return maxAttendences + 1;
      }

      return null;
    },

    attendences() {
      if (!this.plan) {
        return 100;
      }

      return this.plan.limit === 'limitless' ? null : this.plan.limit;
    },

    basePriceRange() {
      return this.pricingRanges?.find(({ from }) => from === 1);
    },

    getPaidPrice() {
      if (this.basePriceRange) {
        return (
          this.basePriceRange.to * this.basePriceRange.value_per_contact +
          this.extraWhatsappPrice *
            (this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations
              ? this.integrationsAmount
              : 0)
        );
      }

      return 0;
    },

    disableRemoveNewIntegrationButton() {
      return this.integrationsAmount == 1;
    },

    disableAddNewIntegrationButton() {
      return this.integrationsAmount == 10;
    },

    organizationPlan() {
      return this.currentOrg?.organization_billing?.plan;
    },

    defaultFeatures() {
      return ['artificial_intelligence', 'oficial_whatsapp', 'channels'].concat(
        this.expanded
          ? [
              'unlimited_agents',
              'unlimited_campaigns',
              'unlimited_flows',
              'community',
              'apis',
              'academy',
            ]
          : [],
      );
    },

    options() {
      const plans = {
        trial: this.defaultFeatures,
        start: this.defaultFeatures,
        scale: this.defaultFeatures,
        advanced: ['email_support', 'one_manager', 'six_hours_with_an_expert'],
        enterprise: (this.showSameAsScaleText
          ? []
          : this.defaultFeatures
        ).concat([
          'all_time_support',
          'eight_hours_with_an_expert',
          'security_monitoring',
        ]),
      };

      return plans[this.type].map((feature) => ({
        title: this.$t(`billing.payment.plans.features.${feature}.title`),
        info: this.$t(`billing.payment.plans.features.${feature}.info`),
      }));
    },

    title() {
      return this.$t(`billing.payment.plans.${this.type}.title`);
    },

    description() {
      return this.$t(`billing.payment.plans.${this.type}.description`);
    },
  },

  data() {
    return {
      isAddAcessCodeVisible: false,
      accessCode: '',

      isModalAddCreditCardOpen: false,
      isModalAddCreditCardSuccessOpen: false,
      isModalAddCreditCardFailOpen: false,
    };
  },

  mounted() {
    if (this.currentOrg?.extra_integration) {
      const extraIntegration = this.currentOrg?.extra_integration;

      if (extraIntegration > 0) {
        this.$store.state.BillingSteps.isActiveNewWhatsappIntegrations = true;
        this.$store.state.BillingSteps.integrations = String(extraIntegration);
      }
    }

    if (this.$store.state.BillingSteps.pricing.status === null) {
      this.$store.state.BillingSteps.pricing.status = 'loading';

      orgs.plansPricing().then(({ data }) => {
        this.$store.state.BillingSteps.pricing.status = 'loaded';

        this.$store.state.BillingSteps.pricing.plans = data.plans;
      });
    }
  },

  methods: {
    ...mapActions(['addIntegration', 'removeIntegration']),

    onAddedCreditCard() {
      this.isModalAddCreditCardOpen = false;
      this.isModalAddCreditCardSuccessOpen = true;
    },

    onComplete() {
      this.isModalAddCreditCardSuccessOpen = false;

      this.$router.push({
        name: 'billing',
        params: {
          orgUuid: this.$route.params.orgUuid,
        },
      });
    },

    redirectWhatsapp() {
      window.open('https://wa.me/558230225978', '_blank').focus();
    },
    formatPrice(price) {
      if (price === 0) {
        return price;
      }

      let ponctuation = '.';

      if (this.$i18n.locale === 'pt-br') {
        ponctuation = ',';
      }

      return `${Math.floor(price / 100)}${ponctuation}${String(price).substr(
        -2,
      )}`;
    },
  },
};
</script>

<style scoped lang="scss">
.billing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  color: black;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-lg;

  padding: $unnnic-spacing-md;
  min-height: 29.875rem;
  box-sizing: border-box;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thin;
  outline-offset: -$unnnic-border-width-thin;

  $plan-colors: 'trial' $unnnic-color-aux-blue-500,
    'scale' $unnnic-color-aux-orange-500,
    'advanced' $unnnic-color-aux-purple-500,
    'enterprise' $unnnic-color-aux-green-500,
    'recommended' $unnnic-color-weni-600;

  @each $name, $color in $plan-colors {
    &--#{$name} {
      outline-color: $color;

      .billing-price {
        color: $color;
      }

      .billing-list-beneficits .unnnic-icon-scheme--auto :deep(.primary) {
        fill: $color;
      }

      .billing-price__info__hightlight {
        font-weight: $unnnic-font-weight-bold;
        color: $color;
      }

      .select-plan-button:not([disabled]) {
        background-color: $color;
      }
    }
  }

  &--recommended {
    background-color: $unnnic-color-weni-50;
  }

  &__chip {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-white;

    background-color: $unnnic-color-weni-600;

    padding: $unnnic-spacing-nano $unnnic-spacing-giant;

    border-radius: $unnnic-border-radius-pill;

    user-select: none;
  }

  &__title {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-black;
    margin-bottom: $unnnic-spacing-ant;
    text-align: start;
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-neutral-dark;

    .unnnic-tag {
      display: inline-flex;
      width: max-content;
      margin-left: $unnnic-spacing-inline-sm;
      user-select: none;
    }
  }

  .description {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
    margin-bottom: $unnnic-spacing-ant;
  }

  .pre-features {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
    margin-bottom: $unnnic-spacing-nano;
  }

  .billing-list-beneficits {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: $unnnic-spacing-stack-lg;

    &__item {
      display: flex;
      align-items: center;
      margin-bottom: $unnnic-spacing-nano;

      &__title {
        margin-left: $unnnic-spacing-xs;

        color: $unnnic-color-neutral-dark;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;
      }
    }
  }

  .billing-switch {
    display: flex;
    align-items: center;
    margin-top: $unnnic-spacing-stack-sm;
    > span {
      font-size: $unnnic-font-size-body-md;
    }
  }

  .billing-add-integration {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $unnnic-spacing-stack-xs;

    > button,
    .unnnic-form {
      width: 100%;
      max-width: 87px;
    }

    .unnnic-form {
      margin: 0 8px;
    }
  }

  .billing-price {
    > div {
      display: flex;
      align-items: center;
    }

    &__currency {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }

    &__price {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-lg;
      line-height: $unnnic-font-size-title-lg + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-black;
    }

    &__info {
      margin: 0;
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  .footer {
    margin-top: auto;
  }

  .billing-buttons {
    text-align: center;
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;

    margin-top: $unnnic-spacing-ant;

    .buttons {
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-stack-xs;
    }

    button {
      width: 100%;
    }

    div {
      p {
        margin: 0;
      }
    }

    &__paid {
      span {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    &__custom {
      &__access-code {
        text-decoration: underline;
        cursor: pointer;
      }

      > div {
        button:first-child {
          margin-bottom: $unnnic-spacing-stack-xs;
        }
      }

      &__form {
        display: flex;
        flex-direction: column;

        > div:last-child {
          display: flex;
          margin-top: $unnnic-spacing-stack-md;

          button:first-child {
            margin-right: $unnnic-spacing-stack-sm;
          }
        }
      }
    }
  }

  .show-more {
    margin-top: $unnnic-spacing-ant;
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-stack-xs;
    cursor: pointer;
    user-select: none;
    width: max-content;
  }

  @media screen and (max-width: 1150px) {
    .billing-switch {
      align-items: flex-start;
    }
  }
}

.button-modal-action {
  margin-top: $unnnic-spacing-md;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
}
</style>
