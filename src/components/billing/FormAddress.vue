<template>
  <div class="billing-address-form">
    <div class="billing-address-form__duplicated">
      <unnnic-input
        :label="$t('billing.address.cep')"
        mask="#####-###"
        placeholder="00000-00"
      />
      <unnnic-select
        :label="$t('billing.address.country')"
        :placeholder="$t('billing.address.select')"
      />
    </div>
    <div class="billing-address-form__duplicated">
      <unnnic-select
        :label="$t('billing.address.state')"
        :placeholder="$t('billing.address.select')"
      />
      <unnnic-select
        :label="$t('billing.address.city')"
        :placeholder="$t('billing.address.select')"
      />
    </div>
    <unnnic-input
      :label="$t('billing.address.address_title')"
      :mask="['###.###.###-##', '##.###.###/####-##']"
      :placeholder="$t('billing.address.address_mask')"
    />
    <unnnic-input
      :label="$t('billing.address.additional_info')"
      :placeholder="$t('billing.address.additional_info_mask')"
    />
    <div class="billing-add-credit-card__buttons">
      <unnnic-button
        type="secondary"
        size="large"
        :text="$t('billing.address.buttons.back')"
      />
      <unnnic-button size="large" :text="$t('billing.address.buttons.done')" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillingModal',
  data() {
    return {};
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
