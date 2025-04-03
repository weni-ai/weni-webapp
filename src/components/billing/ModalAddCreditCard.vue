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
          :modelValue="billingDetails.cpfOrCnpj"
          placeholder="000.000.000-00"
          @update:model-value="setBillingCpfCnpj($event)"
        />
      </UnnnicFormElement>

      <UnnnicFormElement
        :label="$t('billing.add_credit_card_modal.field.card_name')"
      >
        <UnnnicInput
          :modelValue="billingDetails.name"
          :placeholder="$t('billing.add_credit_card_modal.field.full_name')"
          @update:model-value="setBillingName($event)"
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
                .find(({ value }) => value === billingDetails.address.country),
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
          @update:model-value="updateBillingAddress('country', $event[0].value)"
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
                .find(({ value }) => value === billingDetails.address.state),
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
          @update:model-value="updateBillingAddress('state', $event[0].value)"
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-else
        :label="$t('billing.address.state')"
      >
        <UnnnicInput
          :modelValue="billingDetails.address.state"
          :placeholder="$t('billing.address.type')"
          @update:model-value="updateBillingAddress('state', $event)"
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
                .find(({ value }) => value === billingDetails.address.city),
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
          @update:model-value="updateBillingAddress('city', $event[0].value)"
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>

      <UnnnicFormElement
        v-else
        :label="$t('billing.address.city')"
      >
        <UnnnicInput
          :modelValue="billingDetails.address.city"
          :placeholder="
            isBrazilian && !brazilianStateSelected
              ? $t('billing.address.select_state')
              : $t('billing.address.type')
          "
          :disabled="isBrazilian && !brazilianStateSelected"
          @update:model-value="updateBillingAddress('city', $event)"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.address.address_title')">
        <UnnnicInput
          :modelValue="billingDetails.address.line1"
          :placeholder="$t('billing.address.address_mask')"
          @update:model-value="updateBillingAddress('line1', $event)"
        />
      </UnnnicFormElement>

      <UnnnicFormElement :label="$t('billing.address.cep')">
        <UnnnicInput
          :modelValue="billingDetails.address.postal_code"
          @update:model-value="updateBillingAddress('postal_code', $event)"
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
import { mapActions, mapState } from 'vuex';

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
    scheme: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    price: {
      type: String,
      default: '',
    },
  },
  emits: ['error', 'complete'],
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
    ...mapState({
      billingDetails: (state) => state.BillingSteps.billing_details,
    }),
    paymentDay() {
      const date = new Date();
      const day = 1000 * 60 * 60 * 24;
      date.setTime(date.getTime() + 30 * day);
      return date.getDate();
    },
    brazilianStateSelected() {
      if (this.isBrazilian) {
        return statesAndCitiesOfBrazil.estados.find(
          ({ nome }) => nome === this.billingDetails.address.state,
        );
      }

      return null;
    },
    brazilianCitySelected() {
      if (this.brazilianStateSelected) {
        return this.brazilianStateSelected.cidades.find(
          (city) => city === this.billingDetails.address.city,
        );
      }

      return null;
    },
    isBrazilian() {
      return this.billingDetails.address.country === 'BR';
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
    'billingDetails.address.country'() {
      if (this.isBrazilian) {
        if (this.brazilianStateSelected) {
          if (!this.brazilianCitySelected) {
            this.updateBillingAddress('city', '');
          }
        } else {
          this.updateBillingAddress('state', '');
        }
      }
    },
  },
  mounted() {
    const stripePromise = loadStripe(this.stripeKey);
    stripePromise.then(() => {
      this.stripeLoaded = true;
    });

    this.resetBillingDetails();

    this.setupIntentWithOrg({
      orgApi: orgs,
      orgUuid: this.$route.params.orgUuid,
    }).then((clientSecret) => {
      this.clientSecret = clientSecret;
    });
  },
  methods: {
    ...mapActions([
      'setBillingCpfCnpj',
      'setBillingName',
      'setBillingAdditionalInfo',
      'setBillingCustomer',
      'setBillingAddress',
      'resetBillingDetails',
      'setupIntentWithOrg',
    ]),
    updateBillingAddress(field, value) {
      this.setBillingAddress({ field, value });
    },
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
              name: this.billingDetails.name,
              address: {
                country: this.billingDetails.address.country,
                state: this.billingDetails.address.state,
                city: this.billingDetails.address.city,
                line1: this.billingDetails.address.line1,
                postal_code: this.billingDetails.address.postal_code,
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
          customer: this.billingDetails.customer,
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
