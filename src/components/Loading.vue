<template>
  <div class="weni-loading">
    <unnnic-icon class="icon-spin" icon="loading-circle-1" />
  </div>
</template>

<script>
import { unnnicIcon } from '@weni/unnnic-system';

export default {
  name: 'Redirecting',
  component: { unnnicIcon },
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
