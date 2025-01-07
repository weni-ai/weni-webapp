<!-- eslint-disable vue/no-v-html -->
<template>
  <UnnnicModalDialog
    :modelValue="show && (orgExpired || orgExpiring)"
    class="trial-period-modal"
    :primaryButtonProps="{ text: $t('contact_us') }"
    :secondaryButtonProps="{
      text: $t('cancel'),
    }"
    showActionsDivider
    @primary-button-click="sendToEmail()"
    @secondary-button-click="closeModal()"
  >
    <section class="trial-period-modal__content">
      <img
        height="120"
        width="120"
        src="@/assets/doris-pc.png"
      />
      <section>
        <h1 class="trial-period-modal__title">
          {{
            $t(
              `billing.modals.trial_${orgExpiring ? 'expiring' : 'expired'}.title`,
            )
          }}
        </h1>
        <p
          class="trial-period-modal__info"
          v-html="$t('billing.modals.trial_expired.description')"
        />
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script>
export default {
  props: { show: { type: Boolean, required: true } },
  emits: ['close'],
  data() {
    return {
      alreadyShowed: {},
      orgExpired: null,
      orgExpiring: null,
    };
  },

  computed: {
    orgUuid() {
      return this.$store.getters.org?.uuid;
    },
  },

  watch: {
    orgUuid: {
      immediate: true,
      handler() {
        this.orgExpired = null;
        this.orgExpiring = null;

        if (!this.orgUuid) {
          return;
        }

        if (
          !['free', 'trial', 'start', 'scale', 'advanced'].includes(
            this.$store.getters.org?.organization_billing?.plan,
          )
        ) {
          return;
        }

        if (this.alreadyShowed[this.orgUuid]) {
          return;
        }

        if (
          this.$store.getters.org.organization_billing.days_till_trial_end ===
          null
        ) {
          return;
        }

        this.orgExpired =
          this.$store.getters.org.organization_billing.plan === 'trial' &&
          this.$store.getters.org.organization_billing.days_till_trial_end < 0;

        if (!this.orgExpired) {
          const days =
            this.$store.getters.org.organization_billing.plan === 'trial' &&
            this.$store.getters.org.organization_billing.days_till_trial_end;

          this.orgExpiring = days >= 0 && days <= 3;
        }

        if (this.orgExpired || this.orgExpiring) {
          this.alreadyShowed[this.orgUuid] = true;
        }
      },
    },
  },

  methods: {
    closeModal() {
      this.$emit('close');
    },
    sendToEmail() {
      window.open('mailto:email@provedor.com.br');
    },
  },
};
</script>

<style lang="scss" scoped>
.trial-period-modal {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-spacing-md;
    text-align: center;
  }

  &__title {
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-black;
    line-height: $unnnic-line-height-large * 1.75;
    color: $unnnic-color-neutral-darkest;
    margin: 0;
  }

  &__info {
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-large * 1.375;
    color: $unnnic-color-neutral-cloudy;
    margin-top: $unnnic-spacing-xs;
  }
}
a {
  text-underline-offset: $unnnic-spacing-stack-nano;
}
</style>
