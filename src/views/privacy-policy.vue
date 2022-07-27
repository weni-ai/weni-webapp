<template>
  <div class="privacy-policy">
    <div class="container">
      <div class="navbar">
        <router-link to="/">
          <img class="unnnic--clickable" src="../assets/brand-name.svg" />
        </router-link>

        <unnnic-language-select
          :value="$i18n.locale"
          @input="changeLanguage"
          class="language-select"
          position="bottom"
          :supported-languages="['pt-br', 'en', 'es']"
        ></unnnic-language-select>
      </div>

      <div class="header">
        <div class="title">{{ $t('terms.title') }}</div>

        <div class="description">{{ $t('terms.last_update') }}</div>
      </div>

      <div class="content">
        <div class="warning">{{ $t('terms.warning') }}</div>

        <unnnic-accordion
          v-model="isOpenTermsOfService"
          :title="$t('terms.terms.title')"
        >
          <div v-html="$t('terms.terms.content')"></div>
        </unnnic-accordion>

        <unnnic-accordion
          v-model="isOpenPrivacyPolicy"
          :title="$t('terms.privacy.title')"
        >
          <div v-html="$t('terms.privacy.content')"></div>
        </unnnic-accordion>

        <unnnic-accordion
          v-model="isOpenCookiePolicy"
          :title="$t('terms.cookie.title')"
        >
          <div v-html="$t('terms.cookie.content')"></div>
        </unnnic-accordion>
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
