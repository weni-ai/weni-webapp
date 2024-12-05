<template>
  <div class="billing-add-credit-card">
    <UnnnicInput
      v-model="$store.state.BillingSteps.billing_details.cpfOrCnpj"
      :label="$t('billing.card.cpf_or_cnpj')"
      :type="cpfOrCnpjError ? 'error' : 'normal'"
      :message="cpfOrCnpjError ? $t(`errors.${cpfOrCnpjError}`) : null"
      @update:model-value="$emit('update:errors', { ...errors, cpfOrCnpj: '' })"
    />
    <UnnnicInput
      v-model="$store.state.BillingSteps.billing_details.name"
      :label="$t('billing.card.name')"
      :placeholder="$t('billing.card.name_placeholder')"
      :type="nameError ? 'error' : 'normal'"
      :message="nameError ? $t(`errors.${nameError}`) : null"
      @update:model-value="$emit('update:errors', { ...errors, name: '' })"
    />

    <StripeElements
      v-if="stripeLoaded"
      v-slot="{ elements }"
      ref="elms"
      class="billing-add-credit-card__bottom"
      :stripeKey="stripeKey"
      :instanceOptions="instanceOptions"
      :elementsOptions="elementsOptions"
    >
      <UnnnicFormElement :label="$t('billing.card.number')">
        <StripeElement
          ref="card"
          type="cardNumber"
          :elements="elements"
          :options="{
            style: stripeElementsStyle,
            showIcon: true,
          }"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.card.due_date')">
        <StripeElement
          type="cardExpiry"
          :elements="elements"
          :options="{
            style: stripeElementsStyle,
          }"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.card.ccv')">
        <StripeElement
          type="cardCvc"
          :elements="elements"
          :options="{
            style: stripeElementsStyle,
          }"
        />
      </UnnnicFormElement>
    </StripeElements>
  </div>
</template>

<script>
import { StripeElements, StripeElement } from 'vue-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import getEnv from '../../../utils/env';

export default {
  name: 'BillingModal',

  components: {
    StripeElements,
    StripeElement,
  },

  props: {
    flow: String,

    errors: Object,
  },

  data() {
    return {
      stripeKey: getEnv('STRIPE_API'),
      stripeLoaded: false,
      instanceOptions: {},
      elementsOptions: {},
      stripeElementsStyle: {
        base: {
          color: '#4e5666',
          fontFamily: 'Lato, "Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '14px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        spacingUnit: '6px',
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    };
  },

  computed: {
    cpfOrCnpjError() {
      return this.errors?.cpfOrCnpj;
    },

    nameError() {
      return this.errors?.name;
    },
  },

  mounted() {
    const stripePromise = loadStripe(this.stripeKey);
    stripePromise.then(() => {
      this.stripeLoaded = true;
    });
  },
};
</script>

<style lang="scss" scoped>
.billing-add-credit-card {
  .label {
    font-weight: 400;
    line-height: 1.375rem;
    font-size: 0.875rem;
    color: #67738b;
    margin-bottom: 0.5rem;
  }

  > .unnnic-form {
    margin-bottom: $unnnic-spacing-stack-md;
  }

  &__bottom {
    display: flex;
    > div:first-child {
      width: 60%;
    }
    > div:nth-child(2) {
      width: 37%;
    }
    > div:last-child {
      width: 18%;
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
