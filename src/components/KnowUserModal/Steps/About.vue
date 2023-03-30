<template>
  <div class="account-info">
    <div class="account-info__content">
      <unnnic-input-next
        :label="$t('account.init.info.cellphone.title')"
        :placeholder="$t('account.init.info.cellphone.placeholder')"
        :value="phone"
        @input="$emit('update:phone', $event)"
        ref="phoneNumber"
        :error="phone.length ? phoneError : undefined"
        icon-left="phone-3"
      />
      <unnnic-input-next
        :label="$t('account.init.info.company.name.title')"
        :placeholder="$t('account.init.info.company.name.placeholder')"
        :value="companyName"
        @input="$emit('update:company-name', $event)"
        icon-left="building-2-1"
      />
      <unnnic-select
        :label="$t('account.init.info.company.size.title')"
        :placeholder="$t('account.init.info.company.size.placeholder')"
        :value="companySize"
        @input="$emit('update:company-size', $event)"
      >
        <option
          v-for="project in quantityOfPerson"
          :value="project.id"
          :key="project.id"
        >
          {{ project.title }}
        </option>
      </unnnic-select>

      <unnnic-select
        :label="$t('account.init.info.company.segment.title')"
        :placeholder="$t('account.init.info.company.segment.placeholder')"
        :value="companySegment"
        @input="$emit('update:company-segment', $event)"
      >
        <option v-for="{ value, text } in segments" :value="value" :key="value">
          {{ text }}
        </option>
      </unnnic-select>

      <unnnic-select
        class="position-group"
        :label="$t('account.init.info.company.position.title')"
        :placeholder="$t('account.init.info.company.position.placeholder')"
        :value="userPosition"
        @input="$emit('update:user-position', $event)"
      >
        <option
          v-for="{ value, text } in positions"
          :value="value"
          :key="value"
        >
          {{ text }}
        </option>
      </unnnic-select>
    </div>
  </div>
</template>

<script>
import formatPhoneNumber from '../../../utils/plugins/formatPhoneNumber';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { uniq, filter } from 'lodash';

