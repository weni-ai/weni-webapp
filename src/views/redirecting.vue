<template>
    <div class="weni-redirecting">
        <loading />
    </div>
</template>

<script>
import Loading from '../components/Loading';

export default {
    name: 'Redirecting',
    components: { Loading }
}
</script>

<style lang="scss" scoped>
  .weni-redirecting {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
  }
</style>