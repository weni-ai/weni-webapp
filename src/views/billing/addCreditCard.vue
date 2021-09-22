<template>
  <billing-modal
    :title="$t('billing.add_credit_card_title')"
    :subtitle="$t('billing.add_credit_card_subtitle')"
  >
    <slot slot="content">
      <div class="unnnic-grid-span-1" />
      <div class="unnnic-grid-span-4">
        <BillingCard type="paid" hasIntegration />
      </div>
      <div class="card-form unnnic-grid-span-6">
        <BillingFormCreditCard />
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
  },
  components: {
    BillingModal,
    BillingCard,
    BillingFormCreditCard,
    Report,
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
