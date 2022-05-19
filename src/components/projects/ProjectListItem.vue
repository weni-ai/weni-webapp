<template>
  <div class="weni-project-list-item">
    <unnnic-card-project
      :name="name"
      :action-text="$t('projects.join')"
      @action="onClick({ name: 'home', params: { projectUuid: project.uuid } })"
      :statuses="statusList"
    >
      <template slot="actions">
        <unnnic-dropdown-item
          @click="
            onClick({
              name: 'project',
              params: { projectUuid: project.uuid, internal: ['init'] },
            })
          "
        >
          <unnnic-icon-svg size="sm" icon="cog-1" />
          {{ $t('projects.config') }}
        </unnnic-dropdown-item>

        <unnnic-dropdown-item
          v-if="canManageMembers"
          @click="isMemberManagementBarOpen = !isMemberManagementBarOpen"
        >
          <unnnic-icon-svg size="sm" icon="single-neutral-actions-1" />
          {{ $t('orgs.manage_members') }}
        </unnnic-dropdown-item>

        <unnnic-dropdown-item
          v-else-if="canViewMembers"
          @click="isMemberViewerBarOpen = !isMemberViewerBarOpen"
        >
          <unnnic-icon-svg size="sm" icon="single-neutral-actions-1" />
          {{ $t('projects.view_members') }}
        </unnnic-dropdown-item>
      </template>
    </unnnic-card-project>

    <container-right-sidebar
      max-width="43.125rem"
      v-model="isMemberManagementBarOpen"
      :title="$t('orgs.manage_members')"
      :description="$t('orgs.manage_members_description')"
      class="manage-members"
    >
      <div class="manage-members__header">
        <unnnicInput
          v-model="memberEmail"
          size="md"
          :label="$t('orgs.roles.add_member')"
          @keypress.enter="addMember"
          :disabled="addingMember"
        />

        <div>
          <unnnicMultiSelect
            :label="$t('orgs.roles.permission')"
            v-model="groups"
            :input-title="inputTitle"
            :disabled="addingMember"
          />
        </div>

        <unnnicButton @click="addMember" type="primary" size="large">
          {{ $t('add') }}
        </unnnicButton>
      </div>

      <div class="user-list">
        <user-list-item
          v-for="user in users"
          :key="user.uuid"
          class="user-item"
          :project-uuid="project.uuid"
          :project-name="project.name"
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
        ></user-list-item>
      </div>
    </container-right-sidebar>

    <container-right-sidebar
      max-width="43.125rem"
      v-model="isMemberViewerBarOpen"
      :title="$t('projects.view_members')"
      :description="$t('projects.view_members_description')"
      class="manage-members"
    >
      <div>
        <unnnic-input
          v-model="memberEmail"
          size="md"
          :label="$t('projects.members.search.label')"
          :placeholder="$t('projects.members.search.placeholder')"
        />
      </div>

      <div class="user-list">
        <user-list-item
          v-for="user in users.filter((user) =>
            user.email.includes(memberEmail),
          )"
          :key="user.uuid"
          class="user-item"
          :project-uuid="project.uuid"
          :project-name="project.name"
          :photo="user.photo"
          :name="user.username"
          :email="user.email"
          :is-me="user.isMe"
          :status="user.status"
          :role="user.role"
          :has-chat="hasChat"
          :deleting="deletingUsers.includes(user.email)"
          disabled
          @delete="deleteUser(user.email)"
        ></user-list-item>
      </div>
    </container-right-sidebar>
  </div>
</template>

<script>
import ContainerRightSidebar from '@/components/ContainerRightSidebar.vue';
import UserListItem from '../users/UserListItem.vue';
import { mapGetters, mapActions } from 'vuex';
import {
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_CONTRIBUTOR,
  createProjectGeneralRolesObject,
  createProjectChatRolesObject,
} from '../users/permissionsObjects';

