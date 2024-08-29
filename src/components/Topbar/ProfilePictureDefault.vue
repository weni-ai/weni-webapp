<template>
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="40"
      height="40"
      rx="4"
      class="background"
    />

    <text
      font-family="Lato"
      font-size="14"
      font-weight="bold"
      text-anchor="middle"
      class="text"
    >
      <tspan
        x="20"
        y="25.418"
      >
        {{ text }}
      </tspan>
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
  fill: $unnnic-color-neutral-soft;
}

.text {
  fill: $unnnic-color-neutral-cloudy;
}
</style>
