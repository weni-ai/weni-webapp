<template>
  <UnnnicFormElement
    class="form-element"
    :error="error && error"
  >
    <div
      :class="[
        'label unnnic-font secondary body-gt',
        error ? 'color-feedback-red' : 'color-neutral-cloudy',
      ]"
    >
      {{ $t('project.fields.description.label') }}

      <UnnnicToolTip
        :text="$t('project.fields.description.info')"
        enabled
        side="right"
        :maxWidth="infoMaxWidth"
      >
        <UnnnicIcon
          icon="alert-circle-1-1"
          size="sm"
          scheme="neutral-cleanest"
        />
      </UnnnicToolTip>
    </div>

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
    modelValue: String,

    error: [Boolean, String],

    infoMaxWidth: {
      type: String,
      default: '21.125rem',
    },
  },
};
</script>

<style lang="scss" scoped>
.form-element .label {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;
}
</style>
