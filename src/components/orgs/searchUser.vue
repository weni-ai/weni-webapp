<template>
  <unnnic-autocomplete
    v-bind="$attrs"
    v-model="email"
    :data="userEmails"
    @keyup.enter="onEnter()"
    v-debounce:300ms="onSearch"
    highlight />
</template>

<script>
import { unnnicAutocomplete } from 'unnic-system-beta';
import { mapActions } from 'vuex';

export default {
  name: 'searchUser',
  components: { unnnicAutocomplete },
  data() {
    return {
      email: null,
      users: [],
    };
  },
  computed: {
    userEmails() {
      return this.users.map(user => user.email);
    },
    currentUser() {
      return this.users.find((user) => user.email === this.email)
    }
  },
  methods: {
    ...mapActions(['searchUsers']),
    async fetchUsers() {
      if (!this.email || this.email.length === 0) {
        this.users = [];
        return;
      }
      const response = await this.searchUsers({ search: this.email });
      this.users = response.data;
    },
    onEnter() {
      this.$emit('enter');
    },
    onSearch() {
      this.fetchUsers();
    },
  },
  watch: {
    email() {
      this.$emit('input', this.email)
    },
    currentUser() {
      this.$emit('select', this.currentUser);
    },
  },
}
</script>