<template>
  <div class="tags">
    <unnnic-tag
      v-for="service in options"
      :key="service.id"
      :text="service.title"
      scheme="aux-blue"
      class="item"
      @click="selectSector(service)"
      clickable
      :disabled="value === null ? false : service !== value"
    />
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
    },

    value: {
      type: Object,
    },
  },

  data() {
    return {
      selectedItem: {},
    };
  },
  methods: {
    selectSector(selectedService) {
      this.$emit('input', selectedService);
    },
  },
};
</script>

<style scoped lang="scss">
.tags {
  display: flex;
  justify-content: center;

  flex-wrap: wrap;
  gap: 16px;
  row-gap: 24px;
  max-width: 550px;
  width: 100%;
}
</style>
