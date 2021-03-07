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
      <div class="weni-org-permissions__list">
        <org-role
          v-for="user in permissions"
          :disabled="loading || readOnly || isOwner(user)"
          :role="user.role"
          :key="user.uuid"
          :email="user.user__username"
          :name="isOwner(user) ? $t('orgs.you') : user.user__username"
          @onChangeRole="onEdit($event, user)"
          @onDelete="onRemove(user)" />
        <infinite-loading @infinite="fetchPermissions" />
      </div>
      <div class="weni-org-permissions__separator" />
      <unnnic-button
        :disabled="loading"
        class="weni-org-permissions__button"
        type="secondary"
        @click="saveChanges()">
        {{ $t('orgs.save') }}
      </unnnic-button>
      <confirm-modal
        :open="removingUser != null"
        type="danger"
        :title="$t('orgs.remove_member')"
        :description="removeText"
        confirmText="Confirm"
        cancelText="Cancel"
        @close="removingUser = null"
        @confirm="removeRole(removingUser)"
      />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import SearchUser from './searchUser'
import OrgRole from './orgRole.vue';
import OrgPermissionSelect from './orgPermissionSelect';
import InfiniteLoading from '../InfiniteLoading';
import { unnnicCallModal } from 'unnic-system-beta';
import ConfirmModal from '../ConfirmModal';

export default {
  name: 'OrgPermissions',
  components: {
    OrgRole,
    SearchUser,
    OrgPermissionSelect,
    InfiniteLoading,
    ConfirmModal,
  },
  props: {
    org: {
      type: Object,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      permissions: [],
      user: null,
      role: null,
      loading: false,
      page: 1,
      complete: false,
      error: false,
      changes: {},
      removingUser: null,
    };
  },
  computed: {
    removeText() {
      if(!this.removingUser) return '';
      console.log({ user: this.removingUser.user__username, 
            org: this.org.name });
      return this.$t('orgs.remove_member_description', 
          { user: this.removingUser.user__username, 
            org: this.org.name })
    },
  },
  methods: {
    ...mapActions(['getMembers', 'addAuthorization', 'changeAuthorization', 'removeAuthorization']),
    async fetchPermissions($state) {
       try {
        const response = await this.getMembers({ uuid: this.org.uuid, page: this.page });
        this.page = this.page + 1;
        this.permissions = [...this.permissions, ...response.data.results];
        this.complete = response.data.next == null;
      } catch(e) {
        $state.error();
      } finally {
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    onSelect(user) {
      this.user = user;
    },
    async onSubmit() {
      if (!this.role || !this.user) return;
      this.changes[this.user.username] = {
        username: this.user.username,
        role: this.role,
      };
      this.permissions.push({
        user__username: this.user.username,
        role: this.role,
      });
      this.role = null;
      this.user = null;
    },
    isOwner(user) {
      return user.user__username === this.org.owner.username;
    },
    onEdit(role, user) {
      this.changes[user.user__username] = { 
        username: user.user__username,
        role: role,
      };
    },
    async saveChanges() {
      const changes = Object.values(this.changes).map(
        async (change) => {
          await this.changeRole(change.role, change.username);
      });
      console.log(Object.values(this.changes), changes);
      this.loading = true;
      await Promise.all(changes);
      this.loading = false;
      unnnicCallModal({
        props: {
          text: this.error ? 'Erro':  'Alterações salvas!',
          description: this.error ? 'Algumas alterações não foram salvas' : 'Suas alterações foram salvas com sucesso.',
          scheme: this.error ? "feedback-green" : "feedback-red",
          icon: "check-circle-1",
        }
      });
      this.error = false;
      this.$emit('finish');
    },
    async changeRole(role, username) {
      try {
        await this.changeAuthorization({
          orgId: this.org.uuid,
          username,
          role,
        });
      } catch(e) {
        this.error = true;
      }
    },
    onRemove(user) {
      this.removingUser = user;
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
    display: flex;
    flex-direction: column;
    &__field {
      display: flex;
      align-items: center;
      margin: 0 0 $unnnic-spacing-stack-md 0;
    }
    &__input {
      flex: 1;
      margin: 0 $unnnic-inline-sm 0 0;
    }
    &__list {
      flex: 1;
      > *:not(:last-child) {
          margin: 0 0 $unnnic-spacing-stack-md 0;
      }
    }

    &__separator {
      border: 1px solid $unnnic-color-neutral-soft;
      margin: $unnnic-spacing-stack-md 0;
    }

    &__button {
      width: 100%;
    }
  }
</style>