<template>
  <billing-modal
    :title="$t('billing.address_title')"
    :subtitle="$t('billing.address_subtitle')"
  >
    <slot slot="content">
      <div class="unnnic-grid-span-1" />
      <div class="unnnic-grid-span-4">
        <BillingCard type="paid" hasIntegration />
      </div>
      <div class="card-form unnnic-grid-span-6">
        <BillingFormAddress @confirm-card-setup="$emit('confirm-card-setup')" />
      </div>
      <div class="unnnic-grid-span-1" />
    </slot>
  </billing-modal>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
import BillingCard from '@/components/billing/Card.vue';
import BillingFormAddress from '@/components/billing/FormAddress.vue';

export default {
  name: 'BillingAddress',
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
    BillingFormAddress,
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
