<template>
    <div class="weni-redirecting">
        <unnic-icon class="icon-spin" icon="loading-circle-1" />
    </div>
</template>

<script>
import unnic from 'unnic-system-beta';

export default {
    name: 'Redirecting',
    component: { unnicIcon: unnic.UnnicIcon }
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnic.scss';

    .weni-redirecting {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;

        span {
            color: $unnic-color-neutral-dark;;
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