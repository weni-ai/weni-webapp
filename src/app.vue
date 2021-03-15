<template>
  <div id="app">
    <div class="fd-page__content">
      <router-view/>
    </div>
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
