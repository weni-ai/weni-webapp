<template>
  <div class="api-options">
    <router-link
      :to="{
        name: 'apiFlows',
        params: {
          internal: ['index'],
        },
      }"
      :class="{
        'router-link-active': $route.name === 'apiFlows',
      }"
    >
      {{ $t('apis.flows') }}
    </router-link>

    <!-- <router-link
      :to="{
        name: 'apiIntelligence',
        params: {
          internal: ['index'],
        },
      }"
    >
      {{ $t('apis.intelligence') }}
    </router-link> -->
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.api-options {
  display: flex;
  padding: $unnnic-spacing-stack-xs $unnnic-spacing-inline-lg;
  gap: $unnnic-spacing-inline-md;

  a {
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-neutral-clean;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    text-decoration: none;

    &.router-link-active {
      color: $unnnic-color-neutral-dark;
    }
  }
}
</style>
