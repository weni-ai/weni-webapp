<template>
  <div>
    <div class="tags">
      <UnnnicTag
        v-for="service in options"
        :key="service.id"
        :text="`${service.icon ? service.icon : ''} ${$t(service.title)}`"
        scheme="aux-blue"
        class="item"
        @click="selectSector(service)"
        clickable
        :disabled="modelValue === null ? false : service.id !== modelValue.id"
      />
    </div>

    <div
      v-if="modelValue && modelValue.insert"
      class="other-container"
    >
      <UnnnicInput
        :label="$t('account.init.help')"
        size="sm"
        ref="other"
        :modelValue="modelValue.other"
        @update:model-value="$emit('update:model-value', { ...modelValue, other: $event })"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
    },

    modelValue: {
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
      this.$emit(
        'input',
        selectedService?.insert
          ? { ...selectedService, other: '' }
          : selectedService,
      );

      if (selectedService?.insert) {
        this.$nextTick(() => {
          this.$refs.other.$el.querySelector('input')?.focus();
        });
      }
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
  max-width: 530px;
  width: 100%;
}

.other-container {
  margin: $unnnic-spacing-stack-sm 10.5% 0 10.5%;
}
</style>
