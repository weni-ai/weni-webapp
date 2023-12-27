<template>
  <div>
    <div
      v-if="verifyMail"
      class="warning-bar"
      :style="{
        display: verifyMail ? null : 'none',
      }"
    >
      <unnnic-icon-svg icon="alert-circle-1-1" size="md" class="icon" />

      {{ $t('alerts.verify_mail.title', { mail: user.email }) }}

      <a href="#" @click.prevent="resendMail">
        {{ $t('alerts.verify_mail.resend_message') }}
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import account from '../api/account';

export default {
  props: {},

  data() {
    return {
      verifyMail: false,
    };
  },

  computed: {
    ...mapGetters(['user']),
  },

  watch: {
    user: {
      immediate: true,
      async handler(user) {
        this.verifyMail = false;

        if (!user) {
          return;
        }

        try {
          if (!this.user.email_verified) {
            this.verifyMail = true;
            return;
          }
        } catch (error) {
          console.log(error);
        }
      },
    },
  },

  methods: {
    ...mapActions(['openModal']),
    async resendMail() {
      try {
        await account.resendMailVerification();

        this.openModal({
          type: 'alert',
          data: {
            icon: 'check_circle',
            scheme: 'feedback-green',
            title: this.$t('alerts.verify_mail.title', this.user.email),
            description: this.$t('alerts.verify_mail.description'),
          },
        });
      } catch (error) {
        this.openModal({
          type: 'alert',
          data: {
            icon: 'alert-circle-1',
            scheme: 'feedback-red',
            title: this.$t('alerts.server_problem.title'),
            description: this.$t('alerts.server_problem.description'),
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.warning-bar {
  background-color: $unnnic-color-aux-orange-500;
  color: $unnnic-color-neutral-white;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-lg;
  line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  text-align: center;
  padding: 0.75rem 0;

  .icon {
    margin-right: $unnnic-spacing-inline-xs;

    ::v-deep .primary {
      fill: $unnnic-color-background-sky;
    }
  }

  a {
    color: inherit;
    text-underline-offset: $unnnic-spacing-stack-nano;
  }
}
</style>
