<template>
  <unnnic-select
    v-model="role"
    v-bind="$attrs">
    <option
      v-for="roleOption in roleOptions"
      :key="roleOption"
      :value="roleOption">
      {{ labelFor(roleOption) }}
    </option>
  </unnnic-select>
</template>

<script>
import { unnnicSelect } from 'unnic-system-beta';
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
      role: null,
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
      return this.$t(`orgs.roles.${this.roles[role]}`)
    },
    onSelectOption(role) {
      this.$emit('input', role);
    }
  },
  watch: {
    value() {
      this.role = this.value;
    },
    role() {
      this.$emit('input', this.role);
    },
  },
};
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';

    .weni-org-role {
        &__action {
            &__button {
                color: $unnnic-color-neutral-dark;
            }
        }
    }

</style>

