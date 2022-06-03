<template>
  <div>
    <header class="header2fa">
      <unnnicBreadcrumb
        class=""
        :crumbs="breadcrumbs"
        @crumbClick="handleCrumbClick"
      />
    </header>
    <AccountDownload2FAApp :step="step" :onClickNextStep="handleNextStep" />
  </div>
</template>

<script>
import AccountDownload2FAApp from './AccountVerifyTwoFactorsSteps/AccountDownload2FAApp.vue';
export default {
  components: {
    AccountDownload2FAApp,
  },
  data() {
    return {
      step: 0,
      breadcrumbs: [
        {
          name: 'Privacidade e segurança',
        },
      ],
    };
  },
  methods: {
    handleCrumbClick() {
      if (this.breadcrumbs.length > 1) {
        this.breadcrumbs.pop();
        this.step--;
      }
    },
    handleNextStep() {},
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.header2fa {
  margin-bottom: $unnnic-spacing-stack-xl;
}
</style>
