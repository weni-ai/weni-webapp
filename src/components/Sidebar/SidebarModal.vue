<template>
  <div class="sidebar-modal">
    <img :src="image" />

    <div class="content">
      <div class="u font secondary body-md bold color-fg-base">
        {{ title }}
      </div>

      <div class="u font secondary body-md color-fg-base">
        {{ description }}
      </div>

      <a
        :href="$t('docs_urls.how_to_create_a_flow')"
        target="_blank"
      >
        <UnnnicButton
          type="tertiary"
          size="small"
        >
          {{ $t('know_more') }}
        </UnnnicButton>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: String,
    title: String,
    description: String,
  },
};
</script>

<style lang="scss" scoped>
.sidebar-modal {
  background-color: $unnnic-color-bg-base-soft;
  border: 1px solid $unnnic-color-border-base;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-inset-nano;
  box-shadow: $unnnic-shadow-1;

  img {
    width: 100%;
    aspect-ratio: 252 / 114.5;
    object-fit: cover;
    border-radius: $unnnic-border-radius-md;
  }

  .content {
    padding: $unnnic-spacing-inset-nano;

    .unnnic-button {
      width: 100%;
      margin-top: $unnnic-spacing-stack-xs;
    }
  }
}
</style>
