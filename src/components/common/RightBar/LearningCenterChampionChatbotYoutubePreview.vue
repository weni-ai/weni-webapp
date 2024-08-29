<template>
  <section
    class="youtube-preview"
    :style="{
      backgroundImage: `url('https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp')`,
    }"
    data-test="video-preview"
  >
    <img
      class="youtube-preview__play-button"
      src="@/assets/youtube-play-button.svg"
    />
  </section>
</template>

<script setup>
defineProps({
  videoId: String,
});
</script>

<style lang="scss" scoped>
.youtube-preview {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center center;
  border-radius: $unnnic-border-radius-sm;

  &__play-button {
    pointer-events: none;
    user-select: none;
    width: 10%;
  }
}
</style>
