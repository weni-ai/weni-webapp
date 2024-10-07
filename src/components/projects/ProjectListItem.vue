<template>
  <div class="weni-project-list-item">
    <UnnnicCardProject
      :name="name"
      :actionText="$t('projects.join')"
      @action="onClick({ name: 'home', params: { projectUuid: project.uuid } })"
      :statuses="statusList"
    >
      <template #actions>
        <UnnnicDropdownItem
          @click="
            onClick({
              name: 'settingsProject',
              params: { projectUuid: project.uuid, internal: ['init'] },
            })
          "
        >
          <UnnnicIconSvg
            size="sm"
            icon="settings"
          />
          {{ $t('projects.config') }}
        </UnnnicDropdownItem>

        <UnnnicDropdownItem
          v-if="canManageMembers"
          @click="
            $store.dispatch('openRightBar', {
              props: {
                type: 'ProjectManageUsers',
                projectUuid: project.uuid,
                projectName: project.name,
                projectAuthorizations: authorizations.users,
                projectPendingAuthorizations: pendingAuthorizations.users,
                projectHasChat: hasChat,
              },

              events: {
                'added-authorization': addedAuthorization,
                'deleted-authorization': deleteUser,
                'changed-role-authorization': changedRoleAuthorization,
              },
            })
          "
        >
          <UnnnicIconSvg
            size="sm"
            icon="person"
          />
          {{ $t('orgs.manage_members') }}
        </UnnnicDropdownItem>

        <UnnnicDropdownItem
          v-if="canManageMembers"
          @click="openEditProject"
        >
          <UnnnicIconSvg
            size="sm"
            icon="pencil-write-1"
          />
          {{ $t('projects.edit_name') }}
        </UnnnicDropdownItem>

        <UnnnicDropdownItem
          v-else-if="canViewMembers"
          @click="
            $store.dispatch('openRightBar', {
              props: {
                type: 'ProjectReadUsers',
                projectUuid: project.uuid,
                projectName: project.name,
                projectAuthorizations: authorizations.users,
                projectPendingAuthorizations: pendingAuthorizations.users,
                projectHasChat: hasChat,
              },

              events: {
                'deleted-authorization': deleteUser,
              },
            })
          "
        >
          <UnnnicIconSvg
            size="sm"
            icon="person"
          />
          {{ $t('projects.view_members') }}
        </UnnnicDropdownItem>
      </template>
    </UnnnicCardProject>
  </div>
</template>

<script>
import {
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_CONTRIBUTOR,
} from '../users/permissionsObjects';
import { get } from 'lodash';

export default {
  name: 'ProjectListItem',

  components: {},

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
    return {};
  },

  watch: {
    'project.uuid': {
      immediate: true,
      handler() {
        if (
          get(this.$route, 'query.edit_project_uuid') === this.project.uuid &&
          !window.alreadyOpenedEditProject
        ) {
          window.alreadyOpenedEditProject = true;
          this.openEditProject();
        }
      },
    },
  },

  computed: {
    canManageMembers() {
      return this.project.authorization.role === PROJECT_ROLE_MODERATOR;
    },

    canViewMembers() {
      return this.project.authorization.role === PROJECT_ROLE_CONTRIBUTOR;
    },

    hasChat() {
      return false;
    },

    statusList() {
      return [
        {
          title: this.$t('projects.ai'),
          icon: 'neurology',
          scheme: 'aux-blue',
          count: this.aiCount,
        },
        {
          title: this.$t('projects.flows'),
          icon: 'account_tree',
          scheme: 'aux-purple',
          count: this.flowsCount,
        },
        {
          title: this.$t('projects.contacts'),
          icon: 'person',
          scheme: 'aux-lemon',
          count: this.contactCount,
        },
      ];
    },
  },

  methods: {
    openEditProject() {
      if (!this.canManageMembers) {
        return;
      }

      this.$store.dispatch('openRightBar', {
        props: {
          type: 'ProjectSettings',
          projectUuid: this.project.uuid,
          projectName: this.project.name,
          projectDescription: this.project.description,
          projectTimezone: this.project.timezone,
          projectAuthorizations: this.authorizations.users,
          projectPendingAuthorizations: this.pendingAuthorizations.users,
          projectHasChat: this.hasChat,
        },

        events: {
          'added-authorization': this.addedAuthorization,
          'deleted-authorization': this.deleteUser,
          'changed-role-authorization': this.changedRoleAuthorization,
          'updated-project': this.updatedProject,
        },
      });
    },

    addedAuthorization($event) {
      this.$emit('added-authorization', $event);
    },

    onClick(route) {
      this.$emit('click', route);
    },

    async deleteUser(userEmail) {
      this.$emit('deleted-authorization', userEmail);
    },

    changedRoleAuthorization($event) {
      this.$emit('changed-role-authorization', $event);
    },
    updatedProject($event) {
      this.$emit('updated-project', $event);
    },
  },
};
</script>

<style lang="scss" scoped>
.weni-project-list-item {
  border-radius: $unnnic-border-radius-md;
}

:deep(.unnnic-card-project .header .buttons .unnnic-dropdown) {
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

:deep(.unnnic-dropdown-item + .unnnic-dropdown-item:before) {
  content: none;
}
</style>
