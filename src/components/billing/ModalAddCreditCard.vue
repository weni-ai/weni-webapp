<template>
  <UnnnicModal
    :class="[
      'modal-add-credit-card',
      `modal-add-credit-card--scheme-${scheme}`,
    ]"
    :text="$t('billing.add_credit_card_title')"
    @close="$emit('close')"
  >
    <div class="description">
      {{
        $t('billing.add_credit_card_modal.description', {
          plan: capitalize(name),
        })
      }}
    </div>

    <div class="price">
      {{ $t('plan') }} {{ capitalize(name) }}: {{ price }}/{{ $t('month') }}
    </div>

    <StripeElements
      v-if="stripeLoaded"
      v-slot="{ elements }"
      ref="elms"
      class="form__container"
      :stripeKey="stripeKey"
      :instanceOptions="instanceOptions"
      :elementsOptions="elementsOptions"
    >
      <UnnnicFormElement
        :label="$t('billing.add_credit_card_modal.field.cpf_cnpj')"
      >
        <UnnnicInput
          v-model="$store.state.BillingSteps.billing_details.cpfOrCnpj"
          placeholder="000.000.000-00"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="$t('billing.add_credit_card_modal.field.card_name')"
      >
        <UnnnicInput
          v-model="$store.state.BillingSteps.billing_details.name"
          :placeholder="$t('billing.add_credit_card_modal.field.full_name')"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="$t('billing.add_credit_card_modal.field.card_number')"
      >
        <StripeElement
          ref="card"
          type="cardNumber"
          :elements="elements"
          :options="{
            style: stripeElementsStyle,
            showIcon: true,
          }"
        />
      </UnnnicFormElement>

      <div class="form-group">
        <UnnnicFormElement
          :label="$t('billing.add_credit_card_modal.field.card_expiration')"
        >
          <StripeElement
            type="cardExpiry"
            :elements="elements"
            :options="{
              style: stripeElementsStyle,
            }"
          />
        </UnnnicFormElement>

        <UnnnicFormElement label="CVV/CVC">
          <StripeElement
            type="cardCvc"
            :elements="elements"
            :options="{
              style: stripeElementsStyle,
            }"
          />
        </UnnnicFormElement>
      </div>

      <UnnnicFormElement :label="$t('billing.address.country')">
        <UnnnicSelectSmart
          :modelValue="
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
          @update:model-value="
            $store.state.BillingSteps.billing_details.address.country =
              $event[0].value
          "
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-if="statesOptions"
        :label="$t('billing.address.state')"
      >
        <UnnnicSelectSmart
          :modelValue="
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
          @update:model-value="
            $store.state.BillingSteps.billing_details.address.state =
              $event[0].value
          "
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-else
        :label="$t('billing.address.state')"
      >
        <UnnnicInput
          v-model="$store.state.BillingSteps.billing_details.address.state"
          :placeholder="$t('billing.address.type')"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        v-if="citiesOptions"
        :label="$t('billing.address.city')"
      >
        <UnnnicSelectSmart
          :modelValue="
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
          @update:model-value="
            $store.state.BillingSteps.billing_details.address.city =
              $event[0].value
          "
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-else
        :label="$t('billing.address.city')"
      >
        <UnnnicInput
          v-model="$store.state.BillingSteps.billing_details.address.city"
          :placeholder="
            isBrazilian && !brazilianStateSelected
              ? $t('billing.address.select_state')
              : $t('billing.address.type')
          "
          :disabled="isBrazilian && !brazilianStateSelected"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.address.address_title')">
        <UnnnicInput
          v-model="$store.state.BillingSteps.billing_details.address.line1"
          :placeholder="$t('billing.address.address_mask')"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.address.cep')">
        <UnnnicInput
          v-model="
            $store.state.BillingSteps.billing_details.address.postal_code
          "
        />
      </UnnnicFormElement>

      <UnnnicButton
        class="button-complete"
        @click="finish"
        >{{ $t('finish') }}</UnnnicButton
      >

      <InfoBox
        :description="$t('billing.card.payment_day', { date: paymentDay })"
      ></InfoBox>
    </StripeElements>
  </UnnnicModal>
</template>

<script>
import { StripeElements, StripeElement } from 'vue-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import orgs from '../../api/orgs';
import InfoBox from './InfoBox.vue';
import statesAndCitiesOfBrazil from '../../assets/states-and-cities-of-brazil';
import countries from '../../assets/countriesnames';
import getEnv from '../../utils/env';

export default {
  components: {
    StripeElements,
    StripeElement,
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

      countries,

      stripeKey: getEnv('STRIPE_API'),
      stripeLoaded: false,
      instanceOptions: {},
      elementsOptions: {},
      stripeElementsStyle: {
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
      },
    };
  },

  computed: {
    paymentDay() {
      const date = new Date();
      const day = 1000 * 60 * 60 * 24;
      date.setTime(date.getTime() + 30 * day);
      return date.getDate();
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

  mounted() {
    const stripePromise = loadStripe(this.stripeKey);
    stripePromise.then(() => {
      this.stripeLoaded = true;
    });

    this.$store.state.BillingSteps.billing_details.cpfOrCnpj = '';
    this.$store.state.BillingSteps.billing_details.name = '';
    this.$store.state.BillingSteps.billing_details.additionalInformation = '';

    this.$store.state.BillingSteps.billing_details.address.city = '';
    this.$store.state.BillingSteps.billing_details.address.country = '';
    this.$store.state.BillingSteps.billing_details.address.state = '';
    this.$store.state.BillingSteps.billing_details.address.line1 = '';
    this.$store.state.BillingSteps.billing_details.address.postal_code = '';

    orgs
      .setupIntentWithOrg({ organizationUuid: this.$route.params.orgUuid })
      .then((response) => {
        this.$store.state.BillingSteps.billing_details.customer =
          response?.data?.customer;
        this.clientSecret = response?.data?.client_secret;
      })
      .finally(() => {});
  },

  methods: {
    capitalize(s) {
      return s && s[0].toUpperCase() + s.slice(1);
    },

    async finish() {
      const cardElement = this.$refs.card.stripeElement;

      const response = await this.$refs.elms.instance.confirmCardSetup(
        this.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: this.$store.state.BillingSteps.billing_details.name,
              address: {
                country:
                  this.$store.state.BillingSteps.billing_details.address
                    .country,
                state:
                  this.$store.state.BillingSteps.billing_details.address.state,
                city: this.$store.state.BillingSteps.billing_details.address
                  .city,
                line1:
                  this.$store.state.BillingSteps.billing_details.address.line1,
                postal_code:
                  this.$store.state.BillingSteps.billing_details.address
                    .postal_code,
              },
            },
          },
        },
      );

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

.form__container {
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

$plan-colors:
  'aux-blue-500' $unnnic-color-aux-blue-500,
  'aux-purple-500' $unnnic-color-aux-purple-500,
  'aux-orange-500' $unnnic-color-aux-orange-500,
  'aux-green-500' $unnnic-color-aux-green-500,
  'weni-600' $unnnic-color-weni-600;

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
