<template>
  <div
    :class="['weni-avatar', `weni-avatar--size-${size}`]"
    :style="imageBackground"
  >
    <unnnic-icon-svg
      :size="iconSize"
      v-if="!imageBackground"
      icon="single-neutral-2"
      scheme="neutral-clean"
    />
  </div>
</template>

<script>
export default {
  name: 'Avatar',
  props: {
    size: {
      type: String,
      default: 'md',
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  computed: {
    imageBackground() {
      if (!this.imageUrl) return null;
      return `background-image: url('${this.imageUrl}')`;
    },
    iconSize() {
      if (this.size === 'lg') return 'lg';
      if (this.size === 'sm') return 'sm';
      if (this.size === 'xs' || this.size === 'nano') return 'xs';
      return 'md';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

$avatar-sizes: 'lg' $unnnic-avatar-size-lg, 'md' $unnnic-avatar-size-md,
  'sm' $unnnic-avatar-size-sm, 'xs' $unnnic-avatar-size-xs,
  'nano' $unnnic-avatar-size-nano;

.weni-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $unnnic-color-background-snow;
  border-radius: 50%;
  margin-right: $unnnic-inline-sm;
  background-size: cover;
  background-position: center;

  @each $name, $size in $avatar-sizes {
    &--size-#{$name} {
      height: $size;
      width: $size;
    }
  }
}
</style>
