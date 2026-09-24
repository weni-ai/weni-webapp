<template>
  <UnnnicFormElement
    :label="$t('project.fields.description.label')"
    :error="error"
    :tooltip="{
      text: $t('project.fields.description.info'),
      side: 'right',
      maxWidth: infoMaxWidth,
    }"
  >
    <UnnnicTextArea
      :type="error ? 'error' : 'normal'"
      size="md"
      :placeholder="$t('project.fields.description.placeholder')"
      :modelValue="modelValue"
      :maxLength="1000"
      @update:model-value="$emit('update:model-value', $event)"
    />
  </UnnnicFormElement>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: '',
    },

    error: {
      type: [Boolean, String],
      default: false,
    },

    infoMaxWidth: {
      type: String,
      default: '21.125rem',
    },
  },

  emits: ['update:model-value'],
};
</script>
