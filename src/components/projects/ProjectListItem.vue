<template>
  <div class="weni-project-list-item">
    <UnnnicCardProject
      :name="name"
      :description="project.description"
      :status="project.status"
      :canUpdateStatus="canUpdateProjectStatus"
      clickable
      @change-project-status="$emit('projectUpdateStatus', $event)"
      @click="
        onClick({
          name: 'home',
          params: { projectUuid: project.uuid },
          openInNewTab: $event.button,
        })
      "
    >
      <template #actions>
        <section class="weni-project-list-item__actions">
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
        </section>
      </template>
    </UnnnicCardProject>
  </div>
</template>

<script>
import {
  PROJECT_ROLE_MODERATOR,
  PROJECT_ROLE_CONTRIBUTOR,
  PROJECT_ROLE_CHATUSER,
  PROJECT_ROLE_VIEWER,
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
  emits: [
    'updated-project',
    'changed-role-authorization',
    'deleted-authorization',
    'click',
    'added-authorization',
    'projectUpdateStatus',
  ],

  data() {
    return {};
  },

  computed: {
    canManageMembers() {
      return this.project.authorization.role === PROJECT_ROLE_MODERATOR;
    },

    canViewMembers() {
      return this.project.authorization.role === PROJECT_ROLE_CONTRIBUTOR;
    },

    canUpdateProjectStatus() {
      return ![PROJECT_ROLE_CHATUSER, PROJECT_ROLE_VIEWER].includes(
        this.project.authorization.role,
      );
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
          projectLanguage: this.project.language,
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

  &__actions {
    display: grid;
    gap: $unnnic-spacing-nano;
  }
}

:deep(.unnnic-dropdown-item) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: max-content;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
}
</style>
