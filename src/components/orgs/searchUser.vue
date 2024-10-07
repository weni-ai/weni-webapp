<template>
  <UnnnicFormElement v-bind="$attrs">
    <UnnnicSelectSmart
      v-debounce:300ms="
        () => {
          onSearch();
          $emit('reset');
        }
      "
      v-bind="$attrs"
      class="origin"
      :modelValue="
        [userEmails.find(({ value }) => value === email)].filter((i) => i)
      "
      :options="
        [
          {
            value: '',
            label: $attrs.placeholder,
          },
        ].concat(userEmails)
      "
      autocomplete
      autocompleteClearOnFocus
      @update:model-value="email = $event[0].value"
    />
  </UnnnicFormElement>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'SearchUser',
  props: {
    modelValue: {
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
    modelValue() {
      this.email = this.modelValue;
      this.onSearch();
    },
    email() {
      this.$emit('update:model-value', this.email);
    },
  },
};
</script>
