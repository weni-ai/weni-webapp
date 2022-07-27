<template>
  <div v-if="step == 0" class="Account2FA">
    <div class="Account2FA__header">
      <h1>{{ $t('account.2fa.header.title') }}</h1>
      <p>{{ $t('account.2fa.header.description') }}</p>
      <unnnic-switch :textRight="$t('orgs.enable_2fa')" v-model="enable2FA" />
    </div>

    <main class="Account2FA__content">
      <h3>{{ $t('account.2fa.instructions.title') }}</h3>
      <p>{{ $t('account.2fa.instructions.subtitle') }}</p>

      <unnnic-accordion
        v-model="isAndroidAccordionOpen"
        :title="$t('account.2fa.instructions.android.title')"
      >
        {{ $t('account.2fa.instructions.android.follow_instructions') }}

        <ol>
          <li
            v-for="(step, index) in $t(
              'account.2fa.instructions.android.steps',
            )"
            :key="index"
            v-html="step"
          ></li>
        </ol>

        <qr-code
          class="qr-code-link-app"
          :text="getEnv('VUE_APP_2FA_APP_ANDROID')"
        ></qr-code>
      </unnnic-accordion>
      <unnnic-accordion
        v-model="isIOsAccordionOpen"
        :title="$t('account.2fa.instructions.ios.title')"
      >
        {{ $t('account.2fa.instructions.ios.follow_instructions') }}

        <ol>
          <li
            v-for="(step, index) in $t('account.2fa.instructions.ios.steps')"
            :key="index"
            v-html="step"
          ></li>
        </ol>

        <qr-code
          class="qr-code-link-app"
          :text="getEnv('VUE_APP_2FA_APP_IOS')"
        ></qr-code>
      </unnnic-accordion>

      <unnnic-button
        size="large"
        type="secondary"
        :loading="saving"
        @click="saveChanges"
      >
        {{ $t('save') }}
      </unnnic-button>
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import account from '../../../api/account';
import getEnv from '@/utils/env';

export default {
  props: {
    step: {
      type: Number,
    },
    onClickNextStep: {
      type: Function,
    },
  },
  computed: {
    ...mapGetters(['user']),
  },
  mounted() {
    this.enable2FA = this.user.has_2fa;
  },
  data() {
    return {
      isIOsAccordionOpen: false,
      isAndroidAccordionOpen: false,
      enable2FA: false,
      saving: false,
    };
  },
  methods: {
    ...mapActions(['openModal']),

    saveChanges() {
      if (this.enable2FA) {
        this.handleHabilitAuthentication();
      } else {
        this.openModal({
          type: 'confirm',
          data: {
            persistent: true,
            icon: 'alert-circle-1',
            scheme: 'feedback-red',
            title: this.$t('account.2fa.modals.disable.title'),
            description: this.$t('account.2fa.modals.disable.description', {
              sentence: this.$t('account.2fa.modals.disable.sentence'),
            }),
            validate: {
              label: this.$t('account.2fa.modals.disable.label', {
                sentence: this.$t('account.2fa.modals.disable.sentence'),
              }),
              placeholder: this.$t('account.2fa.modals.disable.sentence'),
              text: this.$t('account.2fa.modals.disable.sentence'),
            },
            cancelText: this.$t('cancel'),
            confirmText: this.$t('account.2fa.modals.disable.buttons.save'),
            onConfirm: async (justClose, { setLoading }) => {
              setLoading(true);
              await this.handleHabilitAuthentication();
              setLoading(false);

              justClose();
            },
          },
        });
      }
    },

    async handleHabilitAuthentication() {
      let realEnable2FA = this.user.has_2fa;

      try {
        this.saving = true;
        await account.updateAccountProfile2FAStatus(this.enable2FA);

        realEnable2FA = this.enable2FA;

        if (this.enable2FA) {
          this.showEnabled2FAConfirmation();
        } else {
          this.showDisabled2FAConfirmation();
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.$store.state.Account.profile.has_2fa = realEnable2FA;
        this.saving = false;
      }
    },

    showEnabled2FAConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('account.2fa.modals.enabled.title'),
          description: this.$t('account.2fa.modals.enabled.description'),
        },
      });

      setTimeout(() => {
        this.$router.push({ name: 'orgs' });
        this.$keycloak.logout();
      }, 5e3);
    },

    showDisabled2FAConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('account.2fa.modals.disabled.title'),
          description: this.$t('account.2fa.modals.disabled.description'),
        },
      });
    },
    getEnv,
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.unnnic-switch {
  user-select: none;

  ::v-deep .unnnic-icon {
    cursor: pointer;
  }
}
</style>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.Account2FA {
  &__header {
    h1 {
      margin: 0;
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-title-md;
      line-height: $unnnic-line-height-md + $unnnic-font-size-title-md;
      color: $unnnic-color-neutral-black;
    }

    p {
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-line-height-md + $unnnic-font-size-body-lg;
      color: $unnnic-color-neutral-cloudy;
      margin-top: $unnnic-spacing-stack-xs;
      margin-bottom: $unnnic-spacing-stack-md;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    h3 {
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-line-height-md + $unnnic-font-size-body-lg;
      font-weight: $unnnic-font-weight-bold;
      margin: $unnnic-spacing-stack-lg 0 $unnnic-spacing-stack-xs;
      color: $unnnic-color-neutral-darkest;
    }

    p {
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-line-height-md + $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-cloudy;
      margin: 0 0 $unnnic-spacing-stack-md;
      font-weight: $unnnic-font-weight-regular;
    }

    button {
      align-self: center;
      width: 316px;
    }

    .unnnic-accordion {
      & + .unnnic-accordion {
        margin-top: $unnnic-spacing-stack-md;
        margin-bottom: $unnnic-spacing-stack-xgiant;
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: row;
    align-items: end;
    justify-content: space-between;
    gap: $unnnic-spacing-stack-lg;
    margin-top: $unnnic-spacing-stack-md;

    .unnnic-form p {
      margin-top: 0;
    }

    .unnnic-form,
    button {
      width: 100%;
    }

    button {
      align-self: auto;
    }
  }

  .qr-code-link-app {
    width: 126px;
    margin: 0 auto;

    img {
      width: 126px;
      border: 5px solid #ffffff;
      box-sizing: border-box;
    }
  }
}
</style>
