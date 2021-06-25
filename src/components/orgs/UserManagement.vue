<template>
  <div>
    <div class="group">
      <unnnic-input
        class="flex-1"
        v-model="userSearch"
        :type="userError ? 'error' : 'normal'"
        :message="userError"
        :label="labelEmail"
        :placeholder="$t('orgs.create.user_search_description')"
        @keyup.enter="onSubmit"
        @input="userError = null"
        :disabled="loadingAddingUser"
      />

      <div class="group__right">
        <unnnic-button
          @click="onSubmit"
          type="secondary"
          :disabled="!userSearch || loadingAddingUser"
          :class="userError ? 'org__button-fix-margin' : ''"
        >
          {{ $t('orgs.create.org_add_user') }}
        </unnnic-button>
      </div>
    </div>

    <div class="users">
      <div>
        <org-role
          v-for="(user, index) in users"
          :disabled="isMe(user) || user.disabledRole"
          :role="user.role"
          :key="index"
          :email="user.email"
          :username="user.username"
          :name="isMe(user) ? $t('orgs.you') : user.name"
          :image-url="user.photo"
          :delete-tooltip="
            isMe(user) ? $t('orgs.users.leave') : $t('orgs.users.remove')
          "
          :can-delete="cannotDeleteMyUser ? !isMe(user) : true"
          :status="capitalize(user.status && $t(`status.${user.status}`))"
          @onChangeRole="onEdit($event, user)"
          @onDelete="onRemove(user)"
          class="user"
        />
        <infinite-loading
          v-if="!doNotFetch"
          @infinite="$emit('fetch-permissions', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import OrgRole from './orgRole.vue';
import InfiniteLoading from '../InfiniteLoading';
import { unnnicCallModal, unnnicButton } from '@weni/unnnic-system';
import _ from 'lodash';
import orgs from '../../api/orgs';

