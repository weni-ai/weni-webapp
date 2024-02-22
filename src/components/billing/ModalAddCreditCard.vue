<template>
  <unnnic-modal
    :class="[
      'modal-add-credit-card',
      `modal-add-credit-card--scheme-${scheme}`,
    ]"
    text="Cadastro de cartão de crédito"
    @close="$emit('close')"
  >
    <div class="description">
      Cadastre seu cartão de crédito para concluir a contratação do plano
      {{ capitalize(name) }}
    </div>

    <div class="price">Plano {{ capitalize(name) }}: {{ price }}/mês</div>

    <form @submit.prevent="finish">
      <unnnic-form-element label="Número de identificação do titular">
        <unnnic-input
          placeholder="000.000.000-00"
          v-model="$store.state.BillingSteps.billing_details.cpfOrCnpj"
        />
      </unnnic-form-element>

      <unnnic-form-element label="Nome impresso no cartão">
        <unnnic-input
          placeholder="Nome completo"
          v-model="$store.state.BillingSteps.billing_details.name"
        />
      </unnnic-form-element>

      <unnnic-form-element label="Número do cartão">
        <div id="card-number"></div>
      </unnnic-form-element>

      <div class="form-group">
        <unnnic-form-element label="Vencimento">
          <div id="card-expiry"></div>
        </unnnic-form-element>

        <unnnic-form-element label="CVC">
          <div id="card-cvc"></div>
        </unnnic-form-element>
      </div>

      <unnnic-form-element :label="$t('billing.address.country')">
        <unnnic-select
          :placeholder="$t('billing.address.select')"
          v-model="$store.state.BillingSteps.billing_details.address.country"
          search
        >
          <option
            v-for="country in countries"
            :key="country.iso2"
            :value="country.iso2"
          >
            {{ country.native }}
          </option>
        </unnnic-select>
      </unnnic-form-element>

      <unnnic-form-element
        v-if="statesOptions"
        :label="$t('billing.address.state')"
      >
        <unnnic-select
          :placeholder="$t('billing.address.select')"
          v-model="$store.state.BillingSteps.billing_details.address.state"
          search
        >
          <option
            v-for="state in statesOptions"
            :key="state"
            :value="state"
          >
            {{ state }}
          </option>
        </unnnic-select>
      </unnnic-form-element>

      <unnnic-form-element
        v-else
        :label="$t('billing.address.state')"
      >
        <unnnic-input
          :placeholder="$t('billing.address.type')"
          v-model="$store.state.BillingSteps.billing_details.address.state"
        />
      </unnnic-form-element>

      <unnnic-form-element
        v-if="citiesOptions"
        :label="$t('billing.address.city')"
      >
        <unnnic-select
          :placeholder="$t('billing.address.select')"
          v-model="$store.state.BillingSteps.billing_details.address.city"
          search
        >
          <option
            v-for="city in citiesOptions"
            :key="city"
            :value="city"
          >
            {{ city }}
          </option>
        </unnnic-select>
      </unnnic-form-element>

      <unnnic-form-element
        v-else
        :label="$t('billing.address.city')"
      >
        <unnnic-input
          :placeholder="
            isBrazilian && !brazilianStateSelected
              ? $t('billing.address.select_state')
              : $t('billing.address.type')
          "
          :disabled="isBrazilian && !brazilianStateSelected"
          v-model="$store.state.BillingSteps.billing_details.address.city"
        />
      </unnnic-form-element>

      <unnnic-form-element :label="$t('billing.address.address_title')">
        <unnnic-input
          :placeholder="$t('billing.address.address_mask')"
          v-model="$store.state.BillingSteps.billing_details.address.line1"
        />
      </unnnic-form-element>

      <unnnic-form-element :label="$t('billing.address.cep')">
        <unnnic-input
          v-model="
            $store.state.BillingSteps.billing_details.address.postal_code
          "
        />
      </unnnic-form-element>

      <unnnic-button class="button-complete">Concluir</unnnic-button>

      <info-box
        :description="$t('billing.card.payment_day', { date: paymentDay })"
      ></info-box>
    </form>
  </unnnic-modal>
</template>

<script>
import orgs from '../../api/orgs';
import InfoBox from './InfoBox.vue';
const statesAndCitiesOfBrazil = require('../../assets/states-and-cities-of-brazil');

