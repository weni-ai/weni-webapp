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
        v-model="$store.state.BillingSteps.org.name"
        :placeholder="$t('orgs.create.org_name_placeholder')"
      />
    </unnnic-form-element>

    <unnnic-form-element
      class="form-element"
      :label="$t('orgs.create.org_description')"
    >
      <unnnic-text-area
        class="form-element__field-description"
        v-model="$store.state.BillingSteps.org.description"
        :placeholder="$t('orgs.create.org_description_placeholder')"
      ></unnnic-text-area>
    </unnnic-form-element>
  </section>
</template>

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
