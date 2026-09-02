<template>
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="28"
      height="28"
      rx="999"
      class="background"
    />

    <text
      x="14"
      y="14"
      dy="-1"
      font-family="Inter"
      font-size="14"
      font-weight="bold"
      text-anchor="middle"
      dominant-baseline="central"
      class="text"
    >
      {{ text }}
    </text>
  </svg>
</template>

<script>
export default { name: 'ProfilePictureDefault' };
</script>

<script setup>
defineProps({
  text: String,
});
</script>

<style lang="scss" scoped>
.background {
  fill: $unnnic-color-bg-muted;
}

.text {
  fill: $unnnic-color-fg-base;
}
</style>
