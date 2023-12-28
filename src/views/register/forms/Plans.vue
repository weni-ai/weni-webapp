<template>
  <div class="plans-container">
    <div class="plans-container__scroll-container">
      <billing-card
        v-for="plan in plans"
        :current-plan="plan === 'trial'"
        :type="plan"
        :key="plan"
        @select="$emit('on-choose-plan', plan)"
        :recommended="plan === 'start'"
        :button-disabled="false"
        :disabled="false"
        :expanded.sync="expanded"
        @update:expanded="$emit('update:expanded', $event)"
        :show-same-as-scale-text="plans.includes('scale')"
      />
    </div>
  </div>
</template>

<script>
import BillingCard from '../../../components/billing/Card.vue';

export default {
  components: {
    BillingCard,
  },

  data() {
    return {
      expanded: false,
      plans: ['trial', 'start', 'scale', 'advanced', 'enterprise'],
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.plans-container {
  margin-top: $unnnic-spacing-lg;

  &__scroll-container {
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-spacing-inline-sm;
    justify-content: center;
    align-items: stretch;

    > * {
      width: 18.125rem;
      min-width: 18.125rem;
    }
  }

  @media screen and (max-width: 480px) {
    display: flex;
    overflow: overlay;
    width: 100vw;
    margin-left: -16px;
    margin-right: -16px;
    margin-top: -0.875rem;
    margin-bottom: -0.875rem;

    $scroll-size: $unnnic-inline-nano;

    &::-webkit-scrollbar {
      height: 0;
    }

    @media (hover: hover) {
      margin-bottom: -0.875 * $unnnic-font-size - $unnnic-inline-nano;

      &::-webkit-scrollbar {
        height: $scroll-size;
      }
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
    }

    &__scroll-container {
      flex-wrap: nowrap;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 0.875rem;
      padding-bottom: 0.875rem;
    }
  }
}
</style>
