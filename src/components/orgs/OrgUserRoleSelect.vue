<template>
  <unnnic-dropdown>
    <unnnic-button
      v-if="type === 'button'"
      class="weni-org-role__action__button"
      size="small"
      slot="trigger"
      type="tertiary"
      icon-right="arrow-button-down-1"
    >
      {{ labelFor(value) }}
    </unnnic-button>

    <unnnic-input
      v-else-if="type === 'input'"
      :label="$t('orgs.roles.permission')"
      size="md"
      slot="trigger"
      icon-right="arrow-button-down-1"
      readonly
      :value="labelFor(value)"
      :disabled="disabled"
    ></unnnic-input>

    <unnnic-dropdown-item
      v-for="roleOption in roleOptions"
      :key="roleOption.value"
      @click="onSelectRole(roleOption.value)"
    >
      <h4>{{ labelFor(roleOption.value) }}</h4>
      <span>
        {{ descriptionFor(roleOption.value) }}
      </span>
    </unnnic-dropdown-item>
  </unnnic-dropdown>
</template>

<script>
export default {
  name: 'OrgUserRoleSelect',

  props: {
    type: {
      required: true,
      type: String,
      validator(value) {
        return ['button', 'input'].includes(value);
      },
    },

    value: {
      type: [String, Number],
    },

    disabled: Boolean,
  },

  data() {
    return {
      roleOptions: [
        { title: 'admin', value: 3 },
        { title: 'financial', value: 4 },
        { title: 'contributor', value: 2 },
      ],
    };
  },

  methods: {
    titleByValue(value) {
      return this.roleOptions.find(({ value: v }) => v == value)?.title;
    },
    labelFor(value) {
      return this.$t(`orgs.roles.${this.titleByValue(value)}`);
    },
    descriptionFor(value) {
      return this.$t(`orgs.roles.${this.titleByValue(value)}_description`);
    },
    onSelectRole(value) {
      this.$emit('input', value);
    },
  },
};
</script>
