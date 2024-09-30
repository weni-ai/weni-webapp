<template>
  <div class="privacy-policy">
    <div class="container">
      <div class="navbar">
        <RouterLink to="/">
          <img
            class="unnnic--clickable"
            src="../assets/brand-name.svg"
          />
        </RouterLink>

        <UnnnicLanguageSelect
          :modelValue="$i18n.locale"
          class="language-select"
          position="bottom"
          :supportedLanguages="['pt-br', 'en', 'es']"
          @update:model-value="changeLanguage"
        ></UnnnicLanguageSelect>
      </div>

      <div class="header">
        <div class="title">{{ $t('terms.title') }}</div>

        <div class="description">{{ $t('terms.last_update') }}</div>
      </div>

      <div class="content">
        <div class="warning">{{ $t('terms.warning') }}</div>

        <UnnnicAccordion
          v-model:open="isOpenTermsOfService"
          :title="$t('terms.terms.title')"
        >
          <div v-html="$t('terms.terms.content')"></div>
        </UnnnicAccordion>

        <UnnnicAccordion
          v-model:open="isOpenPrivacyPolicy"
          :title="$t('terms.privacy.title')"
        >
          <div v-html="$t('terms.privacy.content')"></div>
        </UnnnicAccordion>

        <UnnnicAccordion
          v-model:open="isOpenCookiePolicy"
          :title="$t('terms.cookie.title')"
        >
          <div v-html="$t('terms.cookie.content')"></div>
        </UnnnicAccordion>

        <UnnnicAccordion
          v-model:open="isOpenAiGuidelines"
          :title="$t('terms.ai_guidelines.title')"
        >
          <div v-html="$t('terms.ai_guidelines.content')"></div>
        </UnnnicAccordion>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpenTermsOfService: false,
      isOpenPrivacyPolicy: false,
      isOpenCookiePolicy: false,
      isOpenAiGuidelines: false,
    };
  },

  methods: {
    changeLanguage(language) {
      const languages = {
        en: 'en',
        'pt-br': 'pt-br',
        es: 'es',
      };

      this.$i18n.locale = languages[language];
    },
  },
};
</script>

<style lang="scss" scoped>
.privacy-policy {
  min-height: 100vh;
  box-sizing: border-box;
  border-bottom: $unnnic-border-width-thick * 2 solid $unnnic-color-brand-weni;

  .language-select {
    width: 12.5rem;
  }
}

.container {
  margin: 0 12.88%;
  margin-top: $unnnic-spacing-stack-giant;
  padding-bottom: $unnnic-spacing-stack-xl;

  .navbar {
    padding-top: $unnnic-spacing-stack-xs;
    margin-bottom: $unnnic-spacing-stack-giant;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header {
    margin-bottom: $unnnic-spacing-stack-lg;

    .title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-title-lg;
      line-height: $unnnic-font-size-title-lg + $unnnic-line-height-md;
      margin-bottom: $unnnic-spacing-stack-nano;
    }

    .description {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  .content {
    .warning {
      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      text-align: justify;

      padding: $unnnic-inset-lg;
      background-color: $unnnic-color-background-carpet;
      border-radius: $unnnic-border-radius-md;
      margin-bottom: $unnnic-spacing-stack-md;
    }

    a {
      color: $unnnic-color-brand-weni;
      text-decoration: none;
    }

    .unnnic-accordion {
      margin: 0 $unnnic-spacing-inline-lg;
    }

    .unnnic-accordion + .unnnic-accordion {
      margin-top: $unnnic-spacing-stack-md;
    }
  }
}
</style>