export default {
  name: 'ProjectListItem',

  components: {
    ContainerRightSidebar,
    UserListItem,
  },

  props: {
    project: {
      type: Object,
    },
    name: {
      type: String,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
    owner: {
      type: String,
      default: null,
    },
    aiCount: {
      type: Number,
    },
    contactCount: {
      type: Number,
    },
    flowsCount: {
      type: Number,
    },
    authorizations: {
      type: Object,
    },
    pendingAuthorizations: {
      type: Object,
    },
  },

  data() {
    return {
      addingMember: false,
      memberEmail: '',

      deletingUsers: [],

      isMemberManagementBarOpen: false,
      isMemberViewerBarOpen: false,

      groups: [],
    };
  },

  created() {
    this.groups = [createProjectGeneralRolesObject()];

    if (this.hasChat) {
      this.groups.push(createProjectChatRolesObject());
    }
  },

  computed: {
    ...mapGetters(['currentOrg']),

    canManageMembers() {
      return this.project.authorization.role === PROJECT_ROLE_MODERATOR;
    },

    canViewMembers() {
      return this.project.authorization.role === PROJECT_ROLE_CONTRIBUTOR;
    },

    hasChat() {
      return Boolean(this.project.menu.chat.length);
    },

    users() {
      return this.pendingAuthorizations.users
        .map((user) => ({
          ...user,
          status: 'Pending',
        }))
        .concat(
          this.authorizations.users
            .map((user) => ({
              ...user,
              status: null,
            }))
            .map((user) => ({
              username:
                user.username === this.$store.state.Account.profile.username
                  ? this.$t('orgs.you')
                  : [user.first_name, user.last_name].join(' '),
              email: user.email,
              photo: user.photo_user,
              role: user.project_role,
              chatRole: user.rocket_authorization,
              isMe:
                user.username === this.$store.state.Account.profile.username,
              status: user.status,
            })),
        );
    },

    inputTitle() {
      return this.groups
        .map(
          (group) =>
            group.items.find((item, index) => group.selected === index)?.title,
        )
        .join(', ');
    },

    statusList() {
      return [
        {
          title: this.$t('projects.ai'),
          icon: 'science-fiction-robot-2',
          scheme: 'aux-blue',
          count: this.aiCount,
        },
        {
          title: this.$t('projects.flows'),
          icon: 'hierarchy-3-2',
          scheme: 'aux-purple',
          count: this.flowsCount,
        },
        {
          title: this.$t('projects.contacts'),
          icon: 'single-neutral-actions-1',
          scheme: 'aux-lemon',
          count: this.contactCount,
        },
      ];
    },
  },

  methods: {
    ...mapActions(['createOrUpdateProjectAuthorization']),

    onClick(route) {
      this.$emit('click', route);
    },

    async deleteUser(userEmail) {
      this.deletingUsers.push(userEmail);

      setTimeout(() => {
        this.deletingUsers.splice(this.deletingUsers.indexOf(userEmail), 1);
      }, 1000);

      this.$emit('deleted-authorization', userEmail);
    },

    async addMember() {
      const generalPermissionGroup = this.groups.find(
        (group) => group.id === 'general',
      );

      const generalPermissionValue =
        generalPermissionGroup.items[generalPermissionGroup.selected].value;

      const chatPermissionGroup = this.groups.find(
        (group) => group.id === 'chat',
      );

      let chatPermissionValue = chatPermissionGroup
        ? chatPermissionGroup.items[chatPermissionGroup.selected].value
        : null;

      try {
        this.addingMember = true;

        const { data } = await this.createOrUpdateProjectAuthorization({
          email: this.memberEmail,
          projectUuid: this.project.uuid,
          role: generalPermissionValue,
          chatRole: chatPermissionValue,
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
.weni-project-list-item {
  border-radius: $unnnic-border-radius-md;
}

::v-deep .unnnic-card-project .header .buttons .unnnic-dropdown {
  user-select: none;

  .unnnic-dropdown__content {
    align-items: flex-start;

    > a {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      min-width: max-content;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      width: 100%;

      & + a {
        margin-top: $unnnic-spacing-stack-sm;
      }

      > .unnnic-icon {
        margin-right: $unnnic-spacing-inline-xs;
        margin-left: 0;
      }
    }
  }
}

::v-deep .unnnic-dropdown-item + .unnnic-dropdown-item:before {
  content: none;
}

.manage-members {
  &__header {
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

.normal-multiselect {
  ::v-deep .select-content {
    min-width: 349px;
    z-index: 2;
    right: 0;
  }
}
</style>
