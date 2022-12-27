<template>
  <div class="manage-members">
    <div :class="['manage-members__header', type]">
      <template v-if="type === 'manage'">
        <unnnic-input
          v-model="memberEmail"
          size="md"
          :label="$t('orgs.roles.add_member')"
          @keypress.enter="addMember"
          :disabled="addingMember"
        />

        <div>
          <unnnic-multi-select
            :label="$t('orgs.roles.permission')"
            :groups="filterChatsIfModerator(groups)"
            @change="setGroups($event)"
            :input-title="inputTitle || $t('roles.select')"
            :disabled="addingMember"
          />
        </div>

        <unnnic-button
          @click="addMember"
          :disabled="addingMember || !inputTitle"
          type="primary"
          size="large"
        >
          {{ $t('add') }}
        </unnnic-button>
      </template>

      <template v-else-if="type === 'read'">
        <unnnic-input
          v-model="memberEmail"
          size="md"
          :label="$t('projects.members.search.label')"
          :placeholder="$t('projects.members.search.placeholder')"
        />
      </template>
    </div>

    <div class="user-list">
      <user-list-item
        v-for="user in type === 'read'
          ? users.filter((user) => user.email.includes(memberEmail))
          : users"
        :key="user.email"
        class="user-item"
        :project-uuid="projectUuid"
        :project-name="projectName"
        :photo="user.photo"
        :name="user.username"
        :email="user.email"
        :is-me="user.isMe"
        :status="user.status"
        :role="user.role"
        :chat-role="user.chatRole"
        :has-chat="hasChat"
        :deleting="deletingUsers.includes(user.email)"
        @delete="deleteUser(user.email)"
        @changed-role="$emit('changed-role-authorization', $event)"
        :disabled="type === 'read'"
      ></user-list-item>
    </div>
  </div>
</template>

<script>
import getEnv from '../../../utils/env';
import UserListItem from '../../users/UserListItem.vue';
import {
  createAttendantRoleObject,
  createProjectChatRolesObject,
  createProjectGeneralRolesObject,
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_VIEWER,
} from '../../users/permissionsObjects';
import { mapActions } from 'vuex';

export default {
  components: {
    UserListItem,
  },

  props: {
    type: String,
    projectUuid: String,
    projectName: String,
    authorizations: Array,
    pendingAuthorizations: Array,
    hasChat: Boolean,
  },

  data() {
    return {
      memberEmail: '',
      addingMember: false,
      groups: [],
      users: [],
      deletingUsers: [],
    };
  },

  computed: {
    inputTitle() {
      if (
        this.groups.filter((group) => group.selected === -1).length ===
        this.groups.length
      ) {
        return null;
      }

      return this.filterChatsIfModerator(this.groups)
        .map((group) =>
          group.selected === -1
            ? null
            : group.items.find((item, index) => group.selected === index)
                ?.title,
        )
        .filter((value) => value)
        .join(', ');
    },
  },

  created() {
    this.groups = [
      createProjectGeneralRolesObject(!this.hasChat && getEnv('MODULE_CHATS')),
    ];

    if (this.hasChat) {
      this.groups.push(createProjectChatRolesObject());
    } else if (getEnv('MODULE_CHATS')) {
      this.groups
        .find(({ id }) => id === 'general')
        .items.push(createAttendantRoleObject());
    }

    this.groups.forEach((group) => (group.selected = -1));

    this.users = this.pendingAuthorizations
      .map((user) => ({
        ...user,
        status: 'Pending',
      }))
      .concat(
        this.authorizations.map((user) => ({
          ...user,
          status: null,
        })),
      )
      .map((user) => ({
        username:
          user.username === this.$store.state.Account.profile.username
            ? this.$t('orgs.you')
            : [user.first_name, user.last_name].join(' '),
        email: user.email,
        photo: user.photo_user,
        role: user.project_role,
        chatRole: this.hasChat ? user.rocket_authorization : user.chats_role,
        isMe: user.username === this.$store.state.Account.profile.username,
        status: user.status,
      }));
  },

  methods: {
    ...mapActions(['createOrUpdateProjectAuthorization']),

    async deleteUser(userEmail) {
      this.users = this.users.filter(({ email }) => email !== userEmail);

      this.$emit('deleted-authorization', userEmail);
    },

    setGroups(groups) {
      groups.forEach((group) => {
        this.groups.forEach((group2) => {
          if (group2.id === group.id) {
            group2.selected = group.selected;
          }
        });
      });
    },

    filterChatsIfModerator(groups) {
      const generalPermissionGroup = this.groups.find(
        (group) => group.id === 'general',
      );

      const generalPermissionValue =
        generalPermissionGroup.items[generalPermissionGroup.selected]?.value;

      return groups.filter((group) => {
        if (
          group.id === 'chat' &&
          generalPermissionValue === PROJECT_ROLE_MODERATOR
        ) {
          return false;
        }

        return true;
      });
    },

    async addMember() {
      const generalPermissionGroup = this.groups.find(
        (group) => group.id === 'general',
      );

      let generalPermissionValue =
        generalPermissionGroup.items[generalPermissionGroup.selected]?.value;

      const chatPermissionGroup = this.groups.find(
        (group) => group.id === 'chat',
      );

      let chatPermissionValue = chatPermissionGroup
        ? chatPermissionGroup.items[chatPermissionGroup.selected]?.value
        : null;

      try {
        this.addingMember = true;

        if (generalPermissionValue === 'attendant') {
          generalPermissionValue = PROJECT_ROLE_VIEWER;
          chatPermissionValue = 2;
        }

        const { data } = await this.createOrUpdateProjectAuthorization({
          email: this.memberEmail,
          projectUuid: this.projectUuid,
          role: generalPermissionValue,
          chatRole: chatPermissionValue,
        });

        this.users.push({
          username: data.data.email,
          email: data.data.email,
          photo: data.data.photo_user,
          role: data.data.role,
          chatRole: data.data.chats_role,
          isMe: false,
          status: data.data.is_pendent ? 'Peding' : null,
        });

        this.$emit('added-authorization', {
          isPending: data.data.is_pendent,
          authorization: {
            username: data.data.username,
            email: data.data.email,
            first_name: data.data.first_name,
            last_name: data.data.last_name,
            project_role: data.data.role,
            photo_user: data.data.photo_user,
            rocket_authorization: data.data.rocket_authorization,
            chats_role: data.data.chats_role,
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.addingMember = false;
      }

      this.memberEmail = '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.normal-multiselect {
  ::v-deep .select-content {
    min-width: 349px;
    z-index: 2;
    right: 0;
  }

  ::v-deep h6 {
    white-space: nowrap;
  }
}

.manage-members {
  &__header.manage {
    width: 100%;
    display: grid;
    grid-template-columns: 11fr 8fr 6fr;
    gap: 8px;
    align-items: flex-end;
  }

  .user-list {
    margin-top: $unnnic-spacing-stack-md;
    .user-item + .user-item {
      margin-top: $unnnic-spacing-stack-sm;
    }
  }
}
</style>