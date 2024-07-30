<template>
  <div
    :class="['weni-avatar', `weni-avatar--size-${size}`]"
    :style="imageBackground"
  >
    <img
      v-if="!imageBackground"
      src="@/assets/default-avatar.svg"
      width="100%"
      height="100%"
    />
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
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
  },
};
</script>

<style lang="scss" scoped>


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
