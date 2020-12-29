<template>
  <div>
    <section class="fd-section">
      <div class="fd-section__header">
        <h1 class="fd-section__title">Home</h1>
      </div>
      <div class="fd-panel">
        {{ message }}
      </div>
      <sidebar />
      <navbar />
    </section>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebartest.vue';
import Navbar from '../components/navbar.vue';
  export default {
    name: "home",
    components: { Sidebar, Navbar },
    data: () => ({
      message: ''
    }),
    methods: {},
  }
</script>

<style scoped lang="scss">
</style>
