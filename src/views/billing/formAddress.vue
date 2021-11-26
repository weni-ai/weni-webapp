<template>
  <modal
    type="billing"
    :show-close="showClose"
    :title="$t('billing.address_title')"
    :subtitle="$t('billing.address_subtitle')"
    @close="$emit('close')"
  >
    <slot slot="content">
      <div class="address-container">
        <div
          v-if="['create-org', 'change-plan'].includes(flow)"
          class="billing-card-container"
        >
          <BillingCard type="paid" hasIntegration />
        </div>
        <div class="card-form">
          <BillingFormAddress
            :flow="flow"
            @confirm-card-setup="$emit('confirm-card-setup')"
          />
        </div>
      </div>
    </slot>
  </modal>
</template>

<script>
import Modal from '@/components/external/Modal.vue';
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

    flow: {
      type: String,
    },

    showClose: Boolean,
  },
  components: {
    Modal,
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
