<template>
  <div class="account-info">
    <div class="account-info__content">
      <unnnic-input
        :label="$t('account.init.info.cellphone.title')"
        :placeholder="$t('account.init.info.cellphone.placeholder')"
        :value="phone"
        @input="$emit('update:phone', $event)"
        ref="phoneNumber"
        :type="phone.length && phoneError ? 'error' : 'normal'"
        :message="phone.length ? phoneError : ''"
        icon-left="phone-3"
      />
      <unnnic-input
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
      <unnnic-input
        :label="$t('account.init.info.company.segment.title')"
        :placeholder="$t('account.init.info.company.segment.placeholder')"
        :value="companySegment"
        @input="$emit('update:company-segment', $event)"
        icon-left="pie-line-graph-1"
      />
    </div>
  </div>
</template>

<script>
import formatPhoneNumber from '../../../utils/plugins/formatPhoneNumber';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export default {
  props: {
    phone: {
      type: String,
    },

    companyName: String,
    companySize: String,
    companySegment: String,
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
      if (
        !this.phone.length ||
        !this.phoneNumber ||
        !this.phoneNumber.isValid()
      ) {
        return this.$t('errors.invalid_contact');
      }

      return '';
    },

    quantityOfPerson() {
      return [
        {
          id: 0,
          title: this.$t('account.init.info.company.size.colaborators', {
            value: '1 - 20',
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
  }

  button {
    width: 201px;
  }
}
</style>
