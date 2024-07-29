<template>
  <div :class="['container', type]">
    <div class="content">
      <img
        src="@/assets/not-found.svg"
        width="100%"
      />

      <template v-if="type === 'organization-require-two-factor'">
        <div class="title organization-require-two-factor">
          {{ $t('orgs.require_2fa.title') }}
        </div>

        <div
          class="description"
          v-html="$t('orgs.require_2fa.description')"
        ></div>

        <UnnnicButton
          size="large"
          type="primary"
          @click="$router.push({ name: 'account2fa' })"
          :style="{ width: '19.75rem', margin: '0 auto' }"
        >
          {{ $t('orgs.require_2fa.enable') }}
        </UnnnicButton>
      </template>

      <template v-else>
        <div class="title">{{ $t('not_found.title') }}</div>

        <div class="description">
          {{ $t('not_found.description') }}
        </div>

        <RouterLink
          to="/"
          class="back"
        >
          ← {{ $t('not_found.go_home') }}
        </RouterLink>
      </template>
    </div>

    <div class="footer">
      <div class="complete"></div>
      <template v-if="brokenFooter">
        <div class="left"></div>
        <div class="spacer"></div>
        <div class="right"></div>
        <div class="complete"></div>
      </template>
    </div>
  </div>
</template>

<script>
import account from '../api/account';

export default {
  props: {
    type: {
      type: String,
      default: 'not-found',
    },
  },

  async created() {
    const languages = {
      'en-us': 'en',
      'pt-br': 'pt-br',
    };

    const { data } = await account.profile();
    this.$i18n.locale = languages[data.language];
  },

  computed: {
    brokenFooter() {
      return this.type === 'not-found';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;

  &.not-found {
    min-width: 100vw;
    min-height: 100vh;
  }

  .content {
    max-width: 25rem;
    padding: $unnnic-inset-lg;
    padding-top: 0;
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

      &.organization-require-two-factor {
        font-size: $unnnic-font-size-title-md;
        line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
      }
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

  &.not-found .content {
    padding: $unnnic-inset-lg;
  }
}
</style>
