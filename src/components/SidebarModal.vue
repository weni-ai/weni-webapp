<template>
  <div class="sidebar-modal">
    <img :src="image" />

    <div class="content">
      <div class="u font secondary body-md bold color-neutral-dark">
        {{ title }}
      </div>

      <div class="u font secondary body-md color-neutral-cloudy">
        {{ description }}
      </div>

      <a :href="$t('docs_urls.how_to_create_a_flow')" target="_blank">
        <unnnic-button type="terciary" size="small">
          {{ $t('know_more') }}
        </unnnic-button>
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';

.sidebar-modal {
  background-color: $unnnic-color-neutral-light;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-inset-nano;
  box-shadow: $unnnic-shadow-level-separated;

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