export default {
  components: {
    InfoBox,
  },

  props: {
    scheme: String,
    name: String,
    price: String,
  },

  data() {
    return {
      clientSecret: '',
      token: null,
      cardNumber: null,
      cardExpiry: null,
      cardCvc: null,

      countries: require('../../assets/countriesnames'),
    };
  },

  methods: {
    capitalize(s) {
      return s && s[0].toUpperCase() + s.slice(1);
    },

    async finish() {
      const response = await this.$stripe.confirmCardSetup(this.clientSecret, {
        payment_method: {
          card: this.cardNumber,
          billing_details: {
            name: this.$store.state.BillingSteps.billing_details.name,
            address: {
              country:
                this.$store.state.BillingSteps.billing_details.address.country,
              state:
                this.$store.state.BillingSteps.billing_details.address.state,
              city: this.$store.state.BillingSteps.billing_details.address.city,
              line1:
                this.$store.state.BillingSteps.billing_details.address.line1,
              postal_code:
                this.$store.state.BillingSteps.billing_details.address
                  .postal_code,
            },
          },
        },
      });

      console.log('response', response);

      if (response.error) {
        this.$emit('error', response.error);
      } else {
        await orgs.setupPlan({
          plan: this.name,
          customer: this.$store.state.BillingSteps.billing_details.customer,
        });

        await orgs.changeOrganizationPlan({
          organizationUuid: this.$route.params.orgUuid,
          plan: this.name,
        });

        this.$emit('complete');
      }
    },
  },

  mounted() {
    this.$store.state.BillingSteps.billing_details.cpfOrCnpj = '';
    this.$store.state.BillingSteps.billing_details.name = '';
    this.$store.state.BillingSteps.billing_details.additionalInformation = '';

    this.$store.state.BillingSteps.billing_details.address.city = '';
    this.$store.state.BillingSteps.billing_details.address.country = '';
    this.$store.state.BillingSteps.billing_details.address.state = '';
    this.$store.state.BillingSteps.billing_details.address.line1 = '';
    this.$store.state.BillingSteps.billing_details.address.postal_code = '';

    const style = {
      base: {
        color: '#4e5666',
        fontFamily: 'Lato, "Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '14px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      spacingUnit: '6px',
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    };

    this.cardNumber = this.stripeElements.create('cardNumber', {
      style,
      showIcon: true,
    });
    this.cardNumber.mount('#card-number');
    this.cardExpiry = this.stripeElements.create('cardExpiry', { style });
    this.cardExpiry.mount('#card-expiry');
    this.cardCvc = this.stripeElements.create('cardCvc', { style });
    this.cardCvc.mount('#card-cvc');

    orgs
      .setupIntentWithOrg({ organizationUuid: this.$route.params.orgUuid })
      .then((response) => {
        this.$store.state.BillingSteps.billing_details.customer =
          response?.data?.customer;
        this.clientSecret = response?.data?.client_secret;
      })
      .finally(() => {});
  },

  watch: {
    '$store.state.BillingSteps.billing_details.address.country'() {
      if (this.isBrazilian) {
        if (this.brazilianStateSelected) {
          if (!this.brazilianCitySelected) {
            this.$store.state.BillingSteps.billing_details.address.city = '';
          }
        } else {
          this.$store.state.BillingSteps.billing_details.address.state = '';
        }
      }
    },
  },

  computed: {
    paymentDay() {
      const date = new Date();
      const day = 1000 * 60 * 60 * 24;
      date.setTime(date.getTime() + 30 * day);
      return date.getDate();
    },

    stripeElements() {
      return this.$stripe.elements();
    },

    brazilianStateSelected() {
      if (this.isBrazilian) {
        return statesAndCitiesOfBrazil.estados.find(
          ({ nome }) =>
            nome ===
            this.$store.state.BillingSteps.billing_details.address.state,
        );
      }

      return null;
    },

    brazilianCitySelected() {
      if (this.brazilianStateSelected) {
        return this.brazilianStateSelected.cidades.find(
          (city) =>
            city ===
            this.$store.state.BillingSteps.billing_details.address.city,
        );
      }

      return null;
    },

    isBrazilian() {
      return (
        this.$store.state.BillingSteps.billing_details.address.country === 'BR'
      );
    },

    statesOptions() {
      if (this.isBrazilian) {
        return statesAndCitiesOfBrazil.estados.map(({ nome }) => nome);
      }

      return null;
    },

    citiesOptions() {
      if (this.brazilianStateSelected) {
        return this.brazilianStateSelected.cidades;
      }

      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

:deep(.label) {
  text-align: left;
}

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
  overflow: auto;

  :deep(.unnnic-modal-container) {
    height: auto;
    min-height: 100vh;
  }

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
