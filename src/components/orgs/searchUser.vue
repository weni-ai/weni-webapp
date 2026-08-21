<template>
  <UnnnicFormElement v-bind="$attrs">
    <UnnnicSelect
      v-bind="$attrs"
      class="origin"
      :modelValue="email"
      :options="userEmails"
      :placeholder="$attrs.placeholder"
      enableSearch
      :search="search"
      @update:search="handleSearch"
      @update:model-value="email = $event"
    />
  </UnnnicFormElement>
</template>

<script>
import { debounce } from 'lodash';
import { mapActions } from 'pinia';
import { useUsersStore } from '@/store/users';

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
      search: '',
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
  created() {
    this.debouncedSearch = debounce(() => {
      this.onSearch();
      this.$emit('reset');
    }, 300);
  },
  methods: {
    ...mapActions(useUsersStore, ['searchUsers']),
    handleSearch(value) {
      this.search = value;
      this.debouncedSearch();
    },
    async fetchUsers() {
      if (!this.search || this.search.length === 0) {
        this.users = [];
        return;
      }
      try {
        const response = await this.searchUsers({ search: this.search });
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
      this.search = this.modelValue || '';
      this.onSearch();
    },
    email() {
      this.$emit('update:model-value', this.email);
    },
  },
};
</script>
