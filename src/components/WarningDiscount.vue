<template>
  <div>
    <div
      v-if="canShow && isDiscountActive"
      class="warning-bar"
      :style="{
        display: canShow ? null : 'none',
      }"
    >
      <div class="message">
        <span v-html="$t('alerts.discount')" />
      </div>
      <div>
        <unnnic-icon-svg
          icon="close-1"
          size="md"
          clickable
          scheme="neutral-white"
          @click="isDiscountActive = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {},

  data() {
    return {
      isDiscountActive: true,
    };
  },

  computed: {
    canShow() {
      return (
        this.$store.getters.org?.organization_billing.plan !== 'trial' &&
        this.$route.name === 'projects'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.warning-bar {
  background-color: #3988fe;
  color: $unnnic-color-neutral-white;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-lg;
  padding: $unnnic-spacing-sm;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  .message {
    margin: 0 auto;
  }

  ::v-deep a {
    color: inherit;
    text-underline-offset: $unnnic-spacing-stack-nano;
    display: inline-block;
  }
}
</style>
