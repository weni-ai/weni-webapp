<template>
  <div class="weni-loading">
    <unnnic-icon-svg
      class="icon-spin"
      icon="loading-circle-1"
      scheme="neutral-dark"
    />
  </div>
</template>

<script>
export default {
  name: 'Redirecting',
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  span {
    color: $unnnic-color-neutral-dark;
  }
}

@keyframes iconSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.icon-spin {
  animation-name: iconSpin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
</style>
