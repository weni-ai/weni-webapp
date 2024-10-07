<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="section-title">{{ $t('project.about.title') }}</div>

    <div class="form-elements">
      <UnnnicFormElement :label="$t('project.fields.name.label')">
        <UnnnicInput
          :placeholder="$t('project.fields.name.placeholder')"
          :modelValue="name"
          @update:model-value="$emit('update:name', $event)"
        />
      </UnnnicFormElement>
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  props: {
    name: String,
  },

  watch: {
    isValid: {
      immediate: true,

      handler() {
        this.$emit('update:isValid', this.isValid);
      },
    },
  },

  computed: {
    isValid() {
      return !!this.name;
    },
  },
};
</script>
