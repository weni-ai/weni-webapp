<template>
  <div class="billing-add-credit-card">
    <unnnic-input
      :label="$t('billing.card.cpf_or_cnpj')"
      :mask="['###.###.###-##', '##.###.###/####-##']"
      placeholder="000.000.000-00"
    />
    <unnnic-input
      :label="$t('billing.card.name')"
      :placeholder="$t('billing.card.name_placeholder')"
    />
    <div class="billing-add-credit-card__bottom">
      <unnnic-input
        :label="$t('billing.card.number')"
        mask="#### #### #### ####"
        placeholder="0000 0000 0000 0000"
      />
      <unnnic-input
        placeholder="MM/AA"
        :label="$t('billing.card.due_date')"
        mask="##/##"
      />
      <unnnic-input
        :label="$t('billing.card.ccv')"
        mask="####"
        placeholder="000"
      />
    </div>
    <div class="billing-add-credit-card__buttons">
      <unnnic-button
        type="secondary"
        size="large"
        :text="$t('billing.card.buttons.back')"
      />
      <unnnic-button size="large" :text="$t('billing.card.buttons.next')" />
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

.billing-add-credit-card {
  > .unnnic-form {
    margin-bottom: $unnnic-spacing-stack-md;
  }

  .unnnic-form {
    p {
      margin-top: 0;
    }
  }
  .weni-report {
    margin-top: $unnnic-spacing-stack-md;
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
  &__bottom {
    display: flex;
    > .unnnic-form {
      &:first-child {
        width: 60%;
      }
      &:nth-child(2) {
        width: 37%;
      }
      &:last-child {
        width: 18%;
      }
    }
    > div {
      margin: 0 $unnnic-inline-sm $unnnic-spacing-stack-md 0;
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
