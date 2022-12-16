<template>
  <div class="billing-address-form">
    <div class="billing-address-form__duplicated">
      <unnnic-input
        :label="$t('billing.address.cep')"
        v-model="$store.state.BillingSteps.billing_details.address.postal_code"
      />
      <unnnic-select
        :label="$t('billing.address.country')"
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
    </div>
    <div class="billing-address-form__duplicated">
      <unnnic-select
        v-if="statesOptions"
        :label="$t('billing.address.state')"
        :placeholder="$t('billing.address.select')"
        v-model="$store.state.BillingSteps.billing_details.address.state"
        search
      >
        <option v-for="state in statesOptions" :key="state" :value="state">
          {{ state }}
        </option>
      </unnnic-select>

      <unnnic-input
        v-else
        :label="$t('billing.address.state')"
        :placeholder="$t('billing.address.type')"
        v-model="$store.state.BillingSteps.billing_details.address.state"
      />

      <unnnic-select
        v-if="citiesOptions"
        :label="$t('billing.address.city')"
        :placeholder="$t('billing.address.select')"
        v-model="$store.state.BillingSteps.billing_details.address.city"
        search
      >
        <option v-for="city in citiesOptions" :key="city" :value="city">
          {{ city }}
        </option>
      </unnnic-select>

      <unnnic-input
        v-else
        :label="$t('billing.address.city')"
        :placeholder="
          isBrazilian && !brazilianStateSelected
            ? $t('billing.address.select_state')
            : $t('billing.address.type')
        "
        :disabled="isBrazilian && !brazilianStateSelected"
        v-model="$store.state.BillingSteps.billing_details.address.city"
      />
    </div>
    <unnnic-input
      :label="$t('billing.address.address_title')"
      :placeholder="$t('billing.address.address_mask')"
      v-model="$store.state.BillingSteps.billing_details.address.line1"
    />
    <unnnic-input
      :label="$t('billing.address.additional_info')"
      :placeholder="$t('billing.address.additional_info_mask')"
      v-model="$store.state.BillingSteps.billing_details.additionalInformation"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const statesAndCitiesOfBrazil = require('../../../assets/states-and-cities-of-brazil');

export default {
  name: 'BillingModal',

  props: {
    flow: String,
  },

  data() {
    return {
      countries: require('../../../assets/countriesnames'),
    };
  },

  computed: {
    isBrazilian() {
      return (
        this.$store.state.BillingSteps.billing_details.address.country === 'BR'
      );
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

    '$store.state.BillingSteps.billing_details.address.state'() {
      if (this.isBrazilian) {
        this.$store.state.BillingSteps.billing_details.address.city = '';
      }
    },
  },

  methods: {
    ...mapActions(['setBillingStep']),
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
