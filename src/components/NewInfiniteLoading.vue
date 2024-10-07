<template>
  <div
    v-show="!complete"
    ref="infinite-loading-element"
  >
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
    },

    complete: {
      type: Boolean,
    },
  },

  data() {
    return {
      intersectionObserver: null,
    };
  },

  mounted() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.$emit('update:model-value', entry.isIntersecting);
      });
    });

    this.intersectionObserver.observe(this.$refs['infinite-loading-element']);
  },

  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs['infinite-loading-element']);
  },
};
</script>
