<template>
  <unnnic-select :value="value" @input="$emit('input', $event)" v-bind="$attrs">
    <option
      v-for="roleOption in roleOptions"
      :key="roleOption"
      :value="roleOption"
    >
      {{ labelFor(roleOption) }}
    </option>
  </unnnic-select>
</template>

<script>
import { unnnicSelect } from '@weni/unnnic-system';
export default {
  name: 'OrgPermissionSelect',
  components: { unnnicSelect },
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      roles: {
        1: 'view',
        2: 'contributor',
        3: 'admin',
      },
    };
  },

  computed: {
    roleOptions() {
      return Object.keys(this.roles);
    },
  },
  methods: {
    labelFor(role) {
      return this.$t(`orgs.roles.${this.roles[role]}`);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-org-role {
  &__action {
    &__button {
      color: $unnnic-color-neutral-dark;
    }
  }
}
</style>
