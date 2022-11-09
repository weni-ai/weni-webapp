<template>
  <div :class="{ 'billing-card': true, bordered: recommended }">
    <h1 class="billing-card__title">
      {{ title }}

      <unnnic-tag
        v-if="recommended"
        scheme="aux-baby-blue"
        :text="$t('billing.payment.plans.recommended')"
        type="default"
      />
    </h1>

    <div class="description">
      {{ description }}
    </div>

    <ul class="billing-list-beneficits">
      <li
        v-for="(option, index) in options"
        :key="index"
        class="billing-list-beneficits__item"
      >
        <unnnic-icon-svg icon="check-2" size="sm" scheme="aux-blue" />
        <span class="billing-list-beneficits__item__title">
          {{ option.title }}
        </span>
        <unnnic-tool-tip
          v-if="option.info"
          :text="option.info"
          enabled
          side="right"
          maxWidth="15rem"
        >
          <unnnic-icon-svg
            icon="information-circle-4"
            size="sm"
            scheme="neutral-clean"
          />
        </unnnic-tool-tip>
      </li>
    </ul>

    <div class="billing-price">
      <template v-if="['trial', 'start', 'scale', 'advanced'].includes(type)">
        <div>
          <span class="billing-price__currency">R$&nbsp;</span>
          <span class="billing-price__price">
            {{ formatPrice(prices[type]) }}
          </span>
        </div>
      </template>

      <p class="billing-price__info">
        {{ type === 'enterprise' ? $t('billing.from') : $t('billing.up_to') }}

        <unnnic-tool-tip
          :text="$t('billing.attendences_info')"
          enabled
          side="bottom"
          maxWidth="280px"
        >
          {{ activeContactsLimit }}

          <template v-if="type === 'trial'">
            {{ $t('billing.attendences_for_1_month') }}
          </template>

          <template v-else-if="type === 'enterprise'">
            {{ $t('billing.attendences') }}
          </template>

          <template v-else>
            {{ $t('billing.attendences_by_month') }}
          </template>
        </unnnic-tool-tip>
      </p>
    </div>

    <div class="billing-buttons">
      <div class="buttons">
        <p v-if="type === 'trial'">
          {{ $t(`billing.payment.plans.trial.unnecessary_card`) }}
        </p>

        <template v-if="type === 'enterprise'">
          <unnnic-button
            @click="redirectEmail"
            type="secondary"
            iconLeft="email-action-unread-1"
          >
            {{ $t(`billing.payment.plans.buttons.email`) }}
          </unnnic-button>
          <unnnic-button
            @click="redirectWhatsapp"
            type="secondary"
            iconLeft="messaging-whatsapp-1"
          >
            {{ $t(`billing.payment.plans.buttons.whatsapp`) }}
          </unnnic-button>
        </template>

        <unnnic-button
          v-else
          :loading="buttonLoading"
          @click="buttonAction"
          :type="recommended ? 'primary' : 'secondary'"
        >
          <template v-if="flow === 'change-plan' && organizationPlan === type">
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
        </unnnic-button>
      </div>
    </div>

    <div
      v-if="['trial', 'start', 'scale'].includes(type)"
      @click="expanded = !expanded"
      class="show-more"
    >
      <unnnic-icon
        :icon="`arrow-button-${expanded ? 'up' : 'down'}-1`"
        scheme="neutral-cloudy"
        size="ant"
      />

      {{
        $t(`billing.payment.plans.features.view_${expanded ? 'less' : 'more'}`)
      }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
export default {
  props: {
    type: {
      type: String,
      default: 'free',
      validator: (val) => ['free', 'paid', 'custom'].includes(val),
    },

    flow: String,

    buttonAction: {
      type: Function,
    },

    buttonLoading: {
      type: Boolean,
      default: false,
    },

    pricingRanges: {
      type: Array,
    },

    extraWhatsappPrice: {
      type: Number,
    },

    recommended: Boolean,
  },
  computed: {
    ...mapGetters(['currentOrg']),
    ...mapState({
      integrationsAmount: (state) => state.BillingSteps.integrations,
    }),

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

    activeContactsLimit() {
      return this.formatNumber(
        {
          trial: 100,
          start: 200,
          scale: 500,
          advanced: 1000,
          enterprise: 1001,
        }[this.type],
      );
    },

    defaultFeatures() {
      return [
        'unlimited_agents',
        'unlimited_campaigns',
        'unlimited_flows',
        'artificial_intelligence',
      ].concat(
        this.expanded
          ? ['channels', 'oficial_whatsapp', 'community', 'apis', 'academy']
          : [],
      );
    },

    options() {
      const plans = {
        trial: this.defaultFeatures,
        start: this.defaultFeatures,
        scale: this.defaultFeatures,
        advanced: ['email_support', 'one_manager', 'six_hours_with_an_expert'],
        enterprise: [
          'all_time_support',
          'one_manager',
          'eight_hours_with_an_expert',
          'incident_alert',
          'security_monitoring',
        ],
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
      prices: {
        trial: 0,
        start: 31200,
        scale: 55120,
        advanced: 79920,
      },
      expanded: false,
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
  },

  methods: {
    ...mapActions(['addIntegration', 'removeIntegration']),
    redirectEmail() {
      location.href = 'mailto:comercial@weni.ai';
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

    formatNumber(number) {
      if (number < 1000) {
        return number;
      }

      const num = String(number);

      return [
        num.substr(0, num.length % 3),
        num.substr(num.length % 3).match(/\d{3}/g),
      ]
        .filter((num) => num)
        .join(this.$i18n.locale === 'pt-br' ? '.' : ',');
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-card {
  display: flex;
  flex-direction: column;
  color: black;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-inset-md;
  min-height: 500px;
  box-sizing: border-box;

  &.bordered {
    border: $unnnic-color-neutral-darkest solid $unnnic-border-width-thin;
  }

  &__title {
    margin: 0;
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-black;
    margin-bottom: $unnnic-spacing-stack-sm;
    text-align: start;
    font-family: $unnnic-font-family-secondary;

    .unnnic-tag {
      width: max-content;
      margin-left: $unnnic-spacing-inline-sm;
    }
  }

  .description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  .billing-list-beneficits {
    list-style: none;
    padding: 0;
    margin: 0;

    &__item {
      display: flex;
      align-items: center;
      margin-bottom: $unnnic-spacing-stack-xs;

      &__title {
        margin: 0 $unnnic-inline-xs;
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-lg;
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
    margin-bottom: $unnnic-spacing-stack-xs;

    > div {
      margin-top: $unnnic-spacing-stack-md;
      display: flex;
      align-items: center;
    }

    &__currency {
      font-size: $unnnic-font-size-title-sm;
      color: $unnnic-color-neutral-black;
    }

    &__price {
      font-size: $unnnic-font-size-title-lg;
      color: $unnnic-color-brand-sec-dark;
      font-weight: $unnnic-font-weight-black;
    }

    &__info {
      margin: 0;
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

      .unnnic-tooltip {
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-dark;
        text-decoration: underline;
        cursor: pointer;
        text-underline-offset: $unnnic-spacing-stack-nano;
        text-decoration-thickness: $unnnic-border-width-thinner;
      }
    }
  }

  .billing-buttons {
    margin-top: auto;
    text-align: center;
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;

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
    margin-top: $unnnic-spacing-stack-xs;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
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
</style>
