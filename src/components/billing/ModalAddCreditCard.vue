<template>
  <unnnic-modal
    :class="[`modal-add-credit-card--scheme-${scheme}`]"
    text="Cadastro de cartão de crédito"
    @close="$emit('close')"
  >
    <div class="description">
      Cadastre seu cartão de crédito para concluir a contratação do plano
      {{ capitalize(name) }}
    </div>

    <div class="price">Plano {{ capitalize(name) }}: {{ price }}/mês</div>

    <form @submit.prevent="$emit('complete')">
      <unnnic-form-element label="Número de identificação do titular">
        <unnnic-input placeholder="000.000.000-00" />
      </unnnic-form-element>

      <unnnic-form-element label="Nome impresso no cartão">
        <unnnic-input placeholder="Nome completo" />
      </unnnic-form-element>

      <unnnic-form-element label="Número do cartão">
        <unnnic-input placeholder="1234 1234 1234 1234" />
      </unnnic-form-element>

      <div class="form-group">
        <unnnic-form-element label="Vencimento">
          <unnnic-input placeholder="MM / AA" />
        </unnnic-form-element>

        <unnnic-form-element label="CVC">
          <unnnic-input placeholder="000" />
        </unnnic-form-element>
      </div>

      <unnnic-button class="button-complete">Concluir</unnnic-button>

      <info-box
        description="A cobrança na fatura será feita do cartão será feita todo dia 5"
      ></info-box>
    </form>
  </unnnic-modal>
</template>

<script>
import InfoBox from './InfoBox.vue';

export default {
  components: {
    InfoBox,
  },

  props: {
    scheme: String,
    name: String,
    price: String,
  },

  methods: {
    capitalize(s) {
      return s && s[0].toUpperCase() + s.slice(1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.description {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;
  color: $unnnic-color-neutral-cloudy;
}

.price {
  text-align: center;
  padding: $unnnic-spacing-sm;
  border-radius: $unnnic-border-radius-md;
  margin: $unnnic-spacing-md 0;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-lg;
  line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-black;
  color: $unnnic-color-neutral-cloudy;
}

form {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;

  .form-group {
    display: grid;
    gap: $unnnic-spacing-sm;
    grid-template-columns: repeat(auto-fill, minmax(13.5625rem, 1fr));
  }
}

.button-complete {
  width: 100%;
}

$plan-colors: 'aux-blue-500' $unnnic-color-aux-blue-500,
  'aux-purple-500' $unnnic-color-aux-purple-500,
  'aux-orange-500' $unnnic-color-aux-orange-500,
  'aux-green-500' $unnnic-color-aux-green-500, 'weni-600' $unnnic-color-weni-600;

.modal-add-credit-card {
  &--scheme {
    @each $name, $color in $plan-colors {
      &-#{$name} {
        .price {
          color: $color;
          outline-color: $color;
        }

        .button-complete {
          background-color: $color;
        }
      }
    }
  }
}
</style>
