<template>
  <div class="order">
    <span class="label">
      {{ $t('projects.ordinators.label') }}
    </span>

    <div class="ordinators">
      <UnnnicRadio
        v-for="(ordinator, index) in ordinators"
        :key="index"
        size="md"
        :value="ordinator"
        @change="$emit('input', $event)"
        :globalValue="value"
      >
        {{ $t(`projects.ordinators.${ordinator}`) }}
      </UnnnicRadio>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    ordinators: Array,
    value: String,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.order {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  color: $unnnic-color-neutral-darkest;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  column-gap: $unnnic-spacing-sm;
  row-gap: $unnnic-spacing-stack-nano;

  .ordinators {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-inline-xs;
  }
}
</style>
