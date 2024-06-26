<template>
  <unnnic-form-element v-bind="$attrs">
    <unnnic-select-smart
      v-bind="$attrs"
      class="origin"
      :value="
        [userEmails.find(({ value }) => value === email)].filter((i) => i)
      "
      @input="email = $event[0].value"
      :options="
        [
          {
            value: '',
            label: $attrs.placeholder,
          },
        ].concat(userEmails)
      "
      v-debounce:300ms="
        () => {
          onSearch();
          $emit('reset');
        }
      "
      autocomplete
      autocomplete-clear-on-focus
    />
  </unnnic-form-element>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'searchUser',
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      email: null,
      users: [],
    };
  },
  computed: {
    userEmails() {
      return this.users.map((user) => ({
        label: [user.first_name, user.last_name]
          .filter((name) => name)
          .join(' ')
          .concat(` (${user.username})`),
        value: user.email,
      }));
    },
  },
  methods: {
    ...mapActions(['searchUsers']),
    async fetchUsers() {
      if (!this.email || this.email.length === 0) {
        this.users = [];
        return;
      }
      try {
        const response = await this.searchUsers({ search: this.email });
        this.users = response.data;
      } catch (e) {
        this.users = [];
      }
    },
    onEnter() {
      this.$emit('enter');
    },
    onSearch() {
      this.fetchUsers();
    },
    selectUser(value) {
      this.$emit('select', value);
    },
  },
  watch: {
    value() {
      this.email = this.value;
      this.onSearch();
    },
    email() {
      this.$emit('input', this.email);
    },
  },
};
</script>
