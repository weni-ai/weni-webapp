<template>
  <div>
    <div class="form-elements">
      <div class="form-elements__row">
        <unnnic-form-element :label="$t('profile.fields.first_name.label')">
          <unnnic-input
            :placeholder="$t('profile.fields.first_name.placeholder')"
            :value="firstName"
            @input="$emit('update:first-name', $event)"
          />
        </unnnic-form-element>

        <unnnic-form-element :label="$t('profile.fields.last_name.label')">
          <unnnic-input
            :placeholder="$t('profile.fields.last_name.placeholder')"
            :value="lastName"
            @input="$emit('update:last-name', $event)"
          />
        </unnnic-form-element>
      </div>

      <unnnic-form-element
        :label="$t('profile.fields.whatsapp_number.label')"
        :error="whatsAppNumber.length ? whatsAppNumberError : false"
      >
        <div class="whatsapp_number__input_container">
          <unnnic-select-smart
            class="whatsapp_number__input_container__dial_code"
            :value="[DDIs.find(({ value }) => value === DDI)]"
            @input="DDI = $event[0].value"
            :options="DDIs"
            autocomplete
            autocomplete-clear-on-focus
          >
          </unnnic-select-smart>

          <unnnic-input
            class="whatsapp_number__input_container__number"
            :placeholder="$t('profile.fields.whatsapp_number.placeholder')"
            v-model="number"
            ref="phoneNumber"
            :error="
              number.length ? (whatsAppNumberError ? true : false) : false
            "
          />
        </div>
      </unnnic-form-element>

      <unnnic-form-element :label="$t('profile.fields.position.label')">
        <unnnic-select-smart
          :value="
            filter([
              position && positions.find(({ value }) => value === position),
            ])
          "
          @input="$emit('update:position', $event[0].value)"
          :options="positions"
          ordered-by-index
        >
        </unnnic-select-smart>
      </unnnic-form-element>

      <unnnic-form-element
        v-if="position === 'Other'"
        :label="$t('profile.fields.position_other.label')"
      >
        <unnnic-input
          :placeholder="$t('profile.fields.position_other.placeholder')"
          :value="positionOther"
          @input="$emit('update:position-other', $event)"
        />
      </unnnic-form-element>
    </div>
  </div>
</template>

<script>
import { filter, uniq } from 'lodash';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import countries from '../../../assets/countryPhoneCodes.json';

export default {
  props: {
    firstName: String,
    lastName: String,
    whatsAppNumber: String,
    position: String,
    positionOther: String,
  },

  data() {
    return {
      number: '',
      DDI: '+55',
      DDIs: countries.map(({ dial_code, emoji }) => ({
        value: dial_code,
        label: emoji + '   ' + dial_code,
      })),
    };
  },

  mounted() {},

  methods: {
    filter,
  },

  watch: {
    fullNumber() {
      this.$emit('update:whats-app-number', this.fullNumber);
    },
  },

  computed: {
    fullNumber() {
      return this.DDI + this.number;
    },

    whatsAppNumberNumber() {
      return parsePhoneNumberFromString(this.fullNumber);
    },

    whatsAppNumberError() {
      const nationalNumber = this.whatsAppNumberNumber?.nationalNumber || '';

      if (!this.number) {
        return false;
      }

      if (
        !this.number.length ||
        !this.whatsAppNumberNumber ||
        !this.whatsAppNumberNumber.isValid() ||
        uniq(nationalNumber).length <= 1 ||
        uniq(filter(nationalNumber.split(/(\d{2})/g), { length: 2 })).length <=
          1 ||
        uniq(filter(nationalNumber.split(/(\d{3})/g), { length: 3 })).length <=
          1
      ) {
        return this.$t('errors.invalid_contact');
      }

      return null;
    },

    positions() {
      return [
        {
          value: '',
          label: this.$t('profile.fields.position.placeholder'),
        },
        {
          value: 'Autonomous',
          label: this.$t(
            'account.init.info.company.position.options.Autonomous',
          ),
        },
        {
          value: 'Student',
          label: this.$t('account.init.info.company.position.options.Student'),
        },
        {
          value: 'CEO',
          label: this.$t('account.init.info.company.position.options.CEO'),
        },
        {
          value: 'Director',
          label: this.$t('account.init.info.company.position.options.Director'),
        },
        {
          value: 'Manager',
          label: this.$t('account.init.info.company.position.options.Manager'),
        },
        {
          value: 'Coordinator',
          label: this.$t(
            'account.init.info.company.position.options.Coordinator',
          ),
        },
        {
          value: 'Analyst',
          label: this.$t('account.init.info.company.position.options.Analyst'),
        },
        {
          value: 'Assistant',
          label: this.$t(
            'account.init.info.company.position.options.Assistant',
          ),
        },
        {
          value: 'Other',
          label: this.$t('account.init.info.company.position.options.Other'),
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.whatsapp_number__input_container {
  display: flex;
  flex-wrap: nowrap;
  column-gap: $unnnic-spacing-nano;

  &__dial_code {
    width: 7rem;
  }

  &__number {
    flex: 1;
  }
}
</style>
