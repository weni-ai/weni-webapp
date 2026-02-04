<template>
  <div>
    <div class="group">
      <template v-if="type === 'manage'">
        <UnnnicFormElement :label="$t('orgs.roles.add_member')">
          <UnnnicInput
            v-model="userSearch"
            :placeholder="$t('orgs.roles.add_member_placeholder')"
            :errors="emailError"
            :disabled="loadingAddingUser || loading"
            @keypress.enter="onSubmit"
          />
        </UnnnicFormElement>

        <div class="multiSelect">
          <OrgUserRoleSelect
            v-model="role"
            type="input"
            :disabled="loadingAddingUser || loading"
            :class="{ 'org__button-fix-margin': emailError }"
          />
        </div>

        <UnnnicButton
          :disabled="
            loadingAddingUser ||
            loading ||
            !userSearch.trim().length ||
            !!emailError
          "
          :class="{ 'org__button-fix-margin': emailError }"
          type="primary"
          size="large"
          :style="{ flex: 1, minWidth: `8rem` }"
          @click="onSubmit"
        >
          {{ $t('add') }}
        </UnnnicButton>
      </template>

      <template v-else-if="type === 'read'">
        <SearchUser
          :modelValue="searchName"
          class="weni-org-permissions__input"
          :label="$t('orgs.create.user_search')"
          :placeholder="$t('orgs.create.user_search_description')"
          @update:model-value="$emit('update:search-name', $event)"
          @reset="$emit('reset')"
        />
      </template>
    </div>

    <div class="users">
      <OrgRole
        v-for="(user, index) in users"
        :key="index"
        :disabled="isMe(user) || user.disabledRole || type === 'read'"
        :role="user.role"
        :email="user.email"
        :username="user.username"
        :name="isMe(user) ? $t('orgs.you') : user.name"
        :imageUrl="user.photo"
        :deleteTooltip="
          isMe(user) ? $t('orgs.users.leave') : $t('orgs.users.remove')
        "
        :canDelete="
          type === 'read' ? false : cannotDeleteMyUser ? !isMe(user) : true
        "
        :status="capitalize(user.status && $t(`status.${user.status}`))"
        class="user"
        @on-change-role="onEdit($event, user)"
        @on-delete="onRemove(user)"
      />
      <InfiniteLoading
        v-if="!doNotFetch"
        @infinite="$emit('fetch-permissions', $event)"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import OrgRole from './orgRole.vue';
import InfiniteLoading from '../InfiniteLoading.vue';
import Unnnic from '@weni/unnnic-system';
import _ from 'lodash';
import orgs from '../../api/orgs';
import SearchUser from './searchUser.vue';
import OrgUserRoleSelect from './OrgUserRoleSelect.vue';

