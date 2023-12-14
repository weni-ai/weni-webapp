<template>
  <unnnic-form-element class="form-element" :error="error && error">
    <div
      :class="[
        'label unnnic-font secondary body-gt',
        error ? 'color-feedback-red' : 'color-neutral-cloudy',
      ]"
    >
      {{ $t('project.fields.description.label') }}

      <unnnic-tool-tip
        :text="$t('project.fields.description.info')"
        enabled
        side="right"
        :maxWidth="infoMaxWidth"
      >
        <unnnic-icon
          icon="alert-circle-1-1"
          size="sm"
          scheme="neutral-cleanest"
        />
      </unnnic-tool-tip>
    </div>

    <unnnic-text-area
      :type="error ? 'error' : 'normal'"
      size="md"
      :placeholder="$t('project.fields.description.placeholder')"
      :value="value"
      @input="$emit('input', $event)"
    />
  </unnnic-form-element>
</template>

<script>
export default {
  props: {
    value: String,

    error: [Boolean, String],

    infoMaxWidth: {
      type: String,
      default: '21.125rem',
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.form-element .label {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;
}
</style>
