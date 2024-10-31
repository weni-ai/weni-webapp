<template>
  <UnnnicDropdown>
    <template
      v-if="type === 'button'"
      #trigger
    >
      <UnnnicButton
        class="weni-org-role__action__button"
        size="small"
        type="tertiary"
        iconRight="arrow-button-down-1"
      >
        {{ labelFor(modelValue) }}
      </UnnnicButton>
    </template>
    <template
      v-else-if="type === 'input'"
      #trigger
    >
      <UnnnicInput
        :label="$t('orgs.roles.permission')"
        size="md"
        iconRight="arrow-button-down-1"
        readonly
        :modelValue="labelFor(modelValue)"
        :disabled="disabled"
      />
    </template>

    <UnnnicDropdownItem
      v-for="roleOption in roleOptions"
      :key="roleOption.value"
      @click="onSelectRole(roleOption.value)"
    >
      <h4>{{ labelFor(roleOption.value) }}</h4>
      <span>
        {{ descriptionFor(roleOption.value) }}
      </span>
    </UnnnicDropdownItem>
  </UnnnicDropdown>
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

    modelValue: {
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
      this.$emit('update:model-value', value);
    },
  },
};
</script>