export default {
  components: {
    OrgRole,
    InfiniteLoading,
    SearchUser,
    OrgUserRoleSelect,
  },

  props: {
    type: String,

    users: {
      type: Array,
    },

    doNotFetch: {
      type: Boolean,
    },

    cannotDeleteMyUser: {
      type: Boolean,
    },

    loading: {
      type: Boolean,
    },

    offline: {
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

    searchName: String,
  },

  emits: ['update:users'],

  data() {
    return {
      role: '3',

      userSearch: '',
      forceTooltipPressEnterOpen: true,

      loadingAddingUser: false,

      removingUser: null,
    };
  },

  computed: {
    emailError() {
      if (
        this.userSearch.trim().length &&
        !this.rules.email.test(this.userSearch.trim())
      ) {
        return this.$t('errors.invalid_email');
      }

      if (
        this.users.some(
          ({ email }) =>
            email?.toLowerCase() === this.userSearch.trim().toLowerCase(),
        )
      ) {
        return this.$t('orgs.users.already_in');
      }

      return false;
    },
  },

  mounted() {},

  methods: {
    ...mapActions([
      'searchUsers',
      'leaveOrg',
      'removeAuthorization',
      'openModal',
    ]),

    capitalize: _.capitalize,

    isMe(user) {
      return user.username === this.$store.state.Account.profile.username;
    },

    onEdit(role, user) {
      if (this.offline) {
        this.$emit(
          'update:users',
          this.users.map((item) =>
            item.email === user.email ? { ...user, role } : item,
          ),
        );
      } else {
        this.$emit('change-role', {
          id: user.id,
          role,
        });
      }
    },

    clearUserFromChanges(user) {
      this.$emit(
        'update:users',
        this.users.filter((item) => item.username !== user.username),
      );
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

        this.openModal({
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
            onConfirm: async (justClose, { setLoading }) => {
              setLoading(true);
              await this.removeRole();
              setLoading(false);

              justClose();
            },
          },
        });
      }
    },

    async removeRole() {
      const user = this.users.find(
        (user) => user.username === this.removingUser,
      );

      if (this.isMe(user)) {
        await this.onLeaveOrg(user.id);
        this.$emit('remove-user', this.removingUser);
        this.removingUser = null;
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

        this.clearUserFromChanges(user);

        this.openModal({
          type: 'alert',
          data: {
            icon: 'check_circle',
            scheme: 'feedback-green',
            title: this.$t('orgs.removed_member'),
            description: this.$t('orgs.removed_member_success', {
              user: this.removingUser,
            }),
          },
        });
      } catch (e) {
        Unnnic.unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: 'feedback-red',
            icon: 'check_circle',
          },
        });
      } finally {
        this.$emit('remove-user', this.removingUser);
        this.removingUser = null;
      }
    },

    async onLeaveOrg(id) {
      try {
        await this.leaveOrg({
          orgId: this.org.uuid,
          id,
        });

        this.openModal({
          type: 'alert',
          data: {
            icon: 'check_circle',
            scheme: 'feedback-green',
            title: this.$t('orgs.users.left', { name: this.org.name }),
            description: this.$t('orgs.users.left_description'),
          },
        });

        this.$emit('finish');
      } catch (e) {
        Unnnic.unnnicCallModal({
          props: {
            text: this.$t('orgs.error'),
            description: this.$t('orgs.save_error'),
            scheme: 'feedback-red',
            icon: 'check_circle',
          },
        });
      }
    },

    async onSubmit() {
      this.loadingAddingUser = true;

      const email = this.userSearch.trim().toLowerCase();

      try {
        const { data } = await this.searchUsers({
          search: email,
        });

        const users = data.filter((user) => user.email === email);

        let addedUser = null;

        const role = this.role;

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
            role,
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
            role,
            username: email,
            offline: true,
            status: 'pending',
          };
        }

        if (this.offline) {
          this.$emit('update:users', this.users.concat(addedUser));
        } else {
          this.$emit('add', addedUser);
        }

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
.unnnic-dropdown {
  :deep(.unnnic-dropdown__trigger) {
    width: 100%;
  }

  :deep(.unnnic-dropdown__content) {
    min-width: calc(276px - 32px);

    a > span {
      width: 100%;
      display: block;
      font-weight: $unnnic-font-weight-light;
    }

    h4 {
      font-weight: $unnnic-font-weight-regular;
    }

    h4,
    a > span {
      margin: 0;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-size: $unnnic-font-size-body-md;
      color: $unnnic-color-neutral-dark;
    }
  }
}

.group {
  display: flex;
  margin-bottom: $unnnic-spacing-stack-md;
  align-items: flex-end;
  width: 100%;

  > div {
    width: 100%;
  }

  .unnnic-form {
    max-width: 280px;
  }

  .multiSelect {
    max-width: 196px;
  }

  .org__button-fix-margin {
    margin-bottom: $unnnic-spacing-stack-md;
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

.normal-multiselect {
  :deep(.select-content) {
    min-width: 349px;
    z-index: 2;
    right: 0;
  }
}
</style>
