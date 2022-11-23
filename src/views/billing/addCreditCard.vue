<template>
  <billing-container :title="$t(texts.title)" :subtitle="$t(texts.subtitle)">
    <slot slot="content">
      <div class="credit-card-container">
        <div
          v-if="['create-org', 'change-plan'].includes(flow)"
          class="billing-card-container"
        >
          <billing-card
            :type="$route.query.plan"
            hide-select
            :expanded.sync="expanded"
          />
        </div>
        <div class="card-form">
          <BillingFormCreditCard
            :flow="flow"
            :errors="errors"
            @update:errors="$emit('update:errors', $event)"
          />
          <Report
            :text="$t('billing.card.payment_day', { date: paymentDay })"
          />
          <p>{{ $t('billing.card.security_payment') }}</p>
        </div>
      </div>
    </slot>
  </billing-container>
</template>

<script>
import BillingContainer from '@/views/billing/billingContainer.vue';
import BillingCard from '@/components/billing/Card.vue';
import BillingFormCreditCard from '@/components/billing/FormCreditCard.vue';
import Report from '@/components/Report.vue';

export default {
  name: 'BillingAddCreditCard',
  props: {
    type: {
      type: String,
      default: 'plan',
      validator: (val) => ['plan', 'custom'].includes(val),
    },

    flow: {
      type: String,
    },

    showClose: Boolean,

    errors: Object,

    pricingRanges: {
      type: Array,
    },

    extraWhatsappPrice: {
      type: Number,
    },

    activeContactsLimit: {
      type: Number,
    },
  },
  components: {
    BillingContainer,
    BillingCard,
    BillingFormCreditCard,
    Report,
  },

  data() {
    return {
      expanded: false,
    };
  },

  computed: {
    paymentDay() {
      const date = new Date();
      const day = 1000 * 60 * 60 * 24;
      date.setTime(date.getTime() + 30 * day);
      return date.getDate();
    },

    texts() {
      const texts = {};

      texts.title = 'billing.add_credit_card_title';
      texts.subtitle = 'billing.add_credit_card_subtitle';

      if (this.flow === 'add-credit-card') {
        texts.title = 'billing.add_credit_card.title';
        texts.subtitle = 'billing.change_credit_card.subtitle';
      } else if (this.flow === 'change-credit-card') {
        texts.title = 'billing.change_credit_card.title';
        texts.subtitle = 'billing.change_credit_card.subtitle';
      }

      return texts;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.card-form {
  .weni-report {
    margin-top: $unnnic-spacing-stack-md;
  }

  > p {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;
    margin-top: $unnnic-spacing-stack-sm;
  }
}

.center {
  margin: 0 auto;
}
</style>
