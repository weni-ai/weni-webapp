<template>
    <div class="weni-org-permissions">
      <div class="weni-org-permissions__field">
        <search-user
          @select="onSelect($event)"
          @enter="onSubmit"
          class="weni-org-permissions__input"
          :label="$t('orgs.create.user_search')"
          :placeholder="$t('orgs.create.user_search_description')" />
        <org-permission-select
          v-model="role"
          :label="$t('orgs.create.permission')"/>
      </div>
        <org-role
          v-for="user in permissions"
          :disabled="isOwner(user)"
          :role="user.role"
          :key="user.uuid"
          :email="user.user__username"
          :name="isOwner(user) ? $t('orgs.you') : user.user__username"
          @onChangeRole="changeRole($event, user)"
          @onDelete="removeRole(user)" />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import SearchUser from './searchUser'
import OrgRole from './orgRole.vue';
import OrgPermissionSelect from './orgPermissionSelect';

export default {
  name: 'OrgPermissions',
  components: {
    OrgRole,
    SearchUser,
    OrgPermissionSelect 
  },
  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      permissions: [],
      user: null,
      role: null,
      loading: false,
    };
  },
  mounted() {
    this.fetchPermissions();
  },
  methods: {
    ...mapActions(['getMembers', 'addAuthorization', 'changeAuthorization', 'removeAuthorization']),
    async fetchPermissions() {
      const response = await this.getMembers({ uuid: this.org.uuid });
      this.permissions = [...response.data.results];
    },
    onSelect(user) {
      this.user = user;
    },
    async onSubmit() {
      if (!this.role || !this.user) return;
      try { 
        await this.addAuthorization({
          orgId: this.org.uuid,
          username: this.user.username,
          role: this.role 
        });
        this.role = null;
        this.user = null;
      } catch(e) {
        console.log(e);
      }
    },
    isOwner(user) {
      return user.user__username === this.org.owner.username;
    },
    async changeRole(role, user) {
      if (user.role === role) return;
      try { 
        await this.changeAuthorization({
          orgId: this.org.uuid,
          username: user.user__username,
          role: role,
        });
      } catch(e) {
        console.log(e);
      }
    },
    async removeRole(user) {
      try { 
        await this.removeAuthorization({
          orgId: this.org.uuid,
          username: user.user__username,
        });
      } catch(e) {
        console.log(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-org-permissions {
    &__field {
      display: flex;
      align-items: center;
      margin: 0 0 $unnnic-spacing-stack-md 0;
    }
    &__input {
      flex: 1;
      margin: 0 $unnnic-inline-sm 0 0;
    }
  }
</style>