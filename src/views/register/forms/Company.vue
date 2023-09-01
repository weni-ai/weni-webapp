<template>
  <div>
    <div class="section-title">{{ $t('company.about.title') }}</div>

    <div class="form-elements">
      <unnnic-form-element :label="$t('company.fields.name.label')">
        <unnnic-input
          :placeholder="$t('company.fields.name.placeholder')"
          :value="name"
          @input="$emit('update:name', $event)"
        />
      </unnnic-form-element>

      <div class="form-elements__row">
        <unnnic-form-element :label="$t('company.fields.phone.label')">
          <unnnic-input
            :placeholder="$t('company.fields.phone.placeholder')"
            :value="phone"
          />
        </unnnic-form-element>

        <unnnic-form-element :label="$t('company.fields.size.label')">
          <unnnic-select-smart
            :value="
              filter([
                size && quantityOfPerson.find(({ value }) => value === size),
              ])
            "
            @input="$emit('update:size', $event[0].value)"
            :options="quantityOfPerson"
            ordered-by-index
          >
          </unnnic-select-smart>
        </unnnic-form-element>
      </div>

      <unnnic-form-element :label="$t('company.fields.segment.label')">
        <unnnic-select-smart
          :value="
            filter([segment && segments.find(({ value }) => value === segment)])
          "
          @input="$emit('update:segment', $event[0].value)"
          :options="segments"
          ordered-by-index
          autocomplete
        >
        </unnnic-select-smart>
      </unnnic-form-element>
    </div>
  </div>
</template>

<script>
import { filter } from 'lodash';

export default {
  props: {
    name: String,
    phone: String,
    size: String,
    segment: String,
  },

  methods: {
    filter,
  },

  computed: {
    quantityOfPerson() {
      return [
        {
          value: '',
          label: this.$t('company.fields.size.placeholder'),
        },
        {
          value: '5',
          label: this.$t('account.init.info.company.size.only_me'),
        },
        {
          value: '6',
          label: this.$t('account.init.info.company.size.colaborators', {
            value: '2 - 10',
          }),
        },
        {
          value: '7',
          label: this.$t('account.init.info.company.size.colaborators', {
            value: '11 - 20',
          }),
        },
        {
          value: '1',
          label: this.$t('account.init.info.company.size.colaborators', {
            value: '21 - 50',
          }),
        },
        {
          value: '2',
          label: this.$t('account.init.info.company.size.colaborators', {
            value: '51 - 300',
          }),
        },
        {
          value: '3',
          label: this.$t('account.init.info.company.size.colaborators', {
            value: '301 - 1000',
          }),
        },
        {
          value: '4',
          label: this.$t(
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
          value: '',
          label: this.$t('company.fields.segment.placeholder'),
        },
        {
          value: 'Marketing and Advertising Agency',
          label: this.$t(
            'account.init.info.company.segment.options.Marketing and Advertising Agency',
          ),
        },
        {
          value: 'Agribusiness',
          label: this.$t(
            'account.init.info.company.segment.options.Agribusiness',
          ),
        },
        {
          value: 'Consulting and Training',
          label: this.$t(
            'account.init.info.company.segment.options.Consulting and Training',
          ),
        },
        {
          value: 'Ecommerce',
          label: this.$t('account.init.info.company.segment.options.Ecommerce'),
        },
        {
          value: 'Education and Teaching',
          label: this.$t(
            'account.init.info.company.segment.options.Education and Teaching',
          ),
        },
        {
          value: 'Engineering and General Industry',
          label: this.$t(
            'account.init.info.company.segment.options.Engineering and General Industry',
          ),
        },
        {
          value: 'Events',
          label: this.$t('account.init.info.company.segment.options.Events'),
        },
        {
          value: 'Financial and Legal',
          label: this.$t(
            'account.init.info.company.segment.options.Financial and Legal',
          ),
        },
        {
          value: 'Governments and Public Agency',
          label: this.$t(
            'account.init.info.company.segment.options.Governments and Public Agency',
          ),
        },
        {
          value: 'Hardware and Electronics',
          label: this.$t(
            'account.init.info.company.segment.options.Hardware and Electronics',
          ),
        },
        {
          value: 'Real Estate Agency',
          label: this.$t(
            'account.init.info.company.segment.options.Real Estate Agency',
          ),
        },
        {
          value: 'Media and Communication',
          label: this.$t(
            'account.init.info.company.segment.options.Media and Communication',
          ),
        },
        {
          value: 'NGOs',
          label: this.$t('account.init.info.company.segment.options.NGOs'),
        },
        {
          value: 'Health and Aesthetics',
          label: this.$t(
            'account.init.info.company.segment.options.Health and Aesthetics',
          ),
        },
        {
          value: 'General Services',
          label: this.$t(
            'account.init.info.company.segment.options.General Services',
          ),
        },
        {
          value: 'HR Services and Coaching',
          label: this.$t(
            'account.init.info.company.segment.options.HR Services and Coaching',
          ),
        },
        {
          value: 'Software and Cloud',
          label: this.$t(
            'account.init.info.company.segment.options.Software and Cloud',
          ),
        },
        {
          value: 'Telecommunications',
          label: this.$t(
            'account.init.info.company.segment.options.Telecommunications',
          ),
        },
        {
          value: 'Technology',
          label: this.$t(
            'account.init.info.company.segment.options.Technology',
          ),
        },
        {
          value: 'Tourism and Leisure',
          label: this.$t(
            'account.init.info.company.segment.options.Tourism and Leisure',
          ),
        },
        {
          value: 'Retail',
          label: this.$t('account.init.info.company.segment.options.Retail'),
        },
        {
          value: 'Other',
          label: this.$t('account.init.info.company.segment.options.Other'),
        },
      ];
    },
  },
};
</script>
