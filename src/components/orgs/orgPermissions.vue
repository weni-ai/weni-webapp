<template>
    <div class="weni-org-permissions">
      <div class="weni-org-permissions__field">
        <org-permission-select
          v-model="role"
          :label="$t('orgs.create.permission')"
          class="weni-org-permissions__permission-select"
        />

        <unnnic-input
          v-model="userSearch"
          :type="userError ? 'error' : 'normal'"
          :message="userError"
          :label="$t('orgs.create.user_search')"
          :placeholder="$t('orgs.create.user_search_description')"
          icon-right="keyboard-return-1"
          :tooltip-icon-right="$t('orgs.create.press_enter_to_add')"
          :tooltip-side-icon-right="'bottom'"
          :tooltip-force-open-icon-right="forceTooltipPressEnterOpen"
          @keyup.enter="onSubmit"
          @input="userError = null"
          :disabled="loadingAddingUser"
        />
      </div>
      <div class="weni-org-permissions__list">
        <org-role
          v-for="user in permissions"
          :disabled="loading || isOwner(user)"
          :role="user.role"
          :key="user.uuid"
          :email="user.user__email"
          :name="isMe(user) ? $t('orgs.you') : user.user__username"
          :image-url="user.user__photo"
          @onChangeRole="onEdit($event, user)"
          @onDelete="onRemove(user)" />
        <infinite-loading @infinite="fetchPermissions" />
      </div>
      <div class="weni-org-permissions__separator" />
      <unnnic-button
        :disabled="loading || noChanges()"
        class="weni-org-permissions__button"
        type="secondary"
        @click="saveChanges()">
        {{ $t('orgs.save') }}
      </unnnic-button>
      <confirm-modal
        :open="removingUser != null"
        type="danger"
        :title="removeTitle"
        :description="removeText"
        :confirmText="removeTitle"
        :cancelText="$t('cancel')"
        @close="removingUser = null"
        @confirm="removeRole(removingUser)"
      />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import OrgRole from './orgRole.vue';
import OrgPermissionSelect from './orgPermissionSelect';
import InfiniteLoading from '../InfiniteLoading';
import { unnnicCallModal } from '@weni/unnnic-system';
import ConfirmModal from '../ConfirmModal';

export default {
  name: 'OrgPermissions',
  components: {
    OrgRole,
    OrgPermissionSelect,
    InfiniteLoading,
    ConfirmModal,
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
      role: 3,
      loading: false,
      page: 1,
      complete: false,
      error: false,
      changes: {},
      removingUser: null,
      userError: null,
      userSearch: '',
      forceTooltipPressEnterOpen: true,
      loadingAddingUser: false,
    };
  },
  computed: {
    userLogged() {
      return JSON.parse(localStorage.getItem('user'));
    },

    removeTitle() {
      if (!this.removingUser) return '';
      if (this.isOwner(this.removingUser)) return this.$t('orgs.leave');
      return this.$t('orgs.remove_member');
    },
    removeText() {
      if(!this.removingUser) return '';
      if (this.isOwner(this.removingUser)) return this.$t('orgs.leave_description');
      return this.$t('orgs.remove_member_description', 
          { user: this.removingUser.user__username, 
            org: this.org.name })
    },
  },
  methods: {
    ...mapActions([
      'getMembers',
      'addAuthorization',
      'changeAuthorization',
      'removeAuthorization',
      'leaveOrg',
      'searchUsers',
    ]),

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
    noChanges() {
      return Object.values(this.changes).length === 0;
    },
    async onSubmit() {
      this.loadingAddingUser = true;

      try {
        const email = this.userSearch.toLowerCase();

        const response = await this.searchUsers({
          search: email,
        });

        console.log('users found', response.data);

        const { data } = response;

        const users = data.filter(user => user.email === email);

        if (!users.length) {
          this.userError = this.$t('orgs.invalid_email');
          return false;
        }

        this.forceTooltipPressEnterOpen = false;

        const [ user ] = users;

        const addedUser = {
          role: this.role,
          uuid: Math.random(),
          user__id: user.id,
          user__username: user.username,
          user__email: user.email,
          user__photo: user.photo,
        }

        this.$set(this.changes, addedUser.user__id, addedUser);

        this.permissions.push(addedUser);

        this.userSearch = '';
        this.role = '3';
      } catch (e) {
        this.users = [];
      } finally {
        this.loadingAddingUser = false;
      }
    },
    isMe(user) {
      return user.user__username === this.userLogged.username;
    },
    isOwner(user) {
      return user.is_admin;
    },
    onEdit(role, user) {
      if (!this.changes[user.user__id]) {
        this.$set(
          this.changes,
          user.user__id,
          this.permissions.find(userPermission => userPermission.user__id === user.user__id)
        );
      }

      this.changes[user.user__id].role = role;
    },
    async saveChanges() {
      const changes = Object.values(this.changes).map(
        async (change) => {
          await this.changeRole(change.role, change.user__id);
      });
      this.loading = true;
      await Promise.all(changes);
      this.loading = false;
      unnnicCallModal({
        props: {
          text: this.error ? this.$t('orgs.error') : this.$t('orgs.saved_changes'),
          description: this.error ? this.$t('orgs.save_error') : this.$t('orgs.save_success'),
          scheme: this.error ? "feedback-green" : "feedback-red",
          icon: "check-circle-1",
        },
      });

      if (!this.error) {
        this.$emit('finish');
      }

      this.error = false;
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
    async onLeaveOrg(user) {
      try { 
        await this.leaveOrg({
          orgId: this.org.uuid,
          username: user.user__id,
        });
        unnnicCallModal({
          props: {
            text: this.$t('orgs.saved_changes'),
            description: this.$t('orgs.saved_changes_success'),
            scheme: "feedback-green",
            icon: "check-circle-1",
          },
        });
        this.$emit('finish');
      } catch(e) {
        unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: "feedback-red",
            icon: "check-circle-1",
        },
      });
      } finally {
        this.removingUser = null;
      }
    },
    async removeRole(user) {
      if (this.isOwner(user)) {
        this.onLeaveOrg(user);
        return;
      }
      try { 
        await this.removeAuthorization({
          orgId: this.org.uuid,
          username: user.user__id,
        });
        this.$emit('finish');
        unnnicCallModal({
          props: {
            text: this.$t('orgs.removed_member'),
            description: this.$t('orgs.removed_member_success', { user: user.user__username }),
            scheme: "feedback-green",
            icon: "check-circle-1",
          },
        });
      } catch(e) {
        unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: "feedback-red",
            icon: "check-circle-1",
        },
      });
      } finally {
        this.removingUser = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
  .weni-org-permissions {
    display: flex;
    flex-direction: column;
    &__field {
      display: flex;
      margin: 0 0 $unnnic-spacing-stack-md 0;
    }
    &__permission-select {
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