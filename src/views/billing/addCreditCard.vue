<template>
  <modal
    type="billing"
    :show-close="showClose"
    :title="$t(texts.title)"
    :subtitle="$t(texts.subtitle)"
    @close="$emit('close')"
  >
    <slot slot="after-subtitle">
      &nbsp;
      <a href="#" @click="$emit('toggle-price-modal')">
        {{ $t('billing.understand_pricing.label') }}
      </a>

      {{ $t('billing.understand_pricing.description') }}
    </slot>

    <slot slot="content">
      <div class="credit-card-container">
        <div
          v-if="['create-org', 'change-plan'].includes(flow)"
          class="billing-card-container"
        >
          <BillingCard
            type="paid"
            hasIntegration
            :pricing-ranges="pricingRanges"
            :extra-whatsapp-price="extraWhatsappPrice"
            :active-contacts-limit="activeContactsLimit"
            @togglePriceModal="$emit('toggle-price-modal')"
          />
        </div>
        <div class="card-form">
          <BillingFormCreditCard
            :flow="flow"
            :errors="errors"
            @update:errors="$emit('update:errors', $event)"
          />
          <Report
            text="A cobrança na fatura do seu cartão de crédito será realizada todo dia 23."
          />
          <p>{{ $t('billing.card.security_payment') }}</p>
        </div>
      </div>
    </slot>
  </modal>
</template>

<script>
import Modal from '@/components/external/Modal.vue';
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
    Modal,
    BillingCard,
    BillingFormCreditCard,
    Report,
  },

  computed: {
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