export default {
  props: {
    phone: {
      type: String,
    },

    companyName: String,
    companySize: String,
    companySegment: String,
    userPosition: String,
  },

  data() {
    return {
      name: '',
    };
  },

  mounted() {
    const phoneNumberInput = this.$refs.phoneNumber.$el.querySelector('input');

    formatPhoneNumber(phoneNumberInput, (value) => {
      this.contact = value;
    });
  },

  computed: {
    phoneNumber() {
      return parsePhoneNumberFromString(this.phone);
    },

    phoneError() {
      const nationalNumber = this.phoneNumber?.nationalNumber || '';

      if (
        !this.phone.length ||
        !this.phoneNumber ||
        !this.phoneNumber.isValid() ||
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

    quantityOfPerson() {
      return [
        {
          id: 5,
          title: this.$t('account.init.info.company.size.only_me'),
        },
        {
          id: 6,
          title: this.$t('account.init.info.company.size.colaborators', {
            value: '2 - 10',
          }),
        },
        {
          id: 7,
          title: this.$t('account.init.info.company.size.colaborators', {
            value: '11 - 20',
          }),
        },
        {
          id: 1,
          title: this.$t('account.init.info.company.size.colaborators', {
            value: '21 - 50',
          }),
        },
        {
          id: 2,
          title: this.$t('account.init.info.company.size.colaborators', {
            value: '51 - 300',
          }),
        },
        {
          id: 3,
          title: this.$t('account.init.info.company.size.colaborators', {
            value: '301 - 1000',
          }),
        },
        {
          id: 4,
          title: this.$t(
            'account.init.info.company.size.colaboratorsMoreThan',
            {
              value: '1001',
            },
          ),
        },
      ];
    },

    segments() {
      return [
        {
          value: 'Marketing and Advertising Agency',
          text: this.$t(
            'account.init.info.company.segment.options.Marketing and Advertising Agency',
          ),
        },
        {
          value: 'Agribusiness',
          text: this.$t(
            'account.init.info.company.segment.options.Agribusiness',
          ),
        },
        {
          value: 'Consulting and Training',
          text: this.$t(
            'account.init.info.company.segment.options.Consulting and Training',
          ),
        },
        {
          value: 'Ecommerce',
          text: this.$t('account.init.info.company.segment.options.Ecommerce'),
        },
        {
          value: 'Education and Teaching',
          text: this.$t(
            'account.init.info.company.segment.options.Education and Teaching',
          ),
        },
        {
          value: 'Engineering and General Industry',
          text: this.$t(
            'account.init.info.company.segment.options.Engineering and General Industry',
          ),
        },
        {
          value: 'Events',
          text: this.$t('account.init.info.company.segment.options.Events'),
        },
        {
          value: 'Financial and Legal',
          text: this.$t(
            'account.init.info.company.segment.options.Financial and Legal',
          ),
        },
        {
          value: 'Governments and Public Agency',
          text: this.$t(
            'account.init.info.company.segment.options.Governments and Public Agency',
          ),
        },
        {
          value: 'Hardware and Electronics',
          text: this.$t(
            'account.init.info.company.segment.options.Hardware and Electronics',
          ),
        },
        {
          value: 'Real Estate Agency',
          text: this.$t(
            'account.init.info.company.segment.options.Real Estate Agency',
          ),
        },
        {
          value: 'Media and Communication',
          text: this.$t(
            'account.init.info.company.segment.options.Media and Communication',
          ),
        },
        {
          value: 'NGOs',
          text: this.$t('account.init.info.company.segment.options.NGOs'),
        },
        {
          value: 'Health and Aesthetics',
          text: this.$t(
            'account.init.info.company.segment.options.Health and Aesthetics',
          ),
        },
        {
          value: 'General Services',
          text: this.$t(
            'account.init.info.company.segment.options.General Services',
          ),
        },
        {
          value: 'HR Services and Coaching',
          text: this.$t(
            'account.init.info.company.segment.options.HR Services and Coaching',
          ),
        },
        {
          value: 'Software and Cloud',
          text: this.$t(
            'account.init.info.company.segment.options.Software and Cloud',
          ),
        },
        {
          value: 'Telecommunications',
          text: this.$t(
            'account.init.info.company.segment.options.Telecommunications',
          ),
        },
        {
          value: 'Technology',
          text: this.$t('account.init.info.company.segment.options.Technology'),
        },
        {
          value: 'Tourism and Leisure',
          text: this.$t(
            'account.init.info.company.segment.options.Tourism and Leisure',
          ),
        },
        {
          value: 'Retail',
          text: this.$t('account.init.info.company.segment.options.Retail'),
        },
        {
          value: 'Other',
          text: this.$t('account.init.info.company.segment.options.Other'),
        },
      ];
    },

    positions() {
      return [
        {
          value: 'Autonomous',
          text: this.$t(
            'account.init.info.company.position.options.Autonomous',
          ),
        },
        {
          value: 'Student',
          text: this.$t('account.init.info.company.position.options.Student'),
        },
        {
          value: 'CEO',
          text: this.$t('account.init.info.company.position.options.CEO'),
        },
        {
          value: 'Director',
          text: this.$t('account.init.info.company.position.options.Director'),
        },
        {
          value: 'Manager',
          text: this.$t('account.init.info.company.position.options.Manager'),
        },
        {
          value: 'Coordinator',
          text: this.$t(
            'account.init.info.company.position.options.Coordinator',
          ),
        },
        {
          value: 'Analyst',
          text: this.$t('account.init.info.company.position.options.Analyst'),
        },
        {
          value: 'Assistant',
          text: this.$t('account.init.info.company.position.options.Assistant'),
        },
        {
          value: 'Other',
          text: this.$t('account.init.info.company.position.options.Other'),
        },
      ];
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.account-info {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__content {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $unnnic-spacing-stack-sm;
    margin: $unnnic-spacing-stack-xl 0;

    @media only screen and (max-width: 39.25rem) {
      grid-template-columns: 1fr;
    }
  }

  button {
    width: 201px;
  }

  .position-group {
    grid-column-end: 3;
    grid-column-start: 1;
  }
}
</style>
