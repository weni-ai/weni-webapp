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
      return this.users.map(user => user.email);
    },
    currentUser() {
      return this.users.find((user) => user.email === this.email)
    }
  },
  methods: {
    ...mapActions(['searchUsers', 'changeAuthorization']),
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
  },
  watch: {
    value() {
      this.email = this.value;
      this.onSearch();
    },
    email() {
      this.$emit('input', this.email)
    },
    currentUser() {
      this.$emit('select', this.currentUser);
    },
  },
}
</script>