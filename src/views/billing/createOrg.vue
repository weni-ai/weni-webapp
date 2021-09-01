<template>
  <div>
    <billing-modal v-show="current === 1">
      <slot slot="content">
        <billing-card class="unnnic-grid-span-4" type="free" />
        <billing-card
          class="unnnic-grid-span-4"
          type="paid"
          hasIntegration
          @togglePriceModal="togglePriceModal"
        />
        <billing-card
          class="unnnic-grid-span-4"
          type="custom"
          @top="onNextStep"
        />
      </slot>
    </billing-modal>

    <BillingModalPrice
      :isOpenModal="isOpenModalPrice"
      @togglePriceModal="togglePriceModal"
    />

    <ChoosedPlan v-if="current === 2" :type="typePlan" />
  </div>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
import BillingCard from '@/components/billing/Card.vue';
import BillingModalPrice from '@/components/billing/ModalPrice.vue';
import ChoosedPlan from '@/views/billing/choosedPlan.vue';

export default {
  data() {
    return {
      current: 1,
      typePlan: '',
      isOpenModalPrice: false,
    };
  },

  watch: {
    typePlan() {
      console.log(this.typePlan);
    },
  },

  methods: {
    onNextStep(teste) {
      this.typePlan = teste;
      this.current++;
    },
    togglePriceModal() {
      this.isOpenModalPrice = !this.isOpenModalPrice;
    },
  },
  components: {
    BillingCard,
    BillingModal,
    ChoosedPlan,
    BillingModalPrice,
  },
};
</script>

<style></style>
