<template>
  <div>
    <div class="tags">
      <unnnic-tag
        v-for="service in options"
        :key="service.id"
        :text="`${service.icon ? service.icon : ''} ${$t(service.title)}`"
        scheme="aux-blue"
        class="item"
        @click="selectSector(service)"
        clickable
        :disabled="value === null ? false : service.id !== value.id"
      />
    </div>

    <div v-if="value && value.insert" class="other-container">
      <unnnic-input
        :label="$t('account.init.help')"
        size="sm"
        ref="other"
        :value="value.other"
        @input="$emit('input', { ...value, other: $event })"
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
