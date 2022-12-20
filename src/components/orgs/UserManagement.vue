<template>
  <div>
    <div class="group">
      <template v-if="type === 'manage'">
        <unnnicInput
          v-model="userSearch"
          size="md"
          :label="$t('orgs.roles.add_member')"
          :placeholder="$t('orgs.roles.add_member_placeholder')"
          :type="userError ? 'error' : 'normal'"
          :message="userError"
          @input="userError = null"
          @keypress.enter="onSubmit"
          :disabled="loadingAddingUser || loading"
        />

        <div class="multiSelect">
          <unnnic-dropdown>
            <unnnic-input
              :label="$t('orgs.roles.permission')"
              size="md"
              slot="trigger"
              icon-right="arrow-button-down-1"
              readonly
              :value="inputTitle"
              :disabled="loadingAddingUser || loading"
              :class="userError ? 'org__button-fix-margin' : ''"
            ></unnnic-input>

            <unnnic-dropdown-item @click="groups[0].selected = 0">
              <h4>{{ $t('orgs.roles.admin') }}</h4>
              <span>
                {{ $t('orgs.roles.admin_description') }}
              </span>
            </unnnic-dropdown-item>

            <unnnic-dropdown-item @click="groups[0].selected = 1">
              <h4>{{ $t('orgs.roles.financial') }}</h4>
              <span>
                {{ $t('orgs.roles.financial_description') }}
              </span>
            </unnnic-dropdown-item>

            <unnnic-dropdown-item @click="groups[0].selected = 2">
              <h4>{{ $t('orgs.roles.contributor') }}</h4>
              <span>
                {{ $t('orgs.roles.contributor_description') }}
              </span>
            </unnnic-dropdown-item>
          </unnnic-dropdown>
        </div>

        <unnnicButton
          @click="onSubmit"
          :disabled="!userSearch || loadingAddingUser || loading"
          :class="userError ? 'org__button-fix-margin' : ''"
          type="primary"
          size="large"
          style="flex: 1"
        >
          {{ $t('add') }}
        </unnnicButton>
      </template>

      <template v-else-if="type === 'read'">
        <search-user
          :value="searchName"
          @input="$emit('update:search-name', $event)"
          @reset="$emit('reset')"
          class="weni-org-permissions__input"
          :label="$t('orgs.create.user_search')"
          :placeholder="$t('orgs.create.user_search_description')"
        />
      </template>
    </div>

    <div class="users">
      <org-role
        v-for="(user, index) in users"
        :disabled="isMe(user) || user.disabledRole || type === 'read'"
        :role="user.role"
        :key="index"
        :email="user.email"
        :username="user.username"
        :name="isMe(user) ? $t('orgs.you') : user.name"
        :image-url="user.photo"
        :delete-tooltip="
          isMe(user) ? $t('orgs.users.leave') : $t('orgs.users.remove')
        "
        :can-delete="
          type === 'read' ? false : cannotDeleteMyUser ? !isMe(user) : true
        "
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
</template>

<script>
import { mapActions } from 'vuex';
import OrgRole from './orgRole.vue';
import InfiniteLoading from '../InfiniteLoading';
import { unnnicCallModal } from '@weni/unnnic-system';
import _ from 'lodash';
import orgs from '../../api/orgs';
import SearchUser from './searchUser';

export default {
  model: {
    prop: 'users',
    event: 'change',
  },

  components: {
    OrgRole,
    InfiniteLoading,
    SearchUser,
  },

  props: {
    type: String,

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

  data() {
    return {
      role: '3',

      userSearch: '',
      userError: null,
      forceTooltipPressEnterOpen: true,

      loadingAddingUser: false,

      removingUser: null,

      groups: [],
    };
  },

  mounted() {
    this.groups = [
      {
        id: 'general',
        title: 'Permissões da Organização',
        selected: -1,
        items: [
          {
            value: 3,
            title: this.$t('orgs.roles.admin'),
            description: this.$t('orgs.roles.admin_description'),
          },
          {
            value: 4,
            title: this.$t('orgs.roles.financial'),
            description: this.$t('orgs.roles.financial_description'),
          },
          {
            value: 2,
            title: this.$t('orgs.roles.contributor'),
            description: this.$t('orgs.roles.contributor_description'),
          },
        ],
      },
    ];
  },

  computed: {
    inputTitle() {
      if (
        this.groups.filter((group) => group.selected === -1).length ===
        this.groups.length
      ) {
        return this.$t('roles.select');
      }

      return this.groups
        .map(
          (group) =>
            group.items.find((item, index) => group.selected === index)?.title,
        )
        .join(', ');
    },
  },

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
          'change',
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
        'change',
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

        const role = this.groups
          .map(
            (group) =>
              group.items.find((item, index) => group.selected === index)
                ?.value,
          )
          .join('');

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
          this.$emit('change', this.users.concat(addedUser));
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.unnnic-dropdown {
  ::v-deep .unnnic-dropdown__trigger {
    width: 100%;
  }

  ::v-deep .unnnic-dropdown__content {
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
    margin-bottom: $unnnic-spacing-stack-md - 0.0625;
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
  ::v-deep .select-content {
    min-width: 349px;
    z-index: 2;
    right: 0;
  }
}
</style>
