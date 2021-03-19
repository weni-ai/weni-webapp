<template>
  <div id="app">
    <router-view/>
    <footer />
  </div>
</template>

<style lang="scss">
  @import '@/assets/scss/style.scss';
  @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  body {
    margin: 0;
    background-color: white;
    font-family: $unnnic-font-family-secondary;
  }
</style>
