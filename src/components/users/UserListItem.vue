<template>
  <div class="user-list-item">
    <Avatar
      :imageUrl="photo"
      size="sm"
    />

    <div class="user-details">
      <div
        v-if="name"
        class="name"
      >
        <span :title="name">{{ name }}</span>
      </div>

      <div class="email">
        <span :title="email">{{ email }}</span>
      </div>
    </div>

    <UnnnicTag
      v-if="status"
      :text="status"
      scheme="feedback-yellow"
      class="status"
    />

    <div class="actions">
      <UnnnicButton
        v-if="disabled"
        type="tertiary"
        size="small"
        disabled
      >
        {{ inputTitle }}
      </UnnnicButton>

      <UnnnicMultiSelect
        v-else
        :modelValue="filterChatsIfModerator(groups)"
        :inputTitle="inputTitle"
        :disabled="deleting"
        @update:model-value="setGroups($event)"
      />

      <UnnnicToolTip
        v-if="isMe || !disabled"
        side="left"
        enabled
        :text="isMe ? $t('orgs.users.leave') : $t('orgs.users.remove')"
        class="delete-button"
      >
        <UnnnicIconSvg
          scheme="neutral-clean"
          size="sm"
          icon="cancel"
          clickable
          @click="onDelete"
        />
      </UnnnicToolTip>
    </div>
  </div>
</template>

<script>
import Avatar from '../Avatar.vue';
import getEnv from '@/utils/env';
import { mapActions } from 'vuex';
import {
  PROJECT_ROLE_MODERATOR,
  createProjectGeneralRolesObject,
  createProjectChatRolesObject,
  createAttendantRoleObject,
  CHAT_ROLE_AGENT,
  PROJECT_ROLE_CHATUSER,
} from './permissionsObjects';

export default {
  components: {
    Avatar,
  },

  props: {
    projectName: String,
    projectUuid: String,
    photo: String,
    name: String,
    email: String,
    status: String,
    isMe: Boolean,
    hasChat: Boolean,
    deleting: Boolean,
    role: Number,
    chatRole: Number,
    disabled: Boolean,
  },

  data() {
    return {
      groups: [],
    };
  },

  computed: {
    inputTitle() {
      if (
        this.groups.filter((group) => group.selected === -1).length ===
        this.groups.length
      ) {
        return this.$t('roles.select');
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

    roles() {
      const generalPermissionGroup = this.groups.find(
        (group) => group.id === 'general',
      );

      const generalPermissionValue = generalPermissionGroup
        ? generalPermissionGroup.items[generalPermissionGroup.selected]?.value
        : null;

      const chatPermissionGroup = this.groups.find(
        (group) => group.id === 'chat',
      );

      let chatPermissionValue = chatPermissionGroup
        ? chatPermissionGroup.items[chatPermissionGroup.selected]?.value
        : null;

      return {
        role: generalPermissionValue,
        chatRole: chatPermissionValue,
      };
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

    let role = this.role;

    if (this.role === PROJECT_ROLE_CHATUSER) {
      role = 'attendant';
    }

    const generalPermissionGroup = this.groups.find(
      (group) => group.id === 'general',
    );

    generalPermissionGroup.selected = generalPermissionGroup.items.findIndex(
      (item) => item.value === role,
    );

    const chatPermissionGroup = this.groups.find(
      (group) => group.id === 'chat',
    );

    if (chatPermissionGroup) {
      chatPermissionGroup.selected = chatPermissionGroup.items.findIndex(
        (item) => item.value === this.chatRole,
      );
    }
  },

  methods: {
    ...mapActions([
      'createOrUpdateProjectAuthorization',
      'removeProjectAuthorization',
      'openModal',
    ]),

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

    async setGroups(groups) {
      groups.forEach((group) => {
        this.groups.forEach((group2) => {
          if (group2.id === group.id) {
            group2.selected = group.selected;
          }
        });
      });

      try {
        let role = this.roles.role;
        let chatRole = this.roles.chatRole;

        if (!this.hasChat && getEnv('MODULES_YAML').chats) {
          if (role === PROJECT_ROLE_MODERATOR) {
            chatRole = 1; // admin
          } else if (role === 'attendant') {
            role = PROJECT_ROLE_CHATUSER;
            chatRole = CHAT_ROLE_AGENT; // attendant
          }
        }

        const { data } = await this.createOrUpdateProjectAuthorization({
          email: this.email,
          projectUuid: this.projectUuid,
          role,
          chatRole: chatRole || CHAT_ROLE_AGENT, // temp
          hasChat: this.hasChat,
        });

        this.$emit('changed-role', {
          email: data.data.email,
          role: data.data.role,
          chatRole: this.hasChat
            ? data.data.rocket_authorization
            : data.data.chats_role,
        });
      } catch (error) {
        console.log(error);
      }
    },

    async onDelete() {
      let title = '';
      let description = '';
      let validate = null;

      if (this.isMe) {
        title = this.$t('orgs.leave.title');
        description = this.$t('orgs.leave_description');
        validate = {
          label: this.$t('orgs.leave.confirm_with_name', {
            name: this.projectName,
          }),
          placeholder: this.$t('orgs.leave.confirm_with_name_placeholder'),
          text: this.projectName,
        };
      } else {
        title = this.$t('orgs.remove_member');
        description = this.$t('orgs.remove_member_description', {
          user: this.name,
          org: this.projectName,
        });
      }

      this.openModal({
        type: 'confirm',
        data: {
          persistent: true,
          scheme: 'feedback-red',
          title,
          description,
          validate,
          cancelText: this.$t('cancel'),
          confirmText: title,
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.removeProjectAuthorization({
                email: this.email,
                projectUuid: this.projectUuid,
              });

              this.$emit('delete');
            } catch (error) {
              console.log(error);
            }

            setLoading(false);

            justClose();
          },
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.user-list-item {
  display: flex;
  align-items: center;

  :deep(.weni-avatar) {
    margin-right: $unnnic-spacing-inline-xs;
    min-width: $unnnic-icon-size-xl;
  }

  .user-details {
    overflow: hidden;
    flex: 1;
    min-width: 3rem;

    .name,
    .email {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
    }

    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-darkest;
    }

    .email {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: $unnnic-font-weight-regular;
      color: $unnnic-color-neutral-cloudy;
    }
  }

  .status {
    margin: $unnnic-spacing-inline-xs;
    user-select: none;
  }

  .actions {
    display: flex;
    align-items: center;
    margin-left: $unnnic-spacing-inline-xs;

    .normal-multiselect {
      :deep(.select-content) {
        min-width: 349px;
        z-index: 2;
        right: 0;
      }
    }

    .delete-button {
      margin-left: $unnnic-spacing-inline-xs;
    }
  }
}
</style>
