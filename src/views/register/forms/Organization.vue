<template>
  <section>
    <header>
      <h2 class="section-title">{{ $t('orgs.about_org') }}</h2>
    </header>

    <UnnnicFormElement
      class="form-element"
      :label="$t('orgs.create.org_name')"
    >
      <UnnnicInput
        v-model="org.name"
        :placeholder="$t('orgs.create.org_name_placeholder')"
      />
    </UnnnicFormElement>

    <UnnnicFormElement
      class="form-element"
      :label="$t('orgs.create.org_description')"
    >
      <UnnnicTextArea
        v-model="org.description"
        class="form-element__field-description"
        :placeholder="$t('orgs.create.org_description_placeholder')"
      ></UnnnicTextArea>
    </UnnnicFormElement>
  </section>
</template>

<script>
export default {
  name: 'OrganizationComponent',

  computed: {
    org() {
      return this.$store.state.BillingSteps.org;
    },

    formValues() {
      return [this.org.name, this.org.description].join('-');
    },

    isValid() {
      return !!(this.org.name && this.org.description);
    },
  },

  watch: {
    isValid: {
      immediate: true,

      handler() {
        this.$emit('update:isValid', this.isValid);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.form-element {
  &__field-description :deep(textarea) {
    min-height: 6 * $unnnic-font-size;
  }

  & + & {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
