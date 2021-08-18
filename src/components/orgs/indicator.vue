<template>
  <div class="weni-step-indicator">
    <div
      v-for="step in steps"
      :class="{
        'weni-step-indicator__step__wrapper': true,
        'weni-step-indicator--has-separator': step > 1,
      }"
      :key="step"
    >
      <div
        v-if="step !== 1"
        :class="{
          'weni-step-indicator__step__separator': true,
          'weni-step-indicator__step__separator--active': step <= current,
        }"
      />
      <div
        :class="{
          'weni-step-indicator__step': true,
          'weni-step-indicator__step--active': step <= current,
        }"
      >
        <span class="weni-step-indicator__label">
          {{ nameForStep(step) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    steps: {
      type: Number,
      required: true,
    },
    names: {
      type: Array,
      default: () => [],
    },
    current: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    nameForStep(step) {
      try {
        return this.names[step - 1];
      } catch (e) {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.weni-step-indicator {
  display: flex;
  align-items: center;
  width: 100%;

  &--has-separator {
    flex: 1;
  }

  &__step {
    border-radius: 50%;
    height: $unnnic-avatar-size-nano;
    width: $unnnic-avatar-size-nano;
    border: $unnnic-border-width-thick solid $unnnic-color-neutral-lightest;
    position: relative;

    &__wrapper {
      display: flex;
      align-items: center;
    }

    &--active {
      background-color: #00ded2;
      border: 4px solid rgba(0, 222, 210, 0.24);
      background-clip: content-box;
    }

    &__separator {
      border: $unnnic-border-width-thin solid $unnnic-color-neutral-lightest;
      margin: 0 $unnnic-inline-xs;
      border-radius: 3px;
      flex: 1;

      &--active {
        border: 2px solid $unnnic-color-brand-weni;
      }
    }
  }
  &__label {
    position: absolute;
    white-space: nowrap;
    text-align: center;
    transform: translateX(-50%);
    left: 50%;
    top: 100%;
    margin: $unnnic-inline-xs 0 0 0;
    color: $unnnic-color-neutral-cleanest;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
  }
}
</style>
