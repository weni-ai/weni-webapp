<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="section-title">{{ $t('company.about.title') }}</div>

    <div class="form-elements">
      <UnnnicFormElement :label="$t('company.fields.name.label')">
        <UnnnicInput
          :placeholder="$t('company.fields.name.placeholder')"
          :modelValue="name"
          @update:model-value="$emit('update:name', $event)"
        />
      </UnnnicFormElement>

      <div class="form-elements__row">
        <!-- <unnnic-form-element :label="$t('company.fields.phone.label')">
          <unnnic-input
            :placeholder="$t('company.fields.phone.placeholder')"
            :value="phone"
          />
        </unnnic-form-element> -->

        <UnnnicFormElement :label="$t('company.fields.size.label')">
          <UnnnicSelectSmart
            :modelValue="[quantityOfPerson.find(({ value }) => value === size)]"
            :options="quantityOfPerson"
            orderedByIndex
            @update:model-value="updateSelectValue('size', $event)"
          >
          </UnnnicSelectSmart>
        </UnnnicFormElement>
      </div>

      <UnnnicFormElement :label="$t('company.fields.segment.label')">
        <UnnnicSelectSmart
          :modelValue="[segments.find(({ value }) => value === segment)]"
          :options="segments"
          orderedByIndex
          autocomplete
          autocompleteClearOnFocus
          @update:model-value="updateSelectValue('segment', $event)"
        >
        </UnnnicSelectSmart>
      </UnnnicFormElement>
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
          value: 'Marketing Agency',
          label: this.$t(
            'account.init.info.company.segment.options.Marketing Agency',
          ),
        },
        {
          value: 'Advertising',
          label: this.$t(
            'account.init.info.company.segment.options.Advertising',
          ),
        },
        {
          value: 'Agribusiness',
          label: this.$t(
            'account.init.info.company.segment.options.Agribusiness',
          ),
        },
        {
          value: 'Food',
          label: this.$t('account.init.info.company.segment.options.Food'),
        },
        {
          value: 'Beverages',
          label: this.$t('account.init.info.company.segment.options.Beverages'),
        },
        {
          value: 'Environment, Climate and Sustainability',
          label: this.$t(
            'account.init.info.company.segment.options.Environment, Climate and Sustainability',
          ),
        },
        {
          value: 'Civil Construction',
          label: this.$t(
            'account.init.info.company.segment.options.Civil Construction',
          ),
        },
        {
          value: 'Consulting',
          label: this.$t(
            'account.init.info.company.segment.options.Consulting',
          ),
        },
        {
          value: 'Training',
          label: this.$t('account.init.info.company.segment.options.Training'),
        },
        {
          value: 'E-commerce',
          label: this.$t(
            'account.init.info.company.segment.options.E-commerce',
          ),
        },
        {
          value: 'Education and Teaching',
          label: this.$t(
            'account.init.info.company.segment.options.Education and Teaching',
          ),
        },
        {
          value: 'Civic Engagement',
          label: this.$t(
            'account.init.info.company.segment.options.Civic Engagement',
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
          value: 'Industry, Energy and Infrastructure',
          label: this.$t(
            'account.init.info.company.segment.options.Industry, Energy and Infrastructure',
          ),
        },
        {
          value: 'Marketing and Advertising',
          label: this.$t(
            'account.init.info.company.segment.options.Marketing and Advertising',
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
          value: 'Technology',
          label: this.$t(
            'account.init.info.company.segment.options.Technology',
          ),
        },
        {
          value: 'Telecommunications',
          label: this.$t(
            'account.init.info.company.segment.options.Telecommunications',
          ),
        },
        {
          value: 'Third Sector',
          label: this.$t(
            'account.init.info.company.segment.options.Third Sector',
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
          value: 'Transportation and Logistics',
          label: this.$t(
            'account.init.info.company.segment.options.Transportation and Logistics',
          ),
        },
        {
          value: 'Other',
          label: this.$t('account.init.info.company.segment.options.Other'),
        },
      ];
    },
  },

  methods: {
    filter,

    updateSelectValue(field, [value]) {
      this.$emit(`update:${field}`, value?.value);
    },
  },
};
</script>
