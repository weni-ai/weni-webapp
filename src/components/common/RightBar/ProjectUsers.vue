<template>
  <div class="manage-members">
    <div :class="['manage-members__header', type]">
      <template v-if="type === 'manage'">
        <UnnnicInputNext
          v-model="memberEmail"
          size="md"
          :label="$t('orgs.roles.add_member')"
          @keypress.enter="addMember"
          :disabled="addingMember"
          :error="emailError"
        />

        <div>
          <UnnnicMultiSelect
            :label="$t('orgs.roles.permission')"
            :groups="filterChatsIfModerator(groups)"
            @change="setGroups($event)"
            :inputTitle="inputTitle || $t('roles.select')"
            :disabled="addingMember"
            :class="{ 'margin-bottom-error': emailError }"
          />
        </div>

        <UnnnicButton
          @click="addMember"
          :disabled="
            addingMember ||
            !inputTitle ||
            !memberEmail.trim().length ||
            !!emailError
          "
          type="primary"
          size="large"
          :class="{ 'margin-bottom-error': emailError }"
        >
          {{ $t('add') }}
        </UnnnicButton>
      </template>

      <template v-else-if="type === 'read'">
        <UnnnicInput
          v-model="memberEmail"
          size="md"
          :label="$t('projects.members.search.label')"
          :placeholder="$t('projects.members.search.placeholder')"
        />
      </template>
    </div>

    <div class="user-list">
      <UserListItem
        v-for="user in type === 'read'
          ? users.filter((user) => user.email.includes(memberEmail))
          : users"
        :key="user.email"
        class="user-item"
        :projectUuid="projectUuid"
        :projectName="projectName"
        :photo="user.photo"
        :name="user.username"
        :email="user.email"
        :isMe="user.isMe"
        :status="user.status"
        :role="user.role"
        :chatRole="user.chatRole"
        :hasChat="hasChat"
        :deleting="deletingUsers.includes(user.email)"
        @delete="deleteUser(user.email)"
        @changed-role="$emit('changed-role-authorization', $event)"
        :disabled="type === 'read'"
      ></UserListItem>
    </div>
  </div>
</template>

<script>
import getEnv from '../../../utils/env';
import UserListItem from '../../users/UserListItem.vue';
import {
  CHAT_ROLE_AGENT,
  createAttendantRoleObject,
  createProjectChatRolesObject,
  createProjectGeneralRolesObject,
  PROJECT_ROLE_CHATUSER,
  PROJECT_ROLE_MODERATOR,
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
    emailError() {
      if (
        this.memberEmail.trim().length &&
        !this.rules.email.test(this.memberEmail.trim())
      ) {
        return this.$t('errors.invalid_email');
      }

      if (
        this.users.some(
          ({ email }) =>
            email.toLowerCase() === this.memberEmail.trim().toLowerCase(),
        )
      ) {
        return this.$t('orgs.users.already_added');
      }

      return false;
    },

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
      createProjectGeneralRolesObject(
        !this.hasChat && getEnv('MODULES_YAML').chats,
      ),
    ];

    if (this.hasChat) {
      this.groups.push(createProjectChatRolesObject());
    } else if (getEnv('MODULES_YAML').chats) {
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
          generalPermissionValue = PROJECT_ROLE_CHATUSER;
          chatPermissionValue = CHAT_ROLE_AGENT;
        }

        const { data } = await this.createOrUpdateProjectAuthorization({
          email: this.memberEmail.trim().toLowerCase(),
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
.margin-bottom-error {
  margin-bottom: $unnnic-spacing-stack-md;
}

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
