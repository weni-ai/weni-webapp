<template>
  <div v-if="step == 0" class="Account2FA">
    <div class="Account2FA__header">
      <h1>{{ $t('account.2fa.header.title') }}</h1>
      <p>{{ $t('account.2fa.header.description') }}</p>
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

      <unnnic-button size="large" type="secondary" @click="onClickNextStep">
        {{ $t('next') }}
      </unnnic-button>
    </main>
  </div>

  <div v-else-if="step == 1" class="Account2FA">
    <div class="Account2FA__header">
      <h1>Autenticar verificação de dois fatores</h1>
      <p>
        Para a sua maior segurança, habilite a verificação de dois fatores,
        assim você terá uma camada extra de segurança na sua conta. 🔐
      </p>
    </div>

    <main class="Account2FA__content">
      <h3>Instruções</h3>
      <p>
        Para realizar este procedimento, logo a baixo, você irá encontrar
        instruções para autenticar
      </p>

      <unnnic-accordion
        v-model="isIOsAccordionOpen"
        title="QR Code autentificador"
      >
        Quae assumenda aut non nulla quod ratione odio. Suscipit voluptatem
        natus a. Cumque et delectus ut. Nostrum ratione eos voluptatem voluptatu
        quia quod qui. Velit in consequatur corrupti similique. Quae assumenda
        aut non nulla quod ratione odio. Suscipit voluptatem natus a.
      </unnnic-accordion>

      <footer class="Account2FA__footer">
        <unnnic-input
          label="Insira o código de uso único"
          placeholder="Ex.: 245423"
        />

        <unnnic-button size="large" type="secondary" @click="onClickNextStep">
          Verificar código de uso único
        </unnnic-button>
      </footer>
    </main>
  </div>
</template>

<script>
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
  data() {
    return {
      isIOsAccordionOpen: false,
      isAndroidAccordionOpen: false,
    };
  },

  methods: {
    getEnv,
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
