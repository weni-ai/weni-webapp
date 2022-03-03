<template>
  <div class="not-found">
    <div class="content">
      <img src="@/assets/not-found.svg" width="100%" />

      <div class="title">{{ $t('not_found.title') }}</div>

      <div class="description">
        {{ $t('not_found.description') }}
      </div>

      <router-link to="/" class="back">
        ← {{ $t('not_found.go_home') }}
      </router-link>
    </div>

    <div class="footer">
      <div class="complete"></div>
      <div class="left"></div>
      <div class="spacer"></div>
      <div class="right"></div>
      <div class="complete"></div>
    </div>
  </div>
</template>

<script>
import account from '../api/account';

export default {
  created() {
    const languages = {
      'en-us': 'en',
      'pt-br': 'pt-br',
    };

    async function start() {
      const { data } = await account.profile();
      this.$i18n.locale = languages[data.language];
    }
    start();
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.not-found {
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;

  .content {
    max-width: 25rem;
    padding: $unnnic-inset-lg;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-h4;
      line-height: $unnnic-font-size-h4 + $unnnic-line-height-md;
      color: $unnnic-color-neutral-darkest;
      margin-bottom: $unnnic-spacing-stack-sm;
    }

    .description {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      color: $unnnic-color-neutral-darkest;
      margin-bottom: $unnnic-spacing-stack-lg;
    }

    .back {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      color: $unnnic-color-neutral-darkest;
      text-decoration: underline;
    }
  }

  .footer {
    align-self: normal;
    display: flex;

    .left,
    .right,
    .complete {
      height: $unnnic-border-width-thick * 2;
      width: $unnnic-border-width-thick * 2;
      background-size: cover;
    }

    .left {
      background-image: url('../assets/footer/broken-footer-left.svg');
    }

    .right {
      background-image: url('../assets/footer/broken-footer-right.svg');
    }

    .complete {
      width: auto;
      flex: 1;
      background-color: $unnnic-color-neutral-darkest;
    }

    .spacer {
      width: $unnnic-inline-md;
    }
  }
}
</style>
