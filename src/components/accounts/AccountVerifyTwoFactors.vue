<template>
  <div>
    <header class="header2fa">
      <UnnnicBreadcrumb
        class=""
        :crumbs="breadcrumbs"
        @crumbClick="handleCrumbClick"
      />
    </header>
    <AccountDownload2FAApp
      :step="step"
      :onClickNextStep="handleNextStep"
    />
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
          name: this.$t('account.2fa.menu.title'),
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

.header2fa {
  margin-bottom: $unnnic-spacing-stack-xl;
}
</style>