export default {
  components: {
    OrgRole,
    InfiniteLoading,
    unnnicButton,
  },

  props: {
    labelRole: {
      type: String,
    },

    labelEmail: {
      type: String,
    },

    tooltipSideIconRight: {
      type: String,
    },

    users: {
      type: Array,
    },

    changes: {
      type: Object,
    },

    doNotFetch: {
      type: Boolean,
    },

    cannotDeleteMyUser: {
      type: Boolean,
    },

    org: {
      type: Object,
      default() {
        return {};
      },
    },

    alreadyAddedText: {
      type: String,
    },
  },

  data() {
    return {
      role: '3',

      userSearch: '',
      userError: null,
      forceTooltipPressEnterOpen: true,

      loadingAddingUser: false,

      removingUser: null,
    };
  },

  methods: {
    ...mapActions(['searchUsers', 'leaveOrg', 'removeAuthorization']),

    capitalize: _.capitalize,

    isMe(user) {
      return user.username === this.$store.state.Account.profile.username;
    },

    onEdit(role, user) {
      this.$emit('changes', {
        ...this.changes,
        [user.id]: {
          ...user,
          role,
        },
      });
    },

    clearUserFromChanges(user) {
      this.$emit(
        'users',
        this.users.filter((item) => item.username !== user.username),
      );
      delete this.changes[user.id];
      this.$emit('changes', this.changes);
    },

    onRemove(user) {
      if (user.offline) {
        this.clearUserFromChanges(user);
      } else {
        this.removingUser = user.username;

        let title = '';
        let description = '';
        let validate = null;

        if (this.isMe(user)) {
          title = this.$t('orgs.leave.title');
          description = this.$t('orgs.leave_description');
          validate = {
            label: this.$t('orgs.leave.confirm_with_name', {
              name: this.org.name,
            }),
            placeholder: this.$t('orgs.leave.confirm_with_name_placeholder'),
            text: this.org.name,
          };
        } else {
          title = this.$t('orgs.remove_member');
          description = this.$t('orgs.remove_member_description', {
            user: user.name,
            org: this.org.name,
          });
        }

        this.$root.$emit('open-modal', {
          type: 'confirm',
          data: {
            persistent: true,
            icon: 'alert-circle-1',
            scheme: 'feedback-red',
            title,
            description,
            validate,
            cancelText: this.$t('cancel'),
            confirmText: title,
            onConfirm: (justClose, { setLoading }) => {
              setLoading(true);

              this.removeRole(() => {
                setLoading(false);
                justClose();
              });
            },
          },
        });
      }
    },

    async removeRole(callback) {
      const user = this.users.find(
        (user) => user.username === this.removingUser,
      );

      if (this.isMe(user)) {
        this.onLeaveOrg(user.username);
        return;
      }
      try {
        if (user.status === 'pending') {
          await orgs.deleteRequestPermission({
            organization: this.org.uuid,
            id: user.id,
          });
        } else {
          await this.removeAuthorization({
            orgId: this.org.uuid,
            username: user.id,
          });
        }

        callback();

        this.$emit('finish');
        this.clearUserFromChanges(user);

        this.$root.$emit('open-modal', {
          type: 'alert',
          data: {
            icon: 'check-circle-1-1',
            scheme: 'feedback-green',
            title: this.$t('orgs.removed_member'),
            description: this.$t('orgs.removed_member_success', {
              user: this.removingUser,
            }),
          },
        });
      } catch (e) {
        unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: 'feedback-red',
            icon: 'check-circle-1',
          },
        });
      } finally {
        this.removingUser = null;
      }
    },

    async onLeaveOrg(username) {
      try {
        await this.leaveOrg({
          orgId: this.org.uuid,
          username,
        });

        this.$root.$emit('open-modal', {
          type: 'alert',
          data: {
            icon: 'check-circle-1-1',
            scheme: 'feedback-green',
            title: this.$t('orgs.users.left', { name: this.org.name }),
            description: this.$t('orgs.users.left_description'),
          },
        });
        this.$emit('finish');
      } catch (e) {
        unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: 'feedback-red',
            icon: 'check-circle-1',
          },
        });
      } finally {
        this.removingUser = null;
      }
    },

    async onSubmit() {
      this.loadingAddingUser = true;

      const email = this.userSearch.toLowerCase();

      if (!this.rules.email.test(email)) {
        this.userError = this.$t('errors.invalid_email');
        this.loadingAddingUser = false;
        return false;
      }

      if (this.users.find((user) => user.email === email)) {
        this.userError = this.alreadyAddedText;
        this.loadingAddingUser = false;
        return false;
      }

      try {
        const { data } = await this.searchUsers({
          search: email,
        });

        const users = data.filter((user) => user.email === email);

        let addedUser = null;

        if (users.length) {
          const [user] = users;

          addedUser = {
            id: user.id,
            uuid: Math.random(),
            name: [user.first_name, user.last_name]
              .filter((name) => name)
              .join(' '),
            email: user.email,
            photo: user.photo,
            role: this.role,
            username: user.username,
            offline: true,
          };
        } else {
          addedUser = {
            id: email,
            uuid: Math.random(),
            name: email,
            email: email,
            photo: null,
            role: this.role,
            username: email,
            offline: true,
            status: 'pending',
          };
        }

        this.$emit('changes', {
          ...this.changes,
          [addedUser.id]: addedUser,
        });

        this.$emit('users', this.users.concat(addedUser));

        this.userSearch = '';
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingAddingUser = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.group {
  display: flex;
  margin-bottom: $unnnic-spacing-stack-md;

  &__right {
    align-self: flex-end;
    .org__button-fix-margin {
      margin-bottom: $unnnic-spacing-stack-md - 0.0625;
    }
  }

  > *:not(:last-child) {
    margin-right: $unnnic-spacing-stack-sm;
  }

  .flex-1 {
    flex: 1;
  }
}

.users {
  flex: 1;

  $scroll-size: $unnnic-inline-nano;
  padding-right: calc(#{$unnnic-inline-xs} + #{$scroll-size});
  width: 100%;

  &::-webkit-scrollbar {
    width: $scroll-size;
  }

  &::-webkit-scrollbar-thumb {
    background: $unnnic-color-neutral-clean;
    border-radius: $unnnic-border-radius-pill;
  }

  &::-webkit-scrollbar-track {
    background: $unnnic-color-neutral-soft;
    border-radius: $unnnic-border-radius-pill;
  }

  .user:not(:last-child) {
    margin-bottom: $unnnic-spacing-stack-sm;
  }
}
</style>
