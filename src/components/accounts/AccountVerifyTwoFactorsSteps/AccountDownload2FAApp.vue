<template>
  <div v-if="step == 0" class="Account2FA">
    <div class="Account2FA__header">
      <h1>Habilitar verificação de dois fatores</h1>
      <p>
        Para a sua maior segurança, habilite a verificação de dois fatores,
        assim você terá uma camada extra de segurança na sua conta. 🔐
      </p>

      <unnnic-switch textRight="Habilitar autenticação" v-model="enable2FA" />
    </div>

    <main class="Account2FA__content">
      <h3>Instruções</h3>
      <p>
        Para realizar este procedimento, logo a baixo, você irá encontrar dois
        campos de informações, Microsoft Authenticator Android e IOs, escolha a
        opção que seja compativel com seu smartphone e siga as instruções.
      </p>

      <unnnic-accordion
        v-model="isAndroidAccordionOpen"
        title="Baixe o aplicativo Microsoft Authenticator para Android"
      >
        Siga as seguintes instruções para instalar o aplicativo em seu celular:

        <ol>
          <li><b>Abra</b> um leitor de QR code no seu celular.</li>
          <li><b>Aponte a câmera</b> do seu celular para o QR code.</li>
          <li>
            O seu celular irá lhe direcionar para a Play Store,
            <b>instale o aplicativo.</b>
          </li>
        </ol>

        <qr-code class="qr-code-link-app" text="https://www.1stg.me"></qr-code>
      </unnnic-accordion>
      <unnnic-accordion
        v-model="isIOsAccordionOpen"
        title="Baixe o aplicativo Microsoft Authenticator para IOs"
      >
        Siga as seguintes instruções para instalar o aplicativo em seu celular:

        <ol>
          <li><b>Abra</b> um leitor de QR code no seu celular.</li>
          <li><b>Aponte a câmera</b> do seu celular para o QR code.</li>
          <li>
            O seu celular irá lhe direcionar para a App Store,
            <b>instale o aplicativo.</b>
          </li>
        </ol>

        <qr-code class="qr-code-link-app" text="https://www.1stg.me"></qr-code>
      </unnnic-accordion>

      <unnnic-button
        size="large"
        type="secondary"
        @click="handleHabilitAuthentication"
      >
        Avançar
      </unnnic-button>
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import account from '../../../api/account';

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
    };
  },
  methods: {
    async handleHabilitAuthentication() {
      try {
        await account.updateAccountProfile2FAStatus(this.enable2FA);
        this.showConfirmation();
      } catch (error) {
        console.log(error);
      }
    },

    showConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('orgs.save_success'),
          description: this.$t('orgs.save_success_text'),
        },
      });
    },
  },
};
</script>

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

    border-bottom: 1px solid $unnnic-color-neutral-clean;
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
