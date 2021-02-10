<template>
    <div class="weni-redirecting">
        <unnnic-icon class="icon-spin" icon="loading-circle-1" />
    </div>
</template>

<script>
import { unnnicIcon } from 'unnic-system-beta';

export default {
    name: 'Redirecting',
    component: { unnnicIcon }
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';

    .weni-redirecting {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;

        span {
            color: $unnnic-color-neutral-dark;;
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