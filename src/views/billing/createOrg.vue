<template>
  <div>
    <billing-modal v-show="current === 1">
      <slot slot="content">
        <billing-card class="unnnic-grid-span-4" type="free" />
        <billing-card class="unnnic-grid-span-4" type="paid" hasIntegration />
        <billing-card
          class="unnnic-grid-span-4"
          type="custom"
          @top="onNextStep"
        />
      </slot>
    </billing-modal>

    <ChoosedPlan v-show="current === 2" :type="typePlan" />
  </div>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
import BillingCard from '@/components/billing/Card.vue';
import ChoosedPlan from '@/views/billing/choosedPlan.vue';

export default {
  data() {
    return {
      current: 1,
      typePlan: '',
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
  },
  components: {
    BillingCard,
    BillingModal,
    ChoosedPlan,
  },
};
</script>

<style></style>
