<template>
  <div>
    <section class="fd-section">
      <div class="fd-section__header">
        <h1 class="fd-section__title">Home</h1>
      </div>
      <div class="fd-panel">
        {{ message }}
      </div>
    </section>
    <UnnicInput native-type="password"/>
  </div>
</template>

<script>
  import unnic from 'unnic-system-beta';
  export default {
    name: "home",
    data: () => ({
      message: ''
    }),
    components: {
      UnnicInput: unnic.UnnicInput,
    },
    methods: {},
  }
</script>

<style scoped lang="scss">
</style>
