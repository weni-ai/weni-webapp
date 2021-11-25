<template>
  <div class="billing-address-form">
    <div class="billing-address-form__duplicated">
      <unnnic-input
        :label="$t('billing.address.cep')"
        mask="#####-###"
        placeholder="00000-00"
        v-model="$store.state.BillingSteps.billing_details.address.postal_code"
      />
      <unnnic-select
        :label="$t('billing.address.country')"
        :placeholder="$t('billing.address.select')"
        v-model="$store.state.BillingSteps.billing_details.address.country"
      />
    </div>
    <div class="billing-address-form__duplicated">
      <unnnic-select
        :label="$t('billing.address.state')"
        :placeholder="$t('billing.address.select')"
        v-model="$store.state.BillingSteps.billing_details.address.state"
      />
      <unnnic-select
        :label="$t('billing.address.city')"
        :placeholder="$t('billing.address.select')"
        v-model="$store.state.BillingSteps.billing_details.address.city"
      />
    </div>
    <unnnic-input
      :label="$t('billing.address.address_title')"
      :mask="['###.###.###-##', '##.###.###/####-##']"
      :placeholder="$t('billing.address.address_mask')"
      v-model="$store.state.BillingSteps.billing_details.address.line1"
    />
    <unnnic-input
      :label="$t('billing.address.additional_info')"
      :placeholder="$t('billing.address.additional_info_mask')"
    />
    <div class="billing-address-form__buttons">
      <unnnic-button
        type="secondary"
        size="large"
        :text="$t('billing.address.buttons.back')"
        @click="back"
      />
      <unnnic-button
        id="stripe-confirm-setup-button"
        @click="$emit('confirm-card-setup')"
        size="large"
        :text="$t('billing.address.buttons.done')"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'BillingModal',
  data() {
    return {};
  },

  methods: {
    ...mapActions(['setBillingStep']),

    back() {
      this.setBillingStep('credit-card');
    },
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-address-form {
  .unnnic-form,
  .unnnic-select {
    p {
      margin-top: 0;
    }
  }
  > .unnnic-form {
    margin-bottom: $unnnic-spacing-stack-md;
  }
  .weni-report {
    margin-top: $unnnic-spacing-stack-md;
  }

  &__duplicated {
    display: flex;
    margin-bottom: $unnnic-spacing-stack-md;
    > div {
      width: 100%;
      &:first-child {
        margin-right: $unnnic-spacing-stack-sm;
      }
    }
  }

  &__buttons {
    display: flex;
    button {
      width: 100%;
      margin: 0 $unnnic-inline-xs;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
