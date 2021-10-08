<template>
  <div>
    <billing-modal
      :title="$t('billing.pre_org_create_title')"
      :subtitle="$t('billing.pre_org_create_subtitle')"
      v-show="current === 0"
    >
      <slot slot="content">
        <billing-card
          class="unnnic-grid-span-4"
          type="free"
          :buttonAction="onSubmitFreePlan"
          :buttonLoading="creationFreeLoading && freeButton"
          :buttonDisabled="creationFreeLoading && paidButton"
        />
        <billing-card
          class="unnnic-grid-span-4"
          type="paid"
          hasIntegration
          @togglePriceModal="togglePriceModal"
          :buttonAction="onSubmitPaidPlan"
          :buttonLoading="creationFreeLoading && paidButton"
          :buttonDisabled="creationFreeLoading && freeButton"
        />
        <billing-card
          class="unnnic-grid-span-4"
          type="custom"
          @top="onNextStep"
        />
        {{ freeButton }}
      </slot>
    </billing-modal>

    <BillingModalPrice
      :isOpenModal="isOpenModalPrice"
      @togglePriceModal="togglePriceModal"
    />

    <BillingAddCreditCard v-if="current === 1" />

    <BillingFormAddress v-if="current === 2" />

    <ChoosedPlan v-if="current === 3" :type="typePlan" />
  </div>
</template>

<script>
import BillingModal from '@/components/billing/Modal.vue';
import BillingCard from '@/components/billing/Card.vue';
import BillingModalPrice from '@/components/billing/ModalPrice.vue';
import BillingAddCreditCard from '@/views/billing/addCreditCard.vue';
import BillingFormAddress from '@/views/billing/formAddress.vue';
import ChoosedPlan from '@/views/billing/choosedPlan.vue';
import { mapActions, mapState } from 'vuex';

export default {
  data() {
    return {
      typePlan: '',
      isOpenModalPrice: false,
      freeButton: false,
      paidButton: false,
    };
  },

  computed: {
    ...mapState({
      current: (state) => state.BillingSteps.currentModal,
      creationFreeLoading: (state) =>
        state.Org.loadingCreateOrg || state.Project.loadingCreateProject,
      organizationUUID: (state) => state.Org.currentOrg.uuid,
      organizationCreationError: (state) => state.Org.currentOrg.errorCreateOrg,
      projectCreationError: (state) => state.Org.currentOrg.errorCreateProject,
    }),
  },

  methods: {
    ...mapActions([
      'createOrg',
      'createProject',
      'nextBillingStep',
      'finishBillingSteps',
    ]),

    async onSubmitFreePlan() {
      this.freeButton = true;
      await this.createOrg('free');
      if (!this.organizationCreationError) await this.createProject();
      if (!this.projectCreationError) this.finishBillingSteps();
    },

    async onSubmitPaidPlan() {
      this.paidButton = true;
      await this.createOrg('enterprise');
      if (!this.organizationCreationError) await this.createProject();
      if (!this.projectCreationError) this.nextBillingStep();
    },

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
    BillingAddCreditCard,
    BillingFormAddress,
  },
};
</script>

<style></style>
