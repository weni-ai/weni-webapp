<template>
  <section>
    <header>
      <h2 class="section-title">{{ $t('orgs.about_org') }}</h2>
    </header>

    <unnnic-form-element
      class="form-element"
      :label="$t('orgs.create.org_name')"
    >
      <unnnic-input
        v-model="org.name"
        :placeholder="$t('orgs.create.org_name_placeholder')"
      />
    </unnnic-form-element>

    <unnnic-form-element
      class="form-element"
      :label="$t('orgs.create.org_description')"
    >
      <unnnic-text-area
        class="form-element__field-description"
        v-model="org.description"
        :placeholder="$t('orgs.create.org_description_placeholder')"
      ></unnnic-text-area>
    </unnnic-form-element>
  </section>
</template>

<script>
export default {
  props: {
    isValid: Boolean,
  },

  computed: {
    org() {
      return this.$store.state.BillingSteps.org;
    },

    formValues() {
      return [this.org.name, this.org.description].join('-');
    },
  },

  watch: {
    formValues: {
      immediate: true,

      handler() {
        const isValid = !!(this.org.name && this.org.description);

        this.$emit('update:isValid', isValid);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.form-element {
  &__field-description :deep(textarea) {
    min-height: 6 * $unnnic-font-size;
  }

  & + & {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
