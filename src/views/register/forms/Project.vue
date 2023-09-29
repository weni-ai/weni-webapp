<template>
  <div>
    <div class="section-title">{{ $t('project.about.title') }}</div>

    <div class="form-elements">
      <unnnic-form-element :label="$t('project.fields.name.label')">
        <unnnic-input
          :placeholder="$t('project.fields.name.placeholder')"
          :value="name"
          @input="$emit('update:name', $event)"
        />
      </unnnic-form-element>

      <div class="form-elements__row">
        <unnnic-form-element :label="$t('project.fields.team.label')">
          <unnnic-select-smart
            :value="
              filter([team && teamOptions.find(({ value }) => value === team)])
            "
            @input="$emit('update:team', $event[0].value)"
            :options="teamOptions"
            ordered-by-index
            autocomplete
            autocomplete-clear-on-focus
          >
          </unnnic-select-smart>
        </unnnic-form-element>

        <unnnic-form-element :label="$t('project.fields.purpose.label')">
          <unnnic-select-smart
            :key="purpose"
            :value="
              filter([
                purpose && categories.find(({ value }) => value === purpose),
              ])
            "
            @input="$emit('update:purpose', $event[0].value)"
            :options="categories"
            autocomplete
            autocomplete-clear-on-focus
            ordered-by-index
            :disabled="!team || team === 'other'"
          >
          </unnnic-select-smart>
        </unnnic-form-element>
      </div>

      <div class="form-elements__row">
        <unnnic-form-element :label="$t('orgs.create.date_format')">
          <unnnic-select
            :value="dateFormat"
            @input="$emit('update:date-format', $event)"
          >
            <option value="D">DD-MM-YYYY</option>
            <option value="M">MM-DD-YYYY</option>
          </unnnic-select>
        </unnnic-form-element>

        <unnnic-form-element :label="$t('orgs.create.time_zone')">
          <unnnic-select-smart
            :value="[
              timezones
                .map(({ toString, zoneName }) => ({
                  value: zoneName,
                  label: toString(),
                }))
                .find(({ value }) => value === timeZone),
            ]"
            @input="$emit('update:time-zone', $event[0].value)"
            :options="
              timezones.map(({ toString, zoneName }) => ({
                value: zoneName,
                label: toString(),
              }))
            "
            autocomplete
            autocomplete-clear-on-focus
          >
          </unnnic-select-smart>
        </unnnic-form-element>
      </div>
    </div>
  </div>
</template>

<script>
import { filter, uniqBy } from 'lodash';
import AccountInitOptions from '../../../components/KnowUserModal/AccountInitOptions.json';
import timezones from './../../../views/projects/timezone';

export default {
  mixins: [timezones],

  props: {
    name: String,
    team: String,
    purpose: String,
    dateFormat: String,
    timeZone: String,
  },

  methods: {
    filter,
  },

  watch: {
    team() {
      this.$emit('update:purpose', '');
    },
  },

  computed: {
    teamOptions() {
      return [
        {
          value: '',
          label: this.$t('project.fields.team.placeholder'),
        },
        {
          value: 'commercial',
          label: this.$t('project.fields.team.options.commercial'),
        },
        {
          value: 'CS_and_support',
          label: this.$t('project.fields.team.options.CS_and_support'),
        },
        {
          value: 'financial',
          label: this.$t('project.fields.team.options.financial'),
        },
        {
          value: 'marketing',
          label: this.$t('project.fields.team.options.marketing'),
        },
        {
          value: 'human_resources',
          label: this.$t('project.fields.team.options.human_resources'),
        },
        {
          value: 'IT',
          label: this.$t('project.fields.team.options.IT'),
        },
        {
          value: 'product_team',
          label: this.$t('project.fields.team.options.product_team'),
        },
        {
          value: 'other',
          label: this.$t('project.fields.team.options.other'),
        },
      ];
    },

    categories() {
      const teamMap = {
        commercial: 'sells',
        CS_and_support: 'cs_suport',
        financial: 'finance',
        marketing: 'marketing',
        human_resources: 'rh',
        IT: 'ti',
        product_team: 'product_development',
      };

      return [
        {
          value: '',
          label: this.$t('project.fields.purpose.placeholder'),
        },

        ...uniqBy(
          AccountInitOptions.filter(
            (option) => option.value === teamMap[this.team],
          )
            .flatMap((option) => option.options)
            .map(({ title, value }) => ({ value, label: this.$t(title) }))
            .filter(({ value }) => value !== 'others')
            .concat({ value: 'others', label: this.$t('account.init.others') }),
          'label',
        ),
      ];
    },
  },
};
</script>
