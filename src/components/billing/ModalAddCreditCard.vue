<template>
  <UnnnicModal
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
      <UnnnicFormElement label="Número de identificação do titular">
        <UnnnicInput
          placeholder="000.000.000-00"
          v-model="$store.state.BillingSteps.billing_details.cpfOrCnpj"
        />
      </UnnnicFormElement>

      <UnnnicFormElement label="Nome impresso no cartão">
        <UnnnicInput
          placeholder="Nome completo"
          v-model="$store.state.BillingSteps.billing_details.name"
        />
      </UnnnicFormElement>

      <UnnnicFormElement label="Número do cartão">
        <div id="card-number"></div>
      </UnnnicFormElement>

      <div class="form-group">
        <UnnnicFormElement label="Vencimento">
          <div id="card-expiry"></div>
        </UnnnicFormElement>

        <UnnnicFormElement label="CVC">
          <div id="card-cvc"></div>
        </UnnnicFormElement>
      </div>

      <UnnnicFormElement :label="$t('billing.address.country')">
        <UnnnicSelectSmart
          :value="
            [
              countries
                .map(({ native, iso2 }) => ({
                  value: iso2,
                  label: native,
                }))
                .find(
                  ({ value }) =>
                    value ===
                    $store.state.BillingSteps.billing_details.address.country,
                ),
            ].filter((i) => i)
          "
          @input="
            $store.state.BillingSteps.billing_details.address.country =
              $event[0].value
          "
          :options="
            [
              {
                value: '',
                label: $t('billing.address.select'),
              },
            ].concat(
              countries.map(({ native, iso2 }) => ({
                value: iso2,
                label: native,
              })),
            )
          "
          autocomplete
          autocompleteClearOnFocus
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-if="statesOptions"
        :label="$t('billing.address.state')"
      >
        <UnnnicSelectSmart
          :value="
            [
              statesOptions
                .map((state) => ({
                  value: state,
                  label: state,
                }))
                .find(
                  ({ value }) =>
                    value ===
                    $store.state.BillingSteps.billing_details.address.state,
                ),
            ].filter((i) => i)
          "
          @input="
            $store.state.BillingSteps.billing_details.address.state =
              $event[0].value
          "
          :options="
            [
              {
                value: '',
                label: $t('billing.address.select'),
              },
            ].concat(
              statesOptions.map((state) => ({
                value: state,
                label: state,
              })),
            )
          "
          autocomplete
          autocompleteClearOnFocus
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-else
        :label="$t('billing.address.state')"
      >
        <UnnnicInput
          :placeholder="$t('billing.address.type')"
          v-model="$store.state.BillingSteps.billing_details.address.state"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        v-if="citiesOptions"
        :label="$t('billing.address.city')"
      >
        <UnnnicSelectSmart
          :value="
            [
              citiesOptions
                .map((city) => ({
                  value: city,
                  label: city,
                }))
                .find(
                  ({ value }) =>
                    value ===
                    $store.state.BillingSteps.billing_details.address.city,
                ),
            ].filter((i) => i)
          "
          @input="
            $store.state.BillingSteps.billing_details.address.city =
              $event[0].value
          "
          :options="
            [
              {
                value: '',
                label: $t('billing.address.select'),
              },
            ].concat(
              citiesOptions.map((city) => ({
                value: city,
                label: city,
              })),
            )
          "
          autocomplete
          autocompleteClearOnFocus
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-else
        :label="$t('billing.address.city')"
      >
        <UnnnicInput
          :placeholder="
            isBrazilian && !brazilianStateSelected
              ? $t('billing.address.select_state')
              : $t('billing.address.type')
          "
          :disabled="isBrazilian && !brazilianStateSelected"
          v-model="$store.state.BillingSteps.billing_details.address.city"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.address.address_title')">
        <UnnnicInput
          :placeholder="$t('billing.address.address_mask')"
          v-model="$store.state.BillingSteps.billing_details.address.line1"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.address.cep')">
        <UnnnicInput
          v-model="
            $store.state.BillingSteps.billing_details.address.postal_code
          "
        />
      </UnnnicFormElement>

      <UnnnicButton class="button-complete">Concluir</UnnnicButton>

      <InfoBox
        :description="$t('billing.card.payment_day', { date: paymentDay })"
      ></InfoBox>
    </form>
  </UnnnicModal>
</template>

<script>
import orgs from '../../api/orgs';
import InfoBox from './InfoBox.vue';
import statesAndCitiesOfBrazil from'../../assets/states-and-cities-of-brazil';
import countries from '../../assets/countriesnames'

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

      countries,
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
