<template>
  <billing-modal :title="$t(texts.title)" :subtitle="$t(texts.subtitle)">
    <slot slot="content">
      <div class="unnnic-grid-span-1" />
      <div v-if="flow === 'create-org'" class="unnnic-grid-span-4">
        <BillingCard type="paid" hasIntegration />
      </div>
      <div class="card-form unnnic-grid-span-6">
        <BillingFormCreditCard :flow="flow" />
        <Report
          text="A cobrança na fatura do seu cartão de crédito será realizada todo dia 23."
        />
        <p>{{ $t('billing.card.security_payment') }}</p>
      </div>
      <div class="unnnic-grid-span-1" />
    </slot>
  </billing-modal>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
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
  },
  components: {
    BillingModal,
    BillingCard,
    BillingFormCreditCard,
    Report,
  },

  computed: {
    texts() {
      const texts = {};

      texts.title = 'billing.add_credit_card_title';
      texts.subtitle = 'billing.add_credit_card_subtitle';

      if (this.flow === 'change-credit-card') {
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
