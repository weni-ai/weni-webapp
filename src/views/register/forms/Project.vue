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
          >
          </unnnic-select-smart>
        </unnnic-form-element>

        <unnnic-form-element :label="$t('project.fields.purpose.label')">
          <unnnic-select-smart
            :value="
              filter([
                purpose && categories.find(({ value }) => value === purpose),
              ])
            "
            @input="$emit('update:purpose', $event[0].value)"
            :options="categories"
            autocomplete
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

export default {
  props: {
    name: String,
    team: String,
    purpose: String,
  },

  methods: {
    filter,
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
      return [
        {
          value: '',
          label: this.$t('project.fields.purpose.placeholder'),
        },

        ...uniqBy(
          AccountInitOptions.flatMap((option) => option.options)
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
