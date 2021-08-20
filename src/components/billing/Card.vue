<template>
  <div class="billing-card">
    <h1>{{ title }}</h1>

    <ul class="billing-list-beneficits">
      <li class="billing-list-beneficits__item">
        <unnnic-icon-svg icon="check-2" size="sm" scheme="aux-blue" />
        <span class="billing-list-beneficits__item__title">1</span>
        <unnnic-tool-tip text="Label" enabled side="right" maxWidth="15rem">
          <unnnic-icon-svg
            icon="information-circle-4"
            size="sm"
            scheme="neutral-clean"
          />
        </unnnic-tool-tip>
      </li>
    </ul>

    <div v-if="hasIntegration" class="billing-switch">
      <unnnicSwitch size="small" v-model="isNewIntegration" />
      <span>Integrações extras WhatsApp + R$899 /un.</span>
    </div>
    <div v-if="isNewIntegration" class="billing-add-integration">
      <unnnic-button
        @click="removeNewIntegration"
        type="secondary"
        size="small"
        iconCenter="subtract-1"
        :disabled="disableRemoveNewIntegrationButton"
      />
      <unnnic-input size="sm" v-model="amountNewIntegration" />
      <unnnic-button
        @click="addNewIntegration"
        type="secondary"
        size="small"
        iconCenter="add-1"
      />
    </div>

    <div class="billing-price" v-if="type === 'free' || type === 'paid'">
      <div>
        <span class="billing-price__currency">R$&nbsp;</span>
        <span class="billing-price__price">{{ price }}</span>
      </div>
      <p class="billing-price__info">
        até <strong>{{ amountContacts }}</strong> contatos ativos
      </p>
    </div>

    <div class="billing-buttons">
      <div v-if="type === 'free'">
        <p>Sem necessidades</p>
        <unnnic-button type="secondary">Começar gratuitamente</unnnic-button>
      </div>
      <div v-if="type === 'paid'">
        <p>Sem necessidades</p>

        <unnnic-button>Choose it</unnnic-button>
      </div>
      <div class="billing-buttons__custom" v-if="type === 'custom'">
        <p
          v-if="!isAddAcessCodeVisible"
          class="billing-buttons__custom__access-code"
          @click="isAddAcessCodeVisible = !isAddAcessCodeVisible"
        >
          Sem necessidades
        </p>
        <div class="billing-buttons__custom__form" v-if="isAddAcessCodeVisible">
          <unnnic-input v-model="accessCode" />
          <div>
            <unnnic-button
              type="terciary"
              @click="isAddAcessCodeVisible = !isAddAcessCodeVisible"
            >
              Choose it
            </unnnic-button>
            <unnnic-button
              :disabled="!accessCode"
              @click="$emit('top', 'custom')"
              type="secondary"
            >
              Choose it
            </unnnic-button>
          </div>
        </div>

        <div v-else>
          <unnnic-button type="secondary">Choose it</unnnic-button>
          <unnnic-button type="secondary">Choose it</unnnic-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'free',
      validator: (val) => ['free', 'paid', 'custom'].includes(val),
    },

    hasIntegration: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    disableRemoveNewIntegrationButton() {
      return this.amountNewIntegration == 1;
    },
    amountContacts() {
      if (this.type === 'paid') return '1.000';
      return 200;
    },
  },

  watch: {
    amountNewIntegration() {
      this.price =
        this.type === 'paid' ? 1200 + 899 * this.amountNewIntegration : 0;
    },
    isNewIntegration() {
      if (this.isNewIntegration === false) this.amountNewIntegration = '0';
      if (this.isNewIntegration === true && this.amountNewIntegration === '0')
        this.amountNewIntegration = '1';
    },
  },

  data() {
    return {
      title: this.$t(`billing.${this.type}.title`),

      isNewIntegration: false,
      amountNewIntegration: '0',
      price: this.type === 'paid' ? 1200 : 0,

      isAddAcessCodeVisible: false,
      accessCode: '',
    };
  },

  methods: {
    addNewIntegration() {
      this.amountNewIntegration = String(Number(this.amountNewIntegration) + 1);
    },
    removeNewIntegration() {
      this.amountNewIntegration = String(Number(this.amountNewIntegration) - 1);
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-card {
  display: flex;
  flex-direction: column;
  color: black;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-inset-md;
  min-height: 500px;

  h1 {
    margin: 0;
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-black;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  .billing-list-beneficits {
    list-style: none;
    padding: 0;
    margin: 0;

    &__item {
      display: flex;
      align-items: center;

      &__title {
        margin: 0 $unnnic-inline-xs;
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-lg;
      }
    }
  }

  .billing-switch {
    display: flex;
    align-items: center;
    margin-top: $unnnic-spacing-stack-sm;
    > span {
      font-size: $unnnic-font-size-body-md;
    }
  }

  .billing-add-integration {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $unnnic-spacing-stack-xs;

    > button,
    .unnnic-form {
      width: 100%;
      max-width: 87px;
    }

    .unnnic-form {
      margin: 0 8px;
    }
  }

  .billing-price {
    margin-top: $unnnic-spacing-stack-md;

    > div {
      display: flex;
      align-items: center;
    }

    &__currency {
      font-size: $unnnic-font-size-title-sm;
      color: $unnnic-color-neutral-black;
    }

    &__price {
      font-size: $unnnic-font-size-title-lg;
      color: $unnnic-color-brand-sec-dark;
      font-weight: $unnnic-font-weight-black;
    }

    &__info {
      margin: 0;
      color: $unnnic-color-neutral-cloudy;
      font-size: $unnnic-font-size-body-gt;
      > strong {
        color: $unnnic-color-neutral-dark;
      }
    }
  }

  .billing-buttons {
    margin-top: auto;
    text-align: center;
    button {
      width: 100%;
    }

    &__custom {
      &__access-code {
        color: $unnnic-color-neutral-cloudy;
        text-decoration: underline;
        cursor: pointer;
      }

      &__form {
        display: flex;
        flex-direction: column;

        > div:last-child {
          display: flex;
          margin-top: $unnnic-spacing-stack-md;

          button:first-child {
            margin-right: $unnnic-spacing-stack-sm;
          }
        }
      }
    }
  }

  @media screen and (max-width: 1150px) {
    .billing-switch {
      align-items: flex-start;
    }
  }
}
</style>
