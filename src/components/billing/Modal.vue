<template>
  <div class="billing-modal" v-if="isOpen">
    <div class="billing-modal__content unnnic-grid-xl">
      <div v-if="title || subtitle" class="unnnic-grid-span-12">
        <h1 class="billing-modal__content__title">
          {{ title }}
        </h1>
        <h3 class="billing-modal__content__subtitle">
          {{ subtitle }}
        </h3>
      </div>
      <slot name="content" />
      <div class="close-button">
        <unnnic-icon-svg
          icon="close-1"
          size="md"
          clickable
          @click="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script>
// import vClickOutside from 'v-click-outside';

export default {
  name: 'BillingModal',
  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isOpen: true,
      isOpenModalPrice: false,
    };
  },
  // directives: {
  //   clickOutside: vClickOutside.directive,
  // },
  methods: {
    closeModal() {
      this.isOpen = false;
    },
    toggleModalPrice() {
      this.isOpenModalPrice = !this.isOpenModalPrice;
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 100;

  &__content {
    position: relative;
    padding: $unnnic-spacing-stack-lg $unnnic-inline-xgiant;
    border-radius: $unnnic-border-radius-md;
    background-color: $unnnic-color-background-sky;
    width: 100%;
    max-width: 1157px;
    min-height: 706px;
    margin: 0 24px;

    &__title {
      font-size: $unnnic-font-size-title-md;
      font-weight: $unnnic-font-weight-black;
      text-align: center;
      color: $unnnic-color-brand-sec-dark;
      margin: 0;
    }

    &__subtitle {
      font-size: $unnnic-font-size-body-gt;
      font-weight: $unnnic-font-weight-regular;
      text-align: center;
      max-width: 680px;
      color: $unnnic-color-neutral-dark;
      margin: $unnnic-spacing-stack-xs auto 0 auto;
    }

    .close-button {
      position: absolute;
      top: 0;
      right: 0;
      margin-top: $unnnic-spacing-stack-lg;
      margin-right: $unnnic-inline-lg;
    }
  }
}
</style>
