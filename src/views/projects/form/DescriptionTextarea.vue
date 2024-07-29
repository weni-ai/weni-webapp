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
      :value="value"
      @input="$emit('input', $event)"
      :maxLength="1000"
    />
  </UnnnicFormElement>
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
