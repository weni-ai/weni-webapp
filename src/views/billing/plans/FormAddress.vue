<template>
  <div class="billing-address-form">
    <div class="billing-address-form__duplicated">
      <UnnnicInput
        v-model="BillingStepsStore.billing_details.address.postal_code"
        :label="$t('billing.address.cep')"
      />

      <UnnnicFormElement :label="$t('billing.address.country')">
        <UnnnicSelect
          :modelValue="BillingStepsStore.billing_details.address.country"
          :options="countryOptions"
          :placeholder="$t('billing.address.select')"
          enableSearch
          :search="countrySearch"
          @update:search="countrySearch = $event"
          @update:model-value="
            BillingStepsStore.billing_details.address.country = $event
          "
        />
      </UnnnicFormElement>
    </div>

    <div class="billing-address-form__duplicated">
      <UnnnicFormElement
        v-if="statesOptions"
        :label="$t('billing.address.state')"
      >
        <UnnnicSelect
          :modelValue="BillingStepsStore.billing_details.address.state"
          :options="stateSelectOptions"
          :placeholder="$t('billing.address.select')"
          enableSearch
          :search="stateSearch"
          @update:search="stateSearch = $event"
          @update:model-value="
            BillingStepsStore.billing_details.address.state = $event
          "
        />
      </UnnnicFormElement>

      <UnnnicInput
        v-else
        v-model="BillingStepsStore.billing_details.address.state"
        :label="$t('billing.address.state')"
        :placeholder="$t('billing.address.type')"
      />

      <UnnnicFormElement
        v-if="citiesOptions"
        :label="$t('billing.address.city')"
      >
        <UnnnicSelect
          :modelValue="BillingStepsStore.billing_details.address.city"
          :options="citySelectOptions"
          :placeholder="$t('billing.address.select')"
          enableSearch
          :search="citySearch"
          @update:search="citySearch = $event"
          @update:model-value="
            BillingStepsStore.billing_details.address.city = $event
          "
        />
      </UnnnicFormElement>

      <UnnnicInput
        v-else
        v-model="BillingStepsStore.billing_details.address.city"
        :label="$t('billing.address.city')"
        :placeholder="
          isBrazilian && !brazilianStateSelected
            ? $t('billing.address.select_state')
            : $t('billing.address.type')
        "
        :disabled="isBrazilian && !brazilianStateSelected"
      />
    </div>
    <UnnnicInput
      v-model="BillingStepsStore.billing_details.address.line1"
      :label="$t('billing.address.address_title')"
      :placeholder="$t('billing.address.address_mask')"
    />
    <UnnnicInput
      v-model="BillingStepsStore.billing_details.additionalInformation"
      :label="$t('billing.address.additional_info')"
      :placeholder="$t('billing.address.additional_info_mask')"
    />
  </div>
</template>

<script>
import { mapActions, mapStores } from 'pinia';
import { useBillingStepsStore } from '@/store/billingSteps';
import statesAndCitiesOfBrazil from '../../../assets/states-and-cities-of-brazil';
import countries from '../../../assets/countriesnames';

export default {
  name: 'BillingModal',

  props: {
    flow: String,
  },

  data() {
    return {
      countries,
      countrySearch: '',
      stateSearch: '',
      citySearch: '',
    };
  },

  computed: {
    ...mapStores(useBillingStepsStore),
    countryOptions() {
      return countries.map(({ native, iso2 }) => ({
        value: iso2,
        label: native,
      }));
    },

    stateSelectOptions() {
      return (this.statesOptions || []).map((state) => ({
        value: state,
        label: state,
      }));
    },

    citySelectOptions() {
      return (this.citiesOptions || []).map((city) => ({
        value: city,
        label: city,
      }));
    },

    isBrazilian() {
      return this.BillingStepsStore.billing_details.address.country === 'BR';
    },

    brazilianStateSelected() {
      if (this.isBrazilian) {
        return statesAndCitiesOfBrazil.estados.find(
          ({ nome }) =>
            nome === this.BillingStepsStore.billing_details.address.state,
        );
      }

      return null;
    },

    brazilianCitySelected() {
      if (this.brazilianStateSelected) {
        return this.brazilianStateSelected.cidades.find(
          (city) =>
            city === this.BillingStepsStore.billing_details.address.city,
        );
      }

      return null;
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
    'BillingStepsStore.billing_details.address.country'() {
      if (this.isBrazilian) {
        if (this.brazilianStateSelected) {
          if (!this.brazilianCitySelected) {
            this.BillingStepsStore.billing_details.address.city = '';
          }
        } else {
          this.BillingStepsStore.billing_details.address.state = '';
        }
      }
    },

    'BillingStepsStore.billing_details.address.state'() {
      if (this.isBrazilian) {
        this.BillingStepsStore.billing_details.address.city = '';
      }
    },
  },

  methods: {
    ...mapActions(useBillingStepsStore, ['setBillingStep']),
  },
};
</script>

<style lang="scss">
.billing-address-form {
  .unnnic-form,
  .unnnic-select {
    p {
      margin-top: 0;
    }
  }
  > .unnnic-form {
    margin-bottom: $unnnic-spacing-stack-md;
  }
  .weni-report {
    margin-top: $unnnic-spacing-stack-md;
  }

  &__duplicated {
    display: flex;
    margin-bottom: $unnnic-spacing-stack-md;
    > div {
      width: 100%;
      &:first-child {
        margin-right: $unnnic-spacing-stack-sm;
      }
    }
  }
}
</style>
